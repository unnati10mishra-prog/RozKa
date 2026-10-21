# Architecture Document: The Kirana Problem (Local-First Stock & Reorder PWA)

## 1. Executive Summary & Design Philosophy

Kirana shops, chemists, hardware, and stationery stores operate under extreme real-world constraints: a single operator, one free hand, 30-second windows between customers, spotty cellular connectivity, and hundreds of loose/fractional items.

Traditional POS/Billing systems fail here because they require desktop counters, continuous internet, rigid integer SKUs, and slow multi-step invoice flows. This architecture is purpose-built around three non-negotiable pillars:

1. **Faster than a Notebook:** Recording a sale (`-`) or restocking (`+`) happens on a single unified screen in $\le 2$ thumb taps—no invoices, no carts, no scrolling to save.

2. **100% Aeroplane-Mode Survival:** The Service Worker caches the entire application shell, and `IndexedDB` acts as the single source of truth. The cloud is strictly an optional backup/multi-branch mirror.

3. **Actionable Reorder Intelligence:** Instead of analytics dashboards, the local engine computes **Sales Velocity** (fast movers running out) and **Stagnation** (dead stock locking up cash) into a plain, shareable distributor sheet (`पर्चा`).

## 2. System Architecture Diagram

```
+-----------------------------------------------------------------------------------+
|                      1. PRESENTATION & UX LAYER (Mobile PWA)                      |
|  • Thumb-Zone Ergonomics (Bottom controls, min 56x56px tap targets, zero-scroll)  |
|  • Bilingual UI (हिन्दी / Hinglish - Zero jargon: No "SKU", "POS", or "Ledger")    |
|  • Device APIs: Camera BarcodeDetector (ZXing fallback) • WhatsApp Deep Links     |
+-----------------------------------------------------------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
|                 2. OFFLINE RUNTIME LAYER (Aeroplane Mode Guarantee)               |
|  • Service Worker (Workbox): Pre-caches App Shell (HTML, CSS, JS, Icons, Fonts)   |
|  • Zero network dependency on cold boot or page refresh                           |
+-----------------------------------------------------------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
|                       3. CORE WORKFLOWS & DOMAIN ENGINES                          |
|  +-------------------------------------+  +------------------------------------+  |
|  |   A. 1-Tap Counter (गल्ला / काउंटर)   |  |  B. Reorder Sheet (पर्चा / ऑर्डर)    |  |
|  | • Unified Sale (-) & Restock (+)    |  | • Low Stock & Velocity Calculator  |  |
|  | • Fractional chips (0.25, 0.5, Doz) |  | • Dead Stock Detector (Cash locked)|  |
|  | • Instant 5-sec Undo Toast          |  | • Expiry Alert (Chemist mode)      |  |
|  | • Voice / Barcode / Hinglish Search |  | • 1-Tap WhatsApp Distributor Share |  |
|  +-------------------------------------+  +------------------------------------+  |
+-----------------------------------------------------------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
|                  4. LOCAL PERSISTENCE LAYER (IndexedDB - Primary DB)              |
|  +-----------------+  +--------------------+  +---------------+  +-------------+  |
|  |      items      |  |     stock_logs     |  |     shops     |  | sync_outbox |  |
|  | (Current state, |  | (Append-only delta |  | (Multi-branch |  | (Pending    |  |
|  |  units, expiry) |  |  +Restock / -Sale) |  |  profiles)    |  |  mutations) |  |
|  +-----------------+  +--------------------+  +---------------+  +-------------+  |
+-----------------------------------------------------------------------------------+
                                         ^
                                         |  (Background Sync API / Online Polling)
                                         |  Only when configured & connectivity exists
                                         v
+-----------------------------------------------------------------------------------+
|                        5. OPTIONAL CLOUD BACKEND (Sync & Backup)                  |
|  • Encrypted Cloud Backup • Multi-Device Sync • Multi-Branch Aggregation          |
+-----------------------------------------------------------------------------------+


```

## 3. Deep-Dive: Architectural Layers

### Layer 1: Presentation & UX Layer (Constraint-Driven UI)

* **Thumb-Zone Navigation:** All primary interactive controls reside in the bottom 60% of the viewport. Search, barcode trigger, and unit presets sit directly under the right/left thumb arc.

* **Forgiving Fractional Input:** Items are mapped to unit profiles (`Loose Weight [kg/g]`, `Count [pc/dozen]`, `Medical [strip/tab]`). Tapping an item reveals context-aware quick-tap chips:

  * *Loose Kirana (Sugar, Dal):* `-250g (-0.25)`, `-0.5kg`, `-1kg`, `+10kg (Sack)`

  * *Bakery/General (Eggs, Soap):* `-1 pc`, `-6 (Half Doz)`, `-12 (Dozen)`

  * *Chemist (Paracetamol):* `-2 tabs`, `-1 strip (10)`

