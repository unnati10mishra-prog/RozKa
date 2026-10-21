# 08 — Test Strategy

**Core philosophy:** judges will test **offline, on a phone, with real shop quantities, with one thumb**. The suite mirrors that reality first, then covers logic, security and performance.

## 1. Test pyramid

| Layer | Tooling | Scope | Frequency |
|---|---|---|---|
| Unit | Vitest | `units.ts`, `reorder.ts`, `share.ts`, search tokens, ledger invariants | every commit |
| Integration | Vitest + `fake-indexeddb` | Transactions, atomic rollback, undo, FEFO, integrity repair, backup import/export | every commit |
| E2E | Playwright (Chromium, mobile viewport 360×800) | Full flows, **offline cold start**, Service Worker lifecycle, starter pack, lazy onboarding | every PR and before demo |
| Real device | Low-end Android (2 GB RAM) + iPhone Safari | Aeroplane mode, thumb reach, sunlight contrast | before each demo |
| Usability time-trial | Stopwatch + paper notebook baseline | Core promise: faster than the notebook (बही-खाता) | before demo |
| Non-functional | Lighthouse, bundle-size gate | PWA, performance, a11y, ≤ 150 KB gz | CI |

## 2. The aeroplane-mode protocol (the judge's golden test)

1. Open the deployed URL **online** on a phone. Wait for the badge "ऑफलाइन तैयार ✓".
2. Install to the home screen.
3. Switch the phone to **aeroplane mode** (Wi-Fi and mobile data off).
4. Force-close the app from recent apps.
5. **Cold-start** from the home-screen icon. Expected: full UI in under 1.5 s, items and stock intact, no spinner, no network error.
6. Record 5 consecutive sales one-handed, add stock, open the Reorder sheet (मंगाओ), export a `.json` backup.
7. Force-stop and reopen; verify data persisted. **Reboot** the phone and repeat step 5.
8. Repeat with Wi-Fi connected but no internet (captive-portal case).
9. Turn the network back on; confirm no error prompts and no blocking spinners.

**Automated analogue:** load → wait for Service Worker `activated` and `SW_READY` → `context.setOffline(true)` → reload → run the full journey (apply starter pack, sell 1.5 kg, mark ordered, open sheet) → assert zero failed or external requests.

## 3. Requirement traceability (MVP unless marked)

| Req | Check |
|---|---|
| F-01, F-02 | E2E + integration: add item with name and unit only; each unit selectable; changing `base_unit` after the first movement is rejected |
| F-03, N-06 | Unit: `parseQty` matrix below; property test `formatQty(parseQty(x)) ≈ x`; three sales of 0.25 kg total exactly 750 milli-units |
| F-04 | Unit: "chini", "चीनी", "cheeni", "sugar", "su" all return the item via the `search_tokens` index; results filtered by shop |
| F-05 | Integration: after 10 sale taps of B and 3 of A in the last 14 days, B precedes A in `quickGrid()`; pinned items come first |
| **F-07** | E2E: search with no match shows "नया सामान जोड़ें"; item created in ≤ 2 taps with name and unit only |
| **F-08** | E2E: applying the starter pack creates ~40 items with stock 0 and `stock_verified=false`; re-applying creates no duplicates (`seed_key`); runs offline |
| F-10, F-11 | E2E: tile tap decrements immediately; Undo within 6 s restores stock and writes a `void` movement; rollups and batch allocations are restored |
| F-12 | E2E at 360×640 with keyboard open: Save fully visible; hit area ≥ 64 px |
| F-13 | Integration: `adjustTo(10)` from 7 writes an `adjust` of +3, sets `stock_verified=true`, and never changes velocity |
| F-14 | Unit: selling past 0 succeeds, stock goes negative, `stock_verified=false`, "?" badge shown |
| F-20, F-21 | Unit fixtures (§4); E2E screenshot of the sheet in Hindi |
| F-22 | Integration: `markOrdered` moves the item to "आने वाला माल"; next `stock_in` clears it; TTL expiry returns it to Low |
| F-25 (S) | Integration: sales consume batches earliest-expiry-first (FEFO); undo restores exact batches; expired batch listed first with red state |
| F-30 | E2E: language toggle; static scan finds no missing keys or English-only labels in Hindi mode (brand names excepted) |
| F-31 | Integration: export → wipe → import restores identical state; malformed files rejected with no partial write; tampered `daily_rollups` ignored and rebuilt |
| F-32 | Unit: mock `persist() → false` and assert the warning renders |
| N-01 | Offline E2E (§2) |
| N-02 | Perf: 1,000 items / 50,000 movements; `getReorderSheet()` ≤ 300 ms under 4× CPU throttle; sale write ≤ 100 ms |
| N-03 | CI gate: gzip(JS+CSS) ≤ 150 KB |
| N-04 | E2E bounding boxes: all controls ≥ 56 px; primary actions ≥ 64 px and in the bottom 40% of the viewport |
| N-05 | Lint: banned words (`SKU`, `inventory`, `dashboard`, `sync`, `KPI`) absent from Hindi strings |
| N-08 | Integration: aborting a transaction mid-write leaves `items`, `movements`, `daily_rollups` and `batches` consistent |
| N-10 | Device matrix (§7) |
| SR-1…SR-7 | Security suite (§6) |

