# 02 — Requirements

Priority: **M** = Must (MVP), **S** = Stretch ( strictly ordered S1–S5), **N** = Explicit Non-Goal.
IDs are referenced directly in `08-test-strategy.md`.

---

## 1. Functional Requirements

### 1.1 Items & Catalogue (`सामान`)
| ID | P | Requirement |
|---|---|---|
| **F-01** | M | **Minimal Item Creation:** Add an item with only a **Name** (Hindi or English) and a **Unit** (defaults to `नग / piece`). Everything else (opening stock, min threshold, price) is optional and defaultable. |
| **F-02** | M | **Forgiving Retail Units:** Unit choices: `नग / piece`, `दर्जन / dozen`, `किलो / kg`, `ग्राम / g`, `लीटर / litre`, `पैकेट / packet`, `पत्ता / strip` (chemist), `पेटी / carton`. Display & conversion rules: `1 दर्जन = 12 नग` conversion helper; `kg/g` and `litre/ml` seamlessly interchangeable (`0.25 kg` = `250 g`). |
| **F-03** | M | **Fractional & Loose Quantities:** Quantities accept decimals and Indian fractional presets (`¼ पाव` = 0.25, `½ आधा` = 0.5, `¾ पौना` = 0.75, `1.5 डेढ़`). **Never force integers.** |
| **F-04** | M | **Trilingual Phonetic Search:** Search items instantaneously by Devanagari Hindi (`चीनी`), English (`Sugar`), or transliterated Hinglish (`cheeni`, `chini`). If search finds 0 matches, show a 1-tap **"+ नया सामान जोड़ें: [search text]"** button inline. |
| **F-05** | M | **Smart Fast-Mover Grid:** The main counter automatically pins and orders the shop's most frequently sold items at the top (based on recent 14-day sales count) so 80% of daily sales require zero scrolling or searching. |
| **F-06** | M | **1-Tap Starter Seed & Lazy Onboarding:** First run offers a 1-tap starter template (`किराना`, `मेडिकल / केमिस्ट`, `स्टेशनरी / हार्डवेयर`) with ~20 common items so an owner or judge can test immediately, while also supporting starting from a blank slate. |
| **F-07** | S1 | **Optional Item Metadata:** Per-item optional fields tucked inside an expandable "और जानकारी (More)" drawer: Pack/Carton size (e.g., `12 per पेटी`), Distributor lead time (days), Minimum stock level (`कम से कम स्टॉक`), Cost/Selling price (for dead-stock cash value), and Barcode string. |

---

### 1.2 Stock-In & Sales (`गल्ला / काउंटर`)
| ID | P | Requirement |
|---|---|---|
| **F-10** | M | **1-Tap Sale (`- बिका`):** Tapping an item tile or its primary `-1` button immediately records a sale of 1 default unit. Tapping the **Quantity Chip** opens a thumb-zone bottom sheet with big steppers and fractional presets (`¼`, `½`, `1`, `2`, `5`, `दर्जन (12)`). |
| **F-11** | M | **Non-Blocking Undo Toast:** Every sale or stock-in triggers a bottom toast for **≥ 6 seconds** showing the item, delta, new balance, and a large **`वापस लें (Undo)`** button. **Zero confirmation ("Are you sure?") dialogs anywhere in the core flow.** |
| **F-12** | M | **Fast Stock-In (`+ माल आया`):** Can be triggered directly from the item card (`+` button), from the Reorder Sheet, or via the quick Stock-In mode. Quantity presets adapt to restocking (`+5`, `+10`, `+1 दर्जन`, `+1 पेटी`). The **Save (`सेव करें`)** button is pinned above the keyboard in the bottom thumb zone—**never below the scroll fold**. |
| **F-13** | M | **Manual Stock Correction (`गिनती ठीक करें`):** Allows the owner to overwrite the actual physical shelf count directly. Recorded in the ledger as an `ADJUSTMENT` (`गिनती सुधार`), **never as a fake `SALE` or `RESTOCK`**, so sales velocity math stays uncorrupted. |
| **F-14** | M | **Forgiving Negative Stock:** Current stock balance is displayed clearly on every item tile. If an owner logs a sale before logging opening stock, **negative stock is permitted** and badged gently (`गिनती बाकी / Unverified`) with a 1-tap chip to set actual shelf count—never blocking the sale. |
| **F-15** | M | **Append-Only Local Timestamps:** Every sale, stock-in, and adjustment is written as an immutable local timestamped log entry in `IndexedDB`. Backdating forms are omitted to keep UX fast. |

---