* **Bilingual & Jargon-Free:** Uses natural shopkeeper vocabulary:

  * `बिका (Sold -)` instead of *Create Invoice*

  * `माल आया (Stock In +)` instead of *Update Inventory SKU*

  * `मंगवाना है (To Order)` instead of *Low Stock Threshold Alert*

  * `रुका हुआ माल (Stuck Stock)` instead of *Dead Inventory Depreciation*

### Layer 2: Offline Runtime Layer (The "3:30 PM Trap" Prevention)

* **Pre-Cached App Shell:** Registered on initial load using a Cache-First strategy for all static assets (`index.html`, bundled JS/CSS, local SVG icons, system fonts).

* **Storage Persistence:** Requests `navigator.storage.persist()` on startup so mobile browsers (Android Chrome) do not evict `IndexedDB` data when device storage runs low.

* **Aeroplane Mode Verification:** The app boots in $< 300\text{ms}$ with Wi-Fi and Mobile Data completely disabled.

### Layer 3: Core Workflows (Replacing the 4-Tab Dashboard)

Instead of splitting `Inventory` and `Sales` into separate pages, the architecture consolidates operations into **two primary views**:

1. **The Counter (`काउंटर` - Daily Operations):**

   * Displays pinned fast-movers at the top, followed by recently tapped items.

   * **Single-Card Action:** Every item card has immediate `-` (Sale) and `+` (Restock) triggers.

   * **Zero-Scroll Save:** Tapping a quantity chip commits directly to `IndexedDB` optimistically and triggers haptic feedback (`navigator.vibrate(30)`).

   * **Fat-Finger Recovery:** A persistent bottom snackbar (`"चीनी -0.5 kg दर्ज हुआ | पूर्ववत करें (Undo)"`) replaces complex audit-log screens for immediate mistake reversal.

2. **The Reorder Sheet (`पर्चा` - Decision Making):**

   * Plain, high-contrast checklist divided into three actionable buckets:

     1. **मंगवाना है (Running Low):** Stock is below threshold or projected to run out before the distributor arrives.

     2. **रुका हुआ माल (Dead Stock):** Items sitting on the shelf for $\ge 30$ days with zero sales, highlighting locked cash value.

     3. **एक्सपायरी करीब (Expiring Soon):** Specifically for chemists and packaged goods expiring within 30 days.

   * **1-Tap WhatsApp Dispatch:** Formats the checked items into a clean Hindi/English text list and opens `https://wa.me/?text=...` (or Web Share API) to send directly to the supplier.

## 4. Data Model (`IndexedDB` Schema)

To avoid building a bloated billing system, `Sales` and `Stock Movements` are unified into a single, lightweight append-only ledger (`stock_logs`).

### Store 1: `items` (KeyPath: `id`, Indexes: `shop_id`, `barcode`, `last_sold_at`, `expiry_date`)

```
{
  "id": "itm_8f92a",
  "shop_id": "shp_main",
  "name_hi": "टाटा नमक (Tata Salt)",
  "name_en": "Tata Salt 1kg",
  "search_tokens": ["tata", "namak", "salt", "टाटा", "नमक"],
  "barcode": "8901030895265",
  "unit_type": "pc",
  "quick_increments": [1, 2, 5, 25],
  "current_qty": 14.0,
  "cost_price": 24.0,
  "min_threshold": 10.0,
  "lead_time_days": 2,
  "last_sold_at": 1729488000000,
  "last_restocked_at": 1728883200000,
  "expiry_date": "2027-03-15",
  "updated_at": 1729488000000
}


```

*Note: `current_qty` is stored as an IEEE 754 float rounded to 3 decimal places (`Math.round(val * 1000) / 1000`) to prevent floating-point drift on loose weights like `0.250` kg.*

### Store 2: `stock_logs` (KeyPath: `id`, Indexes: `item_id`, `shop_id`, `timestamp`, `type`)

```
{
  "id": "log_9921b",
  "shop_id": "shp_main",
  "item_id": "itm_8f92a",
  "type": "SALE",
  "delta_qty": -1.5,
  "previous_qty": 15.5,
  "new_qty": 14.0,
  "timestamp": 1729488000000
}


```

*Allowed `type` values:* `"SALE"` ($\Delta < 0$), `"RESTOCK"` ($\Delta > 0$), `"SPOILAGE"` ($\Delta < 0$).

### Store 3: `shops` (KeyPath: `id`)

