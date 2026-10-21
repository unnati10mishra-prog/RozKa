# 01 — Problem and Scope

**Working name:** Stock Saathi (स्टॉक साथी)  
**One line:** A phone-only, offline-first, Hindi-first app that tells a shop owner what to reorder—getting its data from the 1-tap sales and stock entries the owner makes in seconds between customers.

---

## 1. The Problem

Small neighbourhood shops (kirana, chemist, hardware, stationery) carry hundreds of items at thin margins of a few percent. Inventory lives in a paper notebook (`बही-खाता`) or inside the owner's head. Two failures cost them money every week, in opposite directions:

| Failure | What happens | Real cost to the shop |
|---|---|---|
| **Dead stock (रुका हुआ माल)** | Slow items sit untouched on the shelf for months | Working capital stays locked in stock; expiry write-offs for chemists |
| **Stock-out (माल ख़त्म)** | Fast movers run out on a busy Saturday evening | Lost immediate sale, and the customer walks to the next shop and often does not return |

Existing billing and POS software assumes a desktop computer, a dedicated counter, a trained operator, a barcode gun, and a monthly SaaS fee. Our user has **an entry-level Android phone, one free hand, and thirty seconds between customers**.

---

## 2. Who It Is For

### Primary User: Ramesh-ji (Kirana Owner)
* **Profile:** 45 years old, runs a busy neighbourhood kirana store.
* **Device & Environment:** Entry-level Android phone (2–3 GB RAM, patchy or dead indoor 4G signal, glare on screen).
* **Language:** Reads Hindi (Devanagari) comfortably; recognises English/Hinglish mainly for popular brand names (*Maggi, Parle-G, Crocin*).
* **Behavioural constraint:** Has never used software for the shop. If logging a sale takes longer than scribbling in a notebook, he will abandon the app on Day 1.

### Secondary Users
* **Neeraj-ji (Chemist):** Sells in strips and loose tablets; loses money when batches expire on the shelf (needs batch expiry alerts).
* **Multi-branch Owner:** Runs two shops and needs to switch between or sync branch inventories when connectivity returns.
* **The Distributor (सप्लायर):** Does *not* install the app. Receives a clean, pre-formatted Hindi/English reorder list (`पर्चा`) on WhatsApp.

---

## 3. Core Product Principles

> **1. Reorder is the product. Logging is only how we feed it.**  
> We do not build billing, GST invoices, customer credit (`उधार`), or payment tracking. Every tap exists solely to answer two questions: *"What is running out?"* and *"What hasn't moved?"*

> **2. Faster than a pen, or it fails.**  
> No multi-step forms, no "Add to Cart -> Checkout" flows, and no confirmation popups. A sale is a single thumb tap with a 4-second non-blocking "Undo (`वापस लें`)" toast.

> **3. Forgiving numbers for real Indian retail.**  
> Shops do not sell strictly in integers. They sell `आधा किलो` (0.5 kg), `पाव भर` (0.25 kg), `दर्जन` (12 pcs), and loose tablets. The input model must handle decimals and unit multipliers natively in 1–2 taps.

> **4. Zero jargon.**  
> A label that says "SKU", "Inventory Ledger", or "Sync Queue" has failed. Use everyday shopkeeper language: `माल` (Stock), `बिक्री` (Sale), `मंगवाना है` (To Order), `रुका हुआ माल` (Dead Stock).

---

## 4. Scope

### Must Build First (MVP — "The Smallest Version a Judge Can Use")
1. **Unified 1-Tap Counter (`गल्ला / काउंटर`):** Add stock (`+ माल आया`) and record a sale (`- बिका`) from a single thumb-friendly screen in very few taps. Selling 1 unit of a fast mover = **1 tap** + instant undo toast.
2. **Actionable Reorder Sheet (`पर्चा / ऑर्डर लिस्ट`):** A plain, high-contrast list showing **what is running low** (`ख़त्म होने वाला`) and **what has not moved** (`रुका हुआ माल`) with plain-language reasons. Not an analytics dashboard with charts.
3. **100% Offline-First (Aeroplane Mode Ready):** All data lives locally in `IndexedDB`. A `Service Worker` pre-caches the entire app shell (HTML, CSS, JS, fonts, icons) on first load so the app cold-boots with zero internet.
4. **Hindi + English Bilingual UX:** Devanagari Hindi by default with a 1-tap English toggle (`अ / A`) in the header. Search works across both scripts and phonetic Hinglish.
5. **Forgiving Fractional Quantities:** Native support for loose weights (`kg`, `लीटर`), pieces (`पीस`, `पत्ता`), dozens (`दर्जन`), and quick fractional chips (`+0.25`, `+0.5`, `+1`, `+12`).

### Stretch Goals (In Strict Priority Order After MVP)
1. **Velocity-Based Reorder Quantities:** Automatically calculate *how much* to order based on how fast each item actually sells ($\text{Daily Sales Velocity} \times \text{Lead Time Days} - \text{Current Stock}$).
2. **1-Tap WhatsApp Distributor Order (`WhatsApp पर पर्चा भेजें`):** Generates a clean, formatted plain-text order list and opens WhatsApp directly via `wa.me` or Web Share API.
3. **Expiry Tracking for Chemists:** Optional expiry date per stock-in batch, surfacing an "Expiring Soon (`जल्द एक्सपायर होने वाला`)" alert section on the Reorder Sheet.
4. **Camera Barcode Scanning:** Fast barcode lookup/entry using the phone camera (`BarcodeDetector` API with fallback) for packaged goods.
5. **Multi-Shop Support (`दुकान बदलें`) & Optional Cloud Sync:** Instant local switcher for an owner with two branches, plus background outbox sync when internet is configured and available.