### `parseQty` matrix (must pass 100%)

| Input | Unit | Expected milli |
|---|---|---|
| `1.5` | kg | 1500 |
| `1,5` | kg | 1500 |
| `½` / `आधा` | kg | 500 |
| `डेढ़` | kg | 1500 |
| `1 1/2` | dozen | 18000 |
| `आधा दर्जन` | pc | 6000 |
| `250` | g | 250 |
| `0`, `-1`, `abc`, empty | any | `INVALID_QTY` |
| `0.0004` | kg | `INVALID_QTY` |

## 4. Reorder-engine fixtures (fixed `now`)

| Case | Setup | Expected |
|---|---|---|
| Steady seller | 28 days × 2 kg/day, stock 5 kg, lead 2, safety 1 | days_left 2.5 < 3 → LOW, `running_out` |
| Healthy | same velocity, stock 30 kg | not listed |
| Out of stock | stock 0, sale yesterday | LOW, `out_of_stock`, first in list |
| Young data | 3 days of sales, stock very low | LOW, confidence `low`, badge "अभी 3 दिन का डेटा है" |
| Zero velocity | no sale for 60 days, stock 10 | in `dead`, not in `low` |
| Min-level fallback | stock 4 ≤ min 5, no history | LOW, `below_min` |
| Pack rounding | suggest 17 kg, pack 12 kg | 24 kg |
| Marked ordered | owner marks ordered | in "आने वाला माल", hidden from Low until stock-in or TTL |
| Expiring batch | batch ends in 30 days, `expiry_warn_days` 60 | in `expiring` with red highlight |
| Expired batch | `expiry_ym` earlier than this month | in `expired`, top of sheet, write-off action offered |
| FEFO | batches 2026-12 (5) and 2026-11 (5); sell 7 | 2026-11 emptied, 2026-12 left 3; allocations recorded |
| Clock skew | movement with future `ts` | clamped to `now`; no NaN or ∞ |

## 5. Usability time-trial (the ultimate acceptance test)

Setup: 30 pre-loaded items (starter pack), stopwatch, a paper notebook and pen beside the phone. Three testers including one non-technical person, **one-handed, standing**.

| Task | Notebook | Target |
|---|---|---|
| 1 sale of a fast mover | ~4 s | **≤ 1.5 s** (one tile tap, Undo visible) |
| 1.5 kg of loose sugar | ~6 s | **≤ 3.5 s** (tile → qty chip → 1.5 preset) |
| Add 24 units to an item | ~8 s | **≤ 5 s** (stock-in → item → preset → Save) |
| Find what to reorder | minutes | **≤ 1 s** (one tap on मंगाओ) |

**Blocker rule:** if any core sale task is slower in the app than in the notebook, it is a blocker bug.

## 6. Security and threat tests (from 07)

- **SR-1** No `innerHTML` / `dangerouslySetInnerHTML`: ESLint rule fails the build.
- **SR-2** Strict CSP header present with `connect-src 'self'`: Playwright assertion.
- **SR-3** Zero external requests across a full session (boot, starter pack, sales, sheet, export): network interceptor.
- **SR-4** Import fuzz: 200 mutated or hostile files (> 20 MB, `__proto__` keys, negative or non-integer `qty_milli`, bad ULIDs, unknown enums) → no crash, no partial write, clean error.
- **SR-5** `persist() → false` shows the Hindi storage warning.
- **SR-6 / SR-7** HTTPS/HSTS checked in the deploy smoke script; backup reminder after 7 days or 100 entries covered by a unit test on the timer.
- **T8 (double-submit vs real sales):** three rapid taps on an item tile record **three** sales (tiles are never debounced); a modal **Save** pressed twice within 300 ms records **one** movement; retrying a submit with the same ULID is idempotent.
- **T13 (storage loss):** wipe site data in the test browser → app shows the restore screen; import brings everything back.

## 7. Device matrix

| Device | Priority | Focus |
|---|---|---|
| Low-end Android (2 GB, Chrome) | P0 | Primary demo phone; scroll smoothness, touch size, memory |
| Mid-tier Android (Chrome) | P0 | Standard profile |
| Samsung Internet | P1 | Install flow, decimal keyboard |
| iOS Safari 16.4+ | P2 | Best effort. Safari may evict site data after about 7 days without use; verify the backup reminder appears and restore works (T13) |
| Desktop Chrome, mobile emulation | P2 | Debugging, CI, DevTools offline |

## 8. Exit criteria for demo
1. All **Must** requirements pass in automated suites.
2. Aeroplane protocol (§2) passes on **two physical phones**, from a fresh install and after a reboot.
3. Time-trial targets (§5) met by all three testers.
4. Lighthouse: installable PWA ✓, performance ≥ 90 (mobile), accessibility ≥ 95.
5. Bundle ≤ 150 KB gz and zero external requests (N-03, N-09).
6. A fresh clone builds the same deployable output (see 09-deployment-runbook.md).