Supports multi-branch owners switching between shops locally or via sync.

```
{
  "id": "shp_main",
  "name": "शर्मा किराना स्टोर - मेन बाजार",
  "category": "KIRANA",
  "distributor_whatsapp": "919876543210"
}


```

### Store 4: `sync_outbox` (KeyPath: `seq_id`)

Append-only mutation queue for eventual consistency when an optional backend is configured.

```
{
  "seq_id": 1042,
  "entity": "stock_logs",
  "operation": "INSERT",
  "payload": { "...": "..." },
  "created_at": 1729488000000,
  "sync_status": "PENDING"
}


```

## 5. Core Intelligence Algorithms (On-Device, Zero Latency)

### A. Smart Reorder Quantity (Velocity-Based)

Instead of relying solely on static minimum numbers, the app calculates how fast an item sells over a rolling window ($W = 14\text{ days}$):

1. **Average Daily Sales Velocity (**$V_d$**):**

   $$
   V_d = \frac{\sum \vert{}\Delta \text{qty}_{\text{SALE in last } W \text{ days}}\vert{}}{W}
   $$

2. **Days of Stock Remaining (**$D_{\text{left}}$**):**

   $$
   D_{\text{left}} = \frac{\text{current\_qty}}{\max(V_d, 0.01)}
   $$

3. **Trigger Condition:** Flag item as **"Running Low (`मंगवाना है`)"** if:

   $$
   \text{current\_qty} \le \text{min\_threshold} \quad \text{OR} \quad D_{\text{left}} \le \text{lead\_time\_days}
   $$

4. **Suggested Order Quantity (**$Q_{\text{order}}$**):** To cover a target cycle ($C = 7\text{ days}$) plus lead time ($L$), rounded up to standard pack size:

   $$
   Q_{\text{order}} = \max\left(0, \lceil (V_d \times (C + L)) - \text{current\_qty} \rceil\right)
   $$

### B. Dead Stock Detection (Cash Locked on Shelf)

Identifies slow/non-moving items draining working capital:

1. **Days Since Last Sale (**$D_{\text{idle}}$**):**

   $$
   D_{\text{idle}} = \frac{\text{Now} - \text{last\_sold\_at}}{86,400,000\text{ ms}}
   $$

2. **Trigger Condition:** Flag item as **"Dead Stock (`रुका हुआ माल`)"** if:

   $$
   \text{current\_qty} > 0 \quad \text{AND} \quad D_{\text{idle}} \ge 30\text{ days}
   $$

3. **Locked Capital Calculation:**

   $$
   \text{Locked Cash (₹)} = \text{current\_qty} \times \text{cost\_price}
   $$

## 6. Offline-to-Online Sync Protocol (Optional Backend)

1. **Local Execution:** Every tap updates `items` and writes to `stock_logs` and `sync_outbox` inside a single atomic `IndexedDB` transaction.

2. **Connectivity Listener:** When `window.addEventListener('online')` fires (or via Service Worker `SyncManager`), the background worker batches `PENDING` entries from `sync_outbox`.

3. **Conflict Resolution:** Uses **Commutative Delta Merging** for stock quantities rather than Last-Write-Wins (LWW). If Branch A sells `-2` offline and Owner adds `+10` from another device, the server applies $\Delta = -2 + 10 = +8$ to the base quantity, ensuring zero lost stock adjustments.

## 7. Problem Statement Alignment Checklist

| Judge / Problem Requirement | Architectural Solution | 
| ----- | ----- | 
| **Add stock & record sale in very few taps** | Unified Counter screen; 1 tap on fractional preset chip (`-0.5kg`, `-1`, `+10`) writes straight to DB. | 
| **Plain reorder & dead-stock list (Not a dashboard)** | Dedicated `पर्चा (Reorder Sheet)` view showing plain action lists with locked cash amounts and 1-tap WhatsApp export. | 
| **Works in Aeroplane Mode** | Workbox Service Worker pre-caches HTML/JS/CSS/Fonts; all reads/writes hit local `IndexedDB`. | 
| **Hindi & English, zero technical jargon** | Native bilingual labels (`बिका`, `माल आया`, `पर्चा`); SKU/POS terminology strictly eliminated. | 
| **Forgiving numbers (dozens, half kilos, loose)** | Float-safe `current_qty` with unit-aware quick chips (`0.25`, `0.5`, `1`, `12/Dozen`, `Strip`). | 
| **Bonus: Velocity-based reorder, Barcode, Expiry, Multi-shop** | Built into `items` schema (`expiry_date`, `barcode`, `shop_id`) and computed via 14-day rolling `stock_logs` velocity. | 