### 1.3 Reorder Sheet (`पर्चा / ऑर्डर लिस्ट` — The Core Product)
| ID | P | Requirement |
|---|---|---|
| **F-20** | M | **Running Low List (`ख़त्म होने वाला माल`):** Plain, high-contrast actionable list (no charts/gauges) of items that need reordering because either: (a) `current_stock ≤ min_level`, or (b) `days_of_cover ≤ lead_time_days + buffer`. Each row shows: **Item Name**, **Current Stock Left**, and a **Plain Hindi Reason** (e.g., *"सिर्फ़ 2 दिन का माल बचा है"* or *"2 किलो ही बचा है"*). |
| **F-21** | M | **Dead Stock / Not-Moving List (`रुका हुआ माल`):** Lists items where `current_stock > 0` and **zero sales have occurred in $N$ days** (default: `45 days` for Kirana/Hardware, `30 days` for Chemist; configurable down to custom days/demo mode for judge testing). Each row shows **Days Idle** (*"60 दिन से नहीं बिका"*) and **Cash Locked** (*"₹1,200 फंसा है"*) if unit cost/price is known. |
| **F-22** | M | **Actionable Row Toggles & 1-Tap Restock Conversion:** Owner can mark a low item as **`मंगवा लिया (Ordered)`** (which moves it to a collapsed "आने वाला माल" section with a 1-tap **`माल आ गया (+ Add to Stock)`** button when delivered) or **`अभी छोड़ें (Snooze / Ignore)`**. |
| **F-23** | S1 | **Velocity-Based Reorder Quantity (`कितना मंगवाएं`):** Computes suggested order quantity from observed daily sales velocity over the active lookback window, lead time, and target cover days ($\text{Order Qty} = \lceil (\text{Daily Velocity} \times (\text{Lead Time} + \text{Cover Days})) - \text{Current Stock} \rceil$), automatically rounded up to the item's `pack_size` if configured. Shows confidence badge if data history is $< 3$ days. |
| **F-24** | S2 | **1-Tap WhatsApp Distributor Share (`WhatsApp पर पर्चा भेजें`):** Formats selected reorder rows into a clean, numbered Hindi/English plain-text note (Item Name + Order Quantity + Unit, with zero prices/margins exposed) and opens WhatsApp via `wa.me/?text=` or `navigator.share()`. Requires zero backend server. |
| **F-25** | S3 | **Chemist Expiry Tracking (`एक्सपायरी ट्रैकिंग`):** Optional Month/Year expiry picker (`MM/YYYY`) during Stock-In. Adds an **`जल्द एक्सपायर होने वाला (Expiring in ≤ 60 days)`** alert group on the Reorder Sheet and automatically deducts sales from the earliest-expiring batch first (**FEFO — First Expiry, First Out**). |
| **F-26** | S4 | **Camera Barcode Scanner (`बारकोड स्कैन`):** Uses native `BarcodeDetector` API (with lightweight JS fallback) via the phone camera. Scanning a known barcode immediately logs a sale or opens stock-in; scanning an unknown barcode opens the inline "नया सामान जोड़ें" sheet with the barcode pre-filled. |
| **F-27** | S5 | **Multi-Shop Switcher (`दुकान बदलें`):** Header pill allows an owner with 2+ branches (e.g., *Ramesh Kirana - Main* vs. *Branch 2*) to switch active shop contexts instantly offline, with isolated `IndexedDB` partitions and an optional combined owner reorder view. |

---

### 1.4 Settings, Language & Data Safety
| ID | P | Requirement |
|---|---|---|
| **F-30** | M | **1-Tap Language Switcher (`अ / A`):** Persistent header toggle between **Hindi (Devanagari — Default)**, **Hinglish**, and **English**. Switching language updates all UI labels and reorder reasons in `< 16 ms` without page reload. |
| **F-31** | M | **Offline Backup Export & Restore (`बैकअप फ़ाइल`):** 1-tap export of the entire local database to a single timestamped `.json` file (shareable to self on WhatsApp or saved to phone Downloads) and 1-tap restore/import with schema validation. |
| **F-32** | M | **Storage Persistence Guard:** Calls `navigator.storage.persist()` on boot to prevent Android Chrome from evicting `IndexedDB` under low-storage pressure; displays a friendly Hindi backup reminder if persistence is not granted. |
| **F-33** | S5 | **Optional Outbox Sync:** Appends mutations to a local `sync_outbox` store in `IndexedDB`. Only attempts background sync if the owner explicitly configures a sync URL/key and `navigator.onLine === true`. |
| **F-34** | M | **Zero-Gate First Run:** No login wall, no phone number OTP, no cloud account, and zero hardware permission prompts on boot (camera permission requested *only* when the user taps the barcode icon). |

---

### 1.5 Explicit Non-Goals
| ID | P | Requirement |
|---|---|---|
| **F-90** | N | **Strictly Excluded:** Customer billing/invoices, thermal receipt printing, GST/HSN tax calculation, customer credit ledger (`उधार खाता`), UPI/payment links, discounts, employee role permissions, or multi-axis analytics charts. |

---

## 2. Non-Functional Requirements

