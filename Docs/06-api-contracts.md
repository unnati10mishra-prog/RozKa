# 06 — API Contracts

There is **no network API in the MVP** (offline-only). The contracts that matter are the internal TypeScript module boundaries (the "API" between UI, domain and data), the export/import file format, the share-text format, and the *reserved* sync contract for later.

## 1. Conventions
- All quantities are integer **milli-units** (`Milli = number`); money is integer paise.
- Time is `ms epoch` (device clock).
- Every function returns `Promise<Result<T, AppError>>`. No thrown exceptions across module boundaries.
- IDs are ULID strings.

```ts
type Milli = number;
type Result<T,E=AppError> = { ok:true; value:T } | { ok:false; error:E };
type AppError = { code:'NOT_FOUND'|'INVALID_QTY'|'UNIT_MISMATCH'|'STORAGE'|'CONFLICT'; messageKey:string };
```
`messageKey` is an i18n key, never a raw English string.

## 2. Ledger service (`domain/ledger.ts`)

```ts
recordSale(itemId: string, qty?: Milli): Result<Movement>      // qty defaults to item.default_sale_milli
addStock(itemId: string, qty: Milli, opts?: { expiry?: string }): Result<Movement>
adjustTo(itemId: string, actual: Milli): Result<Movement>      // creates ±delta adjust movement
undo(movementId: string): Result<Movement>                     // writes a 'void' movement
```
Guarantees: one IndexedDB transaction per call (movement + `items.stock_milli` + `daily_rollups`); idempotent on movement id; `qty > 0` else `INVALID_QTY`; sale below zero stock is **allowed** and flagged.

## 3. Items service (`data/repo.ts`)

```ts
createItem(input: { name:string; displayUnit:Unit; defaultSale?:Milli; openingStock?:Milli }): Result<Item>
updateItem(id: string, patch: Partial<ItemEditable>): Result<Item>
archiveItem(id: string): Result<void>
searchItems(q: string, limit?: number): Result<Item[]>          // Hindi/English/Hinglish
quickGrid(limit = 24): Result<Item[]>                           // pinned first, then sale taps in last 14 days (daily_rollups)
seedStarterPack(packId: 'kirana'|'chemist'|'hardware'|'stationery'): Result<{ added: number }>   // idempotent via items.seed_key; stock 0, stock_verified=false
```

## 4. Units (`domain/units.ts`)

```ts
parseQty(input: string, unit: Unit): Result<Milli>              // '1.5','½','आधा','डेढ़','1/2'
formatQty(m: Milli, unit: Unit, lang: Lang): string             // 12000,'dozen','hi' → '1 दर्जन'
toBase(value: number, unit: Unit): Milli
```
Examples (must be in unit tests): `parseQty('1.5','kg') → 1500` · `parseQty('आधा','kg') → 500` · `parseQty('½','dozen') → 6000` · `parseQty('0,25','kg') → 250` · `parseQty('abc','kg') → INVALID_QTY`.

## 5. Reorder engine (`domain/reorder.ts`)

```ts
type ReorderRow = {
  itemId: string; name: string;
  stock: Milli; velocityPerDay: number; daysLeft: number | null;
  suggestQty?: Milli;                    // stretch S1
  reason: 'below_min'|'running_out'|'out_of_stock';
  confidence: 'low'|'ok'|'high';
};
type DeadRow = { itemId:string; name:string; stock:Milli; idleDays:number; lockedPaise?:number };

getReorderSheet(shopId: string, now?: number): Result<{ low: ReorderRow[]; dead: DeadRow[] }>
markOrdered(itemId: string, untilTs?: number): Result<void>
ignoreItem(itemId: string): Result<void>
```
Determinism: same ledger + same `now` ⇒ same output (required for tests). Sorted: low by `daysLeft` ascending (out-of-stock first); dead by locked value desc, else idle days desc.

## 6. Share (`domain/share.ts`) — stretch

```ts
buildOrderText(rows: ReorderRow[], shop: Shop, lang: Lang): string
shareOrder(text: string): Promise<'shared'|'wa_link'|'copied'>
```
Text format (Hindi, plain, no emoji dependence for rendering safety):

```
नमस्ते, {दुकान का नाम} से ऑर्डर:
1. चीनी — 25 किलो
2. चाय पत्ती — 4 पैकेट
3. आटा — 2 बोरी (10 किलो)
कृपया कल तक भेज दें। धन्यवाद
```
Order of attempts: `navigator.share({text})` → `https://wa.me/?text=<urlencoded>` → clipboard. Never includes stock levels, prices or other customers' data.

## 7. Backup contract (`data/backup.ts`)

```ts
exportAll(): Promise<Blob>                       // application/json, filename stocksaathi-YYYYMMDD.json
importAll(file: File, mode:'merge'|'replace'): Result<{items:number; movements:number}>
```
Schema in 05 §6. `importAll` validates: `app === 'stocksaathi'`, `schema <= current`, IDs are ULIDs, quantities are safe integers, no unknown `type`. Anything failing ⇒ `STORAGE` error and **no partial write** (single transaction).

## 8. Service Worker ↔ app messages

| Message (postMessage) | Direction | Meaning |
|---|---|---|
| `SW_READY` | SW → app | Precache complete; UI may show "ऑफलाइन तैयार ✓" |
| `SW_UPDATE_AVAILABLE` | SW → app | New build waiting |
| `SKIP_WAITING` | app → SW | Apply update (only when user is idle) |

## 9. Reserved: sync endpoint (not built in MVP)

If added later, the device pushes ledger rows it has not yet acknowledged. Movements are immutable and keyed by ULID, so merge is a set-union.

```
POST /v1/shops/{shopId}/movements:batch
Authorization: Bearer <device token>
{ "device_id": "...", "movements": [ Movement, ... ] }
→ 200 { "accepted": [ids], "duplicate": [ids] }

GET /v1/shops/{shopId}/movements?since=<ulid>
→ 200 { "movements": [...], "next": "<ulid>" }
```
Items sync as last-writer-wins by `updated_at`; stock is recomputed from the merged ledger, never copied.

## 10. Error → Hindi message mapping (examples)
| code | messageKey | Hindi |
|---|---|---|
| INVALID_QTY | `err.qty` | "मात्रा सही नहीं है" |
| NOT_FOUND | `err.item_missing` | "यह सामान नहीं मिला" |
| STORAGE | `err.storage` | "फ़ोन में जगह नहीं / डेटा सेव नहीं हुआ" |
