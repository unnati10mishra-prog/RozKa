# 02 — Requirements

Priority: **M** = must (MVP), **S** = stretch (ordered), **N** = non-goal.
IDs are referenced from 08-test-strategy.

## 1. Functional requirements

### Items
| ID | P | Requirement |
|---|---|---|
| F-01 | M | Add an item with only a name (Hindi or English) and unit. Everything else optional and defaultable. |
| F-02 | M | Unit choices: नग/piece, दर्जन/dozen, किलो/kg, ग्राम/g, लीटर/litre, पैकेट/packet. Dozen = 12 pieces display-conversion; kg/g interchangeable. |
| F-03 | M | Quantities accept decimals and fractions (0.5, 1.5, "½"). Never force integers. |
| F-04 | M | Search items by Hindi, English or Hinglish (transliterated) text. |
| F-05 | M | Quick grid shows the shop's most-sold items first (auto-ordered by recent sales). |
| F-06 | S | Per-item optional fields: pack size (e.g. 12 per carton), lead time days, minimum level, price, barcode. |
| F-07 | M | **Lazy item creation:** a search with no match offers "नया सामान जोड़ें"; creates the item from name and unit only, in ≤ 2 taps. |
| F-08 | M | **Starter pack:** offered on first run and in Settings; adds ~40 common items (Hindi + English names, units) with stock 0, idempotent, fully offline. |

### Stock in and sales
| ID | P | Requirement |
|---|---|---|
| F-10 | M | **Record sale:** tap item tile = sell 1 default unit. Tap the quantity chip to change (big stepper + presets: ½, 1, 2, 5, dozen). |
| F-11 | M | Every sale shows an **Undo** toast for ≥ 6 s. No confirm dialogs. |
| F-12 | M | **Add stock:** pick item, enter quantity (stepper/presets), Save. Save button is fixed at thumb height; never below the fold. |
| F-13 | M | Manual **correction** ("ginti theek karo"): set actual count; recorded as an adjustment, not as a sale. |
| F-14 | M | Current stock shown next to each item; negative stock allowed but flagged (owner forgot to log a stock-in). |
| F-15 | M | All entries timestamped locally; entering for a past time is not required. |

### Reorder (the product)
| ID | P | Requirement |
|---|---|---|
| F-20 | M | **Reorder sheet** lists items that are low: either stock ≤ min level (if set) or days-of-cover below threshold (see 04 §6). Each row: item, stock left, plain reason in Hindi ("2 din ka maal bacha"). |
| F-21 | M | **Not-moving list:** items with stock > 0 and no sale in N days (default 45; chemist 30). Row shows days idle and a rough value locked if price known. |
| F-22 | M | Owner can mark a row "ordered" (hides it until next sale cycle) or "ignore this item". |
| F-23 | S1 | **Suggested order quantity** from observed sales velocity, lead time and cover days; rounded up to pack size. |
| F-24 | S2 | **WhatsApp share:** builds a Hindi text list of items + quantities, opens `wa.me` / Web Share. No server involved. |
| F-25 | S3 | **Expiry:** optional expiry date per stock-in (month/year picker). "Expiring in 60 days" list; sells earliest-expiry batch first (FEFO). |
| F-26 | S4 | **Barcode scan** via camera (BarcodeDetector API, JS fallback). Scan = pick item; unknown barcode → "naya item?" |
| F-27 | S5 | **Multiple shops:** switch shop from header; each shop has isolated stock; owner-level combined reorder view optional. |

### Settings, data safety
| ID | P | Requirement |
|---|---|---|
| F-30 | M | Language toggle Hindi / English / Hinglish; default Hindi (Devanagari). |
| F-31 | M | Export all data to a single JSON file; import it back (restore after phone change). |
| F-32 | M | Request persistent storage (`navigator.storage.persist()`); show a gentle warning if denied. |
| F-33 | S | Optional sync to a user-owned endpoint later; MVP has none. |
| F-34 | M | First-run: no sign-up, no permissions asked until needed (camera only when scanning). |

### Non-goals
| ID | P | Requirement |
|---|---|---|
| F-90 | N | Invoices, GST, customers, udhaar, payments, discounts, multi-user roles. |

## 2. Non-functional requirements

| ID | Category | Requirement |
|---|---|---|
| N-01 | Offline | After first successful load, every M feature works with network fully off, including cold start and reload. |
| N-02 | Performance | Tap-to-recorded ≤ 100 ms perceived on a 2 GB RAM Android; Reorder sheet renders ≤ 300 ms for 1,000 items / 50,000 movements. |
| N-03 | Size | First load ≤ 150 KB gzipped JS+CSS (excluding fonts); fonts subset or system Devanagari. |
| N-04 | Ergonomics | Tap targets ≥ 56 px; primary actions ≥ 64 px; primary actions in the bottom 40% of the screen; no horizontal scroll; usable one-handed in portrait. |
| N-05 | Language | All user-visible strings via i18n table; no English-only jargon in Hindi mode (no "SKU", "inventory", "dashboard", "sync"). |
| N-06 | Numeric | Quantities stored as integers in milli-units to avoid float drift; displayed trimmed ("1.5", not "1.500"). |
| N-07 | Accessibility | Contrast ≥ 4.5:1; font ≥ 18 px body; works in bright sunlight (high-contrast theme default); haptic feedback on save where supported. |
| N-08 | Reliability | Writes are transactional; killing the app mid-save never corrupts or double-records. |
| N-09 | Privacy | No analytics, no third-party scripts, no network calls at all in MVP except fetching the app itself. |
| N-10 | Compatibility | Android Chrome 100+ (primary), iOS Safari 16.4+ (best effort), installable PWA. |

## 3. Ranked "taps budget"

| Task | Budget |
|---|---|
| Sell 1 of a quick-grid item | 1 tap |
| Sell a different quantity | 2–3 taps (tile → chip → preset) |
| Add stock to an existing item | ≤ 4 taps (Stock-in → item → qty preset → Save) |
| Add brand-new item with stock | ≤ 6 interactions |
| See what to reorder | 1 tap from home |

## 4. Acceptance summary
The MVP is accepted when F-01…F-34 (M rows), N-01, N-04, N-05, N-06 pass the checks in 08-test-strategy, including aeroplane-mode cold start.