### Explicit Non-Goals (What We Will Refuse to Build)
* Customer billing, receipts, or thermal printer integrations
* GST calculation, HSN codes, or tax filing
* Customer credit ledger (`उधार खाता`) or UPI payment collection
* Accounting dashboards, pie charts, or profit-and-loss statements
* Mandatory login walls, OTP sign-ups, or desktop layouts

---

## 5. Success Criteria (The Judge's Test Protocol)

| # | Judge Action | Pass Condition |
|---|---|---|
| **1** | Open app once, switch phone to **Aeroplane Mode**, force-close browser, reopen URL | App cold-boots in < 1.5s with zero network errors; all items and logs remain intact. |
| **2** | Add a new item, add stock, and record 5 consecutive sales one-handed | Each sale takes **≤ 2 taps**; primary buttons are in the bottom thumb zone; **zero scrolling required to hit Save**. |
| **3** | Sell `"1.5 kg"` loose sugar, `"half dozen"` bananas, and `"3 loose pieces"` | Fractional and unit inputs accepted effortlessly via quick chips; stock balances deduct accurately without floating-point bugs. |
| **4** | Open the **Reorder Sheet (`पर्चा`)** | Displays a plain actionable list split into **Running Low** and **Not Moving (Dead Stock)**, in Hindi, with clear plain-text reasons (e.g., *"रोज़ 4 बिकता है, सिर्फ़ 2 बचा है"*). |
| **5** | *(Stretch)* Tap **Send Order on WhatsApp** | Opens WhatsApp with a pre-filled, human-readable Hindi/English order list ready to send to a distributor. |
| **6** | *(Stretch)* Check Chemist / Multi-shop flows | Items nearing expiry appear at the top of the sheet; owner can toggle between Shop 1 and Shop 2 offline. |

---

## 6. Hard Design & Technical Constraints

* **One-Handed Thumb Ergonomics:** All interactive controls and primary save actions live in the bottom 60% of the viewport. Tap targets are **≥ 56 px** (and **≥ 64 px** for primary `+` / `-` / `Save` actions).
* **No Scroll-to-Save:** Modals and bottom sheets must fit above the mobile keyboard without requiring the user to scroll down to find the submit button.
* **Zero-Auth Local Persistence:** No login screen. App opens straight to the counter. Data persists in `IndexedDB` (`items`, `stock_logs`, `sync_outbox`).
* **Floating-Point Safety:** Quantities are stored and computed using fixed-precision rounding ($\text{round}(x \times 1000) / 1000$) so selling `0.25 kg` three times equals `0.75 kg`, never `0.7500000000001`.
* **Low-End Hardware Budget:** Runs smoothly at 60 fps on ₹6,000 Android phones; initial gzipped JS bundle **≤ 150 KB**; zero heavy chart libraries.

---

## 7. Operational Assumptions

* **Pre-Seeded + Lazy Onboarding:** A new shop owner will not sit down and type 400 items on Day 1. The app ships with a 1-tap starter pack template (Kirana / Chemist / Stationery) *and* supports **Lazy Onboarding**—if the owner searches or scans an item that isn't in the list during a sale, they can create it and log the sale in a single inline step.
* **80/20 Fast-Mover Grid:** 80% of daily taps happen on ~30–50 fast-moving items. Pinning/sorting the counter by "Most Frequently Sold" keeps the owner's top items at the very top of the screen without searching.
* **Lead Time Defaults:** Distributor delivery lead time defaults to **2 days** shop-wide (customisable per item or per shop) so velocity math works out of the box without complex setup.

---

## 8. Product Risks & Mitigations

| Risk | Why It Happens | Built-In Mitigation |
|---|---|---|
| **Logging feels slower than the notebook** | Too many taps, typing quantities on a full QWERTY keyboard, or "Are you sure?" popups. | 1-tap sale deduction on the item card, bottom-sheet fractional chips (`0.25`, `0.5`, `1`, `12`), and a 4-second Undo bar instead of confirmation dialogs. |
| **Opening stock is inaccurate or never entered** | Owner starts tapping sales before counting existing shelf stock. | Allow negative/unverified stock or prompt a 1-tap *"अभी दुकान में कितना रखा है?"* (How much is on the shelf?) inline chip the first time an item is sold. |
| **Velocity reorder math is noisy on Day 1** | With only 1–2 days of sales logs, average daily velocity is statistically unreliable. | **Hybrid Reorder Rule:** Fall back to a simple minimum-stock threshold (`min_threshold`) for the first 3 days, then smoothly blend in actual sales velocity while showing plain-Hindi confidence (*"पिछले 5 दिन की बिक्री के आधार पर"*). |
| **Accidental "fat-finger" taps in a rush** | Shopkeeper taps `-1` twice while handing change with the other hand. | Persistent bottom toast after every tap: *"चीनी -1 kg दर्ज हुआ — [वापस लें (Undo)]"* + a quick 5-item recent activity strip at the top of the drawer. |
| **Phone lost, damaged, or browser cache cleared** | Local-only storage is vulnerable to device loss if cloud sync isn't configured. | Request `navigator.storage.persist()` on boot + provide a 1-tap **"WhatsApp Backup to Self (`बैकअप फ़ाइल भेजें`)"** JSON export/import. |