| ID | Category | Requirement |
|---|---|---|
| **N-01** | **Aeroplane-Mode Offline** | **Eager Service Worker Pre-caching:** On the very first load, the Service Worker pre-caches the entire App Shell (HTML, JS, CSS, SVG icons, i18n dictionaries). Every **M** and **S1–S5** local feature must work with the phone in **Aeroplane Mode**, including force-closing the browser and cold-starting from the home screen icon. |
| **N-02** | **Performance** | **Tap-to-Feedback ≤ 50 ms** (optimistic UI update) and `IndexedDB` commit **≤ 100 ms** on a 2 GB RAM Android device. Reorder Sheet computation and render **≤ 250 ms** for a catalogue of 1,000 items and 50,000 movement logs. |
| **N-03** | **Bundle Budget** | Initial load **≤ 150 KB gzipped** (JS + CSS combined). Zero heavy chart libraries, zero external webfont blocking (uses system Devanagari `Noto Sans Devanagari` / system-ui stack). |
| **N-04** | **One-Handed Ergonomics** | All interactive tap targets **≥ 56 × 56 px**; primary action buttons (`-1`, `+ Stock`, `Save`) **≥ 64 px height** and anchored in the **bottom 45% of the viewport**. Zero horizontal scrolling. Zero scrolling required to reach a `Save` button even when the on-screen keyboard is open. |
| **N-05** | **Anti-Jargon Language** | 100% of user-visible strings routed through a strict i18n dictionary. Banned UI terms in any language mode: *"SKU"*, *"Inventory Valuation"*, *"KPI"*, *"Dashboard"*, *"Sync Queue"*, *"Transaction Ledger"*. |
| **N-06** | **Milli-Unit Numeric Precision** | All quantities are stored internally as **integer milli-units** ($\text{stored\_int} = \text{round}(\text{qty} \times 1000)$, so `0.25 kg` = `250`, `1.5 kg` = `1500`) to eliminate IEEE-754 floating-point drift (`0.1 + 0.2 !== 0.30000000000000004`). Displayed with trailing zeros stripped (`1.5`, `½`, `0.25`). |
| **N-07** | **Sunlight & Shop-Floor Accessibility** | High-contrast daylight theme by default (**contrast ratio ≥ 7:1** for primary numbers and item names); body font **≥ 18 px**, quantity badges **≥ 20 px bold**; subtle `navigator.vibrate(15)` haptic pulse on 1-tap sale/save where supported. |
| **N-08** | **Transactional Atomic Writes** | Every stock change executes inside a single atomic `IndexedDB` `readwrite` transaction updating both `items` (current stock, last sold timestamp) and `stock_logs` (movement record). Killing the app mid-write never leaves stock balances out of sync with history. |
| **N-09** | **Privacy & Zero Telemetry** | Zero third-party analytics trackers, zero external CDN dependencies that fail offline, and zero background network calls in MVP. |
| **N-10** | **Platform Compatibility** | Android Chrome 100+ (Primary target), WebAPK / Installable PWA (`manifest.webmanifest` with standalone display), iOS Safari 16.4+ compatible. |

---

## 3. Strict "Taps & Time Budget"

If logging an action takes longer than writing in a physical notebook, the design fails. Every UI flow is benchmarked against these hard ceilings:

| Shopkeeper Task | Max Tap Budget | Target Time | Flow Path |
|---|---|---|---|
| **Sell 1 unit of a fast-mover** | **1 tap** | **< 1.5 sec** | Tap `-1` on item card in Quick Grid → Done (Undo toast appears). |
| **Sell a fractional / custom qty** (e.g., `1.5 kg` or `½ दर्जन`) | **2–3 taps** | **< 4 sec** | Tap item `Qty Chip` → Tap preset (`½` or `1.5`) → Auto-saves (or 1-tap confirm). |
| **Undo an accidental tap** | **1 tap** | **< 1 sec** | Tap `वापस लें (Undo)` on the floating bottom bar within 6 seconds. |
| **Add stock (`माल आया`) to existing item** | **≤ 3 taps** | **< 5 sec** | Tap `+` on item (or from Reorder row) → Tap restock preset (`+10` / `+1 पेटी`) → Tap pinned `सेव करें`. |
| **Add a brand-new item + opening stock** | **≤ 5 interactions** | **< 12 sec** | Type name in search → Tap `+ नया जोड़ें` → Pick unit chip → Tap stock chip → Tap `सेव करें`. |
| **Check what needs reordering (`पर्चा`)** | **1 tap** | **< 1 sec** | Tap bottom nav `पर्चा (Reorder)` tab (badge shows count of low items). |
| **Send order to distributor on WhatsApp** | **2 taps** | **< 3 sec** | From `पर्चा` tab → Tap `WhatsApp पर भेजें` → Choose distributor in WhatsApp. |

---

## 4. Acceptance Summary (Definition of Done)

The MVP build is accepted for judge evaluation only when:
1. All **M** requirements (`F-01` through `F-34`) and core non-functional constraints (`N-01` through `N-08`) pass verification in `08-test-strategy.md`.
2. The app survives the **Aeroplane-Mode Cold Start Test** (Load once → Enable Aeroplane Mode → Force-kill browser → Reopen app → Add item, log fractional sales, view updated Reorder Sheet).
3. Every task in **Section 3 (Taps Budget)** meets or beats its maximum tap count during a one-handed thumb test.