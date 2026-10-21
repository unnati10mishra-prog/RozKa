# RozKa

### Roz ka hisaab. Business ka sukoon.

**RozKa is an offline-first, Hindi-friendly inventory and reorder
assistant designed for India's neighbourhood retailers.** It helps
kirana shopkeepers keep track of stock, record sales in seconds,
identify products that need attention, and prepare smarter replenishment
orders --- without depending on a constant internet connection.

> **The idea in one line:** Less time counting shelves. Fewer avoidable
> stockouts. Better-informed reorder decisions.

------------------------------------------------------------------------

## Table of Contents

-   [Why RozKa?](#why-rozka)
-   [The Problem](#the-problem)
-   [Our Solution](#our-solution)
-   [Who It's For](#who-its-for)
-   [Product Principles](#product-principles)
-   [Core Features](#core-features)
-   [The RozKa Workflow](#the-rozka-workflow)
-   [Reorder Intelligence](#reorder-intelligence)
-   [Offline-First by Design](#offline-first-by-design)
-   [Hindi and Accessibility](#hindi-and-accessibility)
-   [Gemma 4: A Responsible AI
    Extension](#gemma-4-a-responsible-ai-extension)
-   [Technology Stack](#technology-stack)
-   [High-Level Architecture](#high-level-architecture)
-   [Data Model](#data-model)
-   [UX and Design Direction](#ux-and-design-direction)
-   [MVP Scope](#mvp-scope)
-   [What We Will Not Build First](#what-we-will-not-build-first)
-   [Reliability, Privacy, and Data
    Integrity](#reliability-privacy-and-data-integrity)
-   [Testing and Demo Plan](#testing-and-demo-plan)
-   [Getting Started](#getting-started)
-   [Project Structure](#project-structure)
-   [Roadmap](#roadmap)
-   [Open Source](#open-source)
-   [Contributing](#contributing)
-   [Acknowledgements](#acknowledgements)
-   [Project Status](#project-status)

------------------------------------------------------------------------

## Why RozKa?

Small shops are a major part of everyday Indian commerce. Yet many
independent retailers still manage inventory through notebooks, memory,
informal notes, and quick shelf checks. Their tools should fit the way
they already work --- not force them to operate like a large
supermarket.

RozKa is built around a simple belief:

**Useful software should make the everyday task easier, not create
another task.**

The name comes from **"Roz ka"** --- something used every day. RozKa is
intended to feel familiar to a shopkeeper while remaining a product that
can grow into a broader retail-operations platform.

### Brand

-   **Name:** RozKa
-   **Tagline:** *Roz ka hisaab. Business ka sukoon.*
-   **Product category:** Offline-first retail inventory and reorder
    assistant
-   **Primary users:** Kirana shops and other small neighbourhood
    retailers
-   **Experience:** Mobile-first, Hindi-friendly, low-friction,
    dependable

------------------------------------------------------------------------

## The Problem

A small retailer faces two costly inventory failures:

### 1. Fast-moving items run out

A customer asks for a popular product, but the last unit has already
been sold. The owner did not notice in time, the customer may buy it
elsewhere, and the sale is lost.

### 2. Slow-moving items tie up money

Products that sell slowly can sit on shelves for weeks or months. Money
remains tied up in stock that may not be needed soon, while
faster-selling products may be understocked.

These problems are made worse by tools that assume a computer, stable
connectivity, long data-entry sessions, technical vocabulary, or a
trained operator.

For a shopkeeper serving customers throughout the day, every extra tap
matters.

### The central question

**"What should I reorder today, and how much should I buy?"**

RozKa turns the shop's recorded stock and sales into a simple,
explainable answer --- while keeping the shopkeeper in control.

------------------------------------------------------------------------

## Our Solution

RozKa is not intended to be another complicated billing suite or a
dashboard full of charts. It is a practical stock assistant built around
four actions:

1.  **Record a sale** in a few taps.
2.  **See what needs attention** through a clear low-stock and
    slow-moving list.
3.  **Understand what to reorder** using recent sales, available stock,
    and supplier lead time where known.
4.  **Prepare an order** that can be reviewed and shared with a
    distributor.

The app should remain useful in airplane mode. Data is stored locally on
the device, and the interface should be usable by someone who is busy,
may prefer Hindi, and may not be comfortable with software.

### The product promise

-   No internet required for core stock and sales workflows.
-   No complicated billing workflow required to record a sale.
-   No opaque AI-generated inventory numbers.
-   No unnecessary charts when a simple action list is more useful.
-   No stock changes made silently by an AI assistant.

------------------------------------------------------------------------

## Who It's For

### Primary user: the neighbourhood shopkeeper

A shop owner who: - Uses a smartphone as their main digital device. -
Has limited time between customers. - May manage hundreds of products. -
May use a notebook or memory to track inventory. - Needs the app to work
even with poor or absent connectivity. - Wants practical
recommendations, not a complicated analytics dashboard.

### Initial product categories

The first version should work for general neighbourhood retail, such
as: - Packaged snacks and biscuits - Personal-care products - Household
cleaning products - Bottled drinks - Grocery items sold by piece,
packet, kilogram, or litre - Stationery and other small-retail products

Chemist-specific expiry tracking can be explored later, with appropriate
product requirements and validation.

------------------------------------------------------------------------

## Product Principles

### 1. Record a sale faster than a notebook

If a routine sale takes longer to record in RozKa than to jot down on
paper, the experience has failed.

### 2. Actions over dashboards

The first screen should help the owner decide what to do next. Low-stock
and slow-moving lists are more useful than decorative charts.

### 3. Offline is a core feature

Core workflows must continue without a network connection. Offline
support is not a premium feature or a later enhancement.

### 4. Explain every recommendation

A suggested reorder should show the facts behind it: recent sales,
current stock, target coverage, and any assumptions used.

### 5. The owner remains in control

RozKa suggests; the shopkeeper decides. The app must make it easy to
correct stock, reverse an accidental sale, and review an order before
sharing it.

### 6. Respect real retail units

Products may be sold as individual pieces, packets, kilograms, litres,
or fractional quantities. The data model must not assume every quantity
is an integer.

### 7. Design for the real user

Use clear language, large touch targets, high contrast, thumb-reachable
actions, and a Hindi-first experience with an English option.

------------------------------------------------------------------------

## Core Features

Features are grouped by priority so that the essential product is
completed before optional additions.

### P0 --- The required MVP

#### Product catalogue

-   Add, edit, and archive products.
-   Store product name, unit, current stock, and low-stock threshold.
-   Support piece, packet, kilogram, gram, litre, millilitre, and other
    explicitly configured units.
-   Allow decimal quantities where the unit supports them.
-   Provide a fast product search.

#### Fast sale recording

-   Find a product quickly.
-   Choose a quantity and confirm the sale.
-   Update stock immediately.
-   Record a timestamped sale event.
-   Provide feedback that the sale was saved.
-   Prevent invalid stock changes and allow corrections through an
    explicit adjustment or reversal flow.

#### Low-stock list

-   Show items at or below their configured thresholds.
-   Display current stock and the threshold together.
-   Sort the most urgent items first.
-   Make the list actionable without requiring the owner to navigate a
    dashboard.

#### Slow-moving and non-moving stock

-   Use recorded sales history over a clearly stated period.
-   Distinguish "no recorded sales" from "the product is definitely not
    selling."
-   Show the last recorded sale or period examined where available.
-   Avoid classifying a newly added product as dead stock simply because
    it has little history.

#### Offline-first operation

-   Cache the app shell and required assets using a service worker.
-   Store product, sale, and stock data locally.
-   Keep core workflows functional in airplane mode.
-   Retain data across reloads and browser restarts.
-   Clearly communicate any operation that cannot be completed offline.

#### Hindi-friendly interface

-   Use familiar labels rather than jargon such as "SKU" or "inventory
    turnover."
-   Offer Hindi and English labels where practical.
-   Keep critical actions understandable without relying on colour
    alone.

### P1 --- Competitive advantages

#### Explainable reorder suggestions

-   Estimate average daily sales from recorded transactions.
-   Account for supplier lead time when the user provides it.
-   Let the owner choose a target stock-coverage period or safety
    buffer.
-   Subtract current stock and account for known outstanding orders.
-   Display the assumptions behind each recommendation.
-   Allow the owner to edit the suggested quantity.

#### Distributor order list

-   Build a list from selected products or reorder recommendations.
-   Display product name, quantity, and unit clearly.
-   Let the owner review and edit the order before sharing.
-   Use the device's native share interface where supported, with a
    copy-text fallback.

#### Fractional units and practical corrections

-   Support loose quantities and common retail units.
-   Record stock corrections with a reason where possible.
-   Make accidental-sale reversal explicit and traceable.

### P2 --- Only after the MVP works reliably

-   Camera-based barcode scanning.
-   Expiry-date tracking for relevant product categories.
-   Multi-device or multi-branch support.
-   Optional backup and synchronisation.
-   More advanced demand patterns and seasonality.
-   Gemma-assisted parsing of distributor messages into draft orders.

These features must not delay the offline sale-and-reorder workflow.

------------------------------------------------------------------------

## The RozKa Workflow

### 1. Set up the shop

The owner adds a few frequently sold products, enters their current
stock, chooses units, and sets low-stock thresholds. The app should make
initial setup simple and allow the catalogue to grow over time.

### 2. Record sales throughout the day

When a customer buys three packets of a product, the owner searches or
taps the item, enters quantity `3`, and confirms. The stock count
updates locally and immediately.

### 3. Check what needs attention

The owner opens the action list and sees products that have reached
their low-stock threshold and products with little or no recorded
movement during the selected period.

### 4. Review suggested orders

RozKa calculates a suggested quantity using the available sales history,
current stock, and known supplier lead time. The interface explains why
the product appears and how the quantity was calculated.

### 5. Share the order

The owner reviews the draft, changes quantities if needed, and shares
the final list with a distributor. RozKa does not claim that an order
has been placed unless an actual ordering integration exists.

### Example

Suppose a shop has 5 packets of a biscuit brand left and has recorded
average sales of 4 packets per day. If the supplier usually takes 2 days
to deliver and the owner wants 4 extra packets as safety stock:

-   Expected demand during lead time: `4 × 2 = 8 packets`
-   Safety stock: `4 packets`
-   Target stock: `8 + 4 = 12 packets`
-   Suggested order: `max(0, 12 − 5) = 7 packets`

The app suggests **7 packets** and shows the calculation. The owner can
still change the quantity.

------------------------------------------------------------------------

## Reorder Intelligence

RozKa's first reorder engine should be deterministic, simple to test,
and honest about uncertainty.

### Basic formula

Let:

-   `d` = estimated average units sold per day
-   `L` = supplier lead time in days
-   `B` = additional safety-stock quantity
-   `S` = current usable stock
-   `O` = units already on order, if tracked

Then:

``` text
target_stock = (d × L) + B
inventory_position = S + O
suggested_order = max(0, target_stock - inventory_position)
```

If no reliable sales history or lead-time information exists, the app
should say that the estimate is limited and fall back to the owner's
configured threshold or manual judgement. It must not invent missing
values.

### Sales velocity

A simple initial estimate can use recorded sales over a configurable
lookback window:

``` text
average_daily_sales = units_sold_during_window / days_in_window
```

The implementation must account for the difference between calendar days
and days the shop was actually open if that information is available.
Returns, corrections, and reversed sales should not be counted as
ordinary sales.

### Important limitations

-   Sales history may be too short to predict demand reliably.
-   A sudden festival, weather change, or local event may alter demand.
-   Supplier lead times may vary.
-   Pack sizes and minimum order quantities may constrain the final
    quantity.
-   Stock counts may be inaccurate if some sales are not recorded.

For these reasons, recommendations should be presented as **suggestions
with visible assumptions**, not guarantees.

------------------------------------------------------------------------

## Offline-First by Design

A shop must be able to keep working when mobile data disappears.

### Planned approach

-   **Application shell:** a service worker caches the assets required
    to launch the app.
-   **Local persistence:** IndexedDB stores structured product and sales
    data.
-   **Data access:** a small, well-defined data layer handles reads,
    writes, and validation.
-   **Business logic:** stock arithmetic and reorder calculations run
    locally and do not require an API.
-   **Sharing:** order text can be generated locally; sharing may depend
    on device/browser capabilities, with a copy fallback.

### Offline acceptance criteria

The MVP is not considered offline-ready until it passes all of these:

1.  Open the app once while online.
2.  Switch the device to airplane mode.
3.  Reload the app.
4.  Find a product and record a sale.
5.  Confirm that stock changes correctly.
6.  Close and reopen the app while still offline.
7.  Confirm that products and sales remain available.
8.  Restore connectivity and verify that local data has not been lost.

### Synchronisation is not required for the first version

Multi-device sync creates conflict-resolution, identity, backup, and
security requirements. The initial release should prioritise reliable
single-device operation. If sync is added later, it must define how
simultaneous edits, duplicate sales, and stock adjustments are
reconciled.

------------------------------------------------------------------------

## Hindi and Accessibility

RozKa should use language a shopkeeper actually recognises.

Possible UI labels include:

  English concept     Hindi-friendly label
  ------------------- ----------------------
  Products            सामान
  Record sale         बिक्री जोड़ें
  Current stock       अभी कितना बचा है
  Low stock           सामान कम है
  Slow-moving items   कम बिकने वाला सामान
  Reorder list        दोबारा मंगाने की सूची
  Quantity            मात्रा
  Save sale           बिक्री सेव करें
  Stock adjustment    स्टॉक ठीक करें

The final wording should be tested with real users. Translation alone is
not enough: button placement, tap targets, error messages, reading
comfort, and the speed of common actions all matter.

### Interaction principles

-   Keep the primary action reachable with one thumb.
-   Use large touch targets and readable text.
-   Avoid long forms during a sale.
-   Avoid relying on colour alone to communicate stock status.
-   Show clear success and error feedback.
-   Make destructive actions difficult to trigger accidentally.
-   Do not require an account or internet connection for core
    single-device use unless a later design decision makes it necessary.

------------------------------------------------------------------------

## Gemma 4: A Responsible AI Extension

The hackathon includes a separate **Best Use of Gemma 4** track. RozKa
can pursue it without making AI a dependency for core inventory
features.

### Proposed use case: distributor message to draft order

A shopkeeper may receive a distributor message such as:

> Parle-G 20 packets, Maggi 10, oil 5 litre.

A Gemma-powered feature could turn the message into a structured draft:

``` json
{
  "items": [
    {"name": "Parle-G", "quantity": 20, "unit": "packet"},
    {"name": "Maggi", "quantity": 10, "unit": "packet"},
    {"name": "Oil", "quantity": 5, "unit": "litre"}
  ]
}
```

This JSON is an illustrative target format, not a claim that model
extraction is already implemented.

### Safe processing flow

1.  The model extracts candidate item names, quantities, and units.
2.  The app validates the output against a strict schema.
3.  Candidate items are matched against the local product catalogue.
4.  Ambiguous or unmatched items are flagged for correction.
5.  The owner reviews and confirms the draft.
6.  Only the confirmed order text is shared.

### What AI must not do

-   It must not directly change inventory from an unconfirmed message.
-   It must not silently invent missing quantities or units.
-   It must not be required to record sales or calculate stock.
-   It must not be described as running locally unless local inference
    has actually been implemented and tested.

The exact Gemma 4 variant, runtime, and hardware requirements should be
verified before selecting an implementation. If local inference is
impractical within the build window, the team should prioritise the
required MVP and document the AI extension honestly.

------------------------------------------------------------------------

## Technology Stack

The planned stack is intentionally lightweight.

  -----------------------------------------------------------------------
  Layer                   Proposed technology     Purpose
  ----------------------- ----------------------- -----------------------
  Frontend                React + Vite +          Fast, type-safe
                          TypeScript              mobile-first interface

  Styling                 Tailwind CSS            Consistent responsive
                                                  design

  Local database          IndexedDB via Dexie     Persistent products,
                                                  sales, and settings

  Offline application     Service worker / PWA    Cache the app shell for
                                                  offline launch

  Validation              TypeScript types plus   Protect data boundaries
                          runtime schema          
                          validation              

  Reorder engine          Plain deterministic     Explainable, testable
                          TypeScript functions    calculations

  Sharing                 Web Share API with      Share distributor
                          copy-text fallback      orders

  Optional AI             Gemma 4, subject to     Convert unstructured
                          verified runtime        messages into draft
                          requirements            orders
  -----------------------------------------------------------------------

### Architecture decision

The MVP should not require a hosted backend. A backend may be introduced
later for opt-in backup, multi-device synchronisation, or multiple
branches, but those features bring authentication, access control,
conflict handling, and operational costs.

------------------------------------------------------------------------

## High-Level Architecture

``` text
┌─────────────────────────────────────────┐
│             RozKa PWA                   │
│                                         │
│  Hindi / English mobile-first interface │
│       │             │                   │
│       ▼             ▼                   │
│  Sale workflow   Product catalogue      │
│       │             │                   │
│       └──────┬──────┘                   │
│              ▼                          │
│       Inventory service                 │
│       - stock updates                   │
│       - sale history                    │
│       - low-stock rules                 │
│       - slow-movement checks            │
│       - reorder calculations            │
│              │                          │
│       ┌──────┴─────────┐                │
│       ▼                ▼                │
│  IndexedDB        Action lists          │
│  local data       and order drafts      │
│       │                │                │
│       └────────┬───────┘                │
│                ▼                        │
│        Local-first operation            │
└─────────────────────────────────────────┘
```

The service worker caches the application shell separately from
IndexedDB, which stores the business data. Core inventory calculations
run locally and do not depend on a model or network request.

------------------------------------------------------------------------

## Data Model

The following is a proposed logical model. It can be refined during
implementation.

### Product

  Field                    Meaning
  ------------------------ --------------------------------------
  `id`                     Stable local identifier
  `name`                   Product display name
  `unit`                   Unit in which the product is tracked
  `stockQuantity`          Current recorded quantity
  `lowStockThreshold`      Owner-defined low-stock threshold
  `supplierLeadTimeDays`   Optional estimated delivery time
  `safetyStockQuantity`    Optional additional stock buffer
  `createdAt`              Creation timestamp
  `updatedAt`              Last update timestamp
  `archivedAt`             Optional archive timestamp

### Sale

  Field          Meaning
  -------------- ------------------------------------------------
  `id`           Stable sale-event identifier
  `productId`    Product sold
  `quantity`     Quantity sold in the product's configured unit
  `occurredAt`   Time of sale
  `status`       Recorded, reversed, or corrected
  `reversalOf`   Optional reference to the original sale
  `createdAt`    Event creation timestamp

### Stock adjustment

  Field             Meaning
  ----------------- --------------------------------------------------
  `id`              Stable adjustment identifier
  `productId`       Product adjusted
  `quantityDelta`   Signed change in quantity
  `reason`          Optional explanation, such as a count correction
  `occurredAt`      Time of adjustment

### Settings

Settings may include preferred language, low-stock defaults, reorder
coverage, and other user-controlled preferences.

### Data integrity rules

-   Stock changes and their corresponding sale/adjustment events should
    be committed together in a database transaction.
-   Quantities must be finite and valid for the configured unit.
-   A sale should not silently result in unintended negative stock;
    define and test the chosen policy.
-   Reversals should create an auditable correction rather than deleting
    history invisibly.
-   Reorder calculations must use valid, appropriately converted units.
-   Archived products with historical sales should remain available in
    past records.

------------------------------------------------------------------------

## UX and Design Direction

RozKa should feel like a carefully designed everyday business tool ---
not a futuristic AI dashboard.

### Visual direction

-   Calm, restrained colours with strong text contrast.
-   A clear type hierarchy and generous spacing.
-   Large, thumb-friendly controls.
-   Minimal decoration and no unnecessary gradients or glowing effects.
-   A compact product list that puts quantities and actions first.
-   Consistent Hindi and English typography.
-   Helpful empty states and clear feedback.

### Primary screens

1.  **Home / Action list** --- low-stock items and key actions.
2.  **Products** --- searchable catalogue with current quantities.
3.  **Record sale** --- a short, fast interaction.
4.  **Slow-moving stock** --- items with limited recorded movement.
5.  **Reorder list** --- suggested quantities, assumptions, and editable
    order lines.
6.  **Settings** --- language, thresholds, units, and data-management
    options.

The home screen should answer "What should I do next?" rather than
merely display numbers.

------------------------------------------------------------------------

## MVP Scope

### Must work end to end

-   [ ] Add and edit products.
-   [ ] Record a sale quickly.
-   [ ] Update stock reliably.
-   [ ] Persist data locally across reloads.
-   [ ] Show low-stock items.
-   [ ] Identify slow-moving or non-moving items from recorded history.
-   [ ] Launch and operate core workflows in airplane mode.
-   [ ] Provide Hindi-friendly labels.
-   [ ] Generate an explainable reorder suggestion or, at minimum, a
    useful threshold-based reorder list.
-   [ ] Prepare and share a distributor order draft.
-   [ ] Include a README, licence, contribution guide, and meaningful
    commit history.

### Stretch goals

-   [ ] Barcode scanning.
-   [ ] Expiry tracking.
-   [ ] Multi-branch support.
-   [ ] Optional cloud sync.
-   [ ] Gemma-assisted distributor-message parsing.

**Scope rule:** finish the smallest useful product before expanding it.
A reliable sale-to-reorder workflow is more valuable than a
half-finished collection of advanced features.

------------------------------------------------------------------------

## What We Will Not Build First

To protect the build window and the quality of the core experience, the
initial version will not attempt to become:

-   A full accounting or GST suite.
-   A complex point-of-sale billing terminal.
-   A payment gateway.
-   A marketplace or distributor network.
-   A multi-tenant cloud platform.
-   An AI chatbot that answers unrelated questions.
-   A forecasting system that hides uncertainty behind confident
    numbers.

These may be future directions, but they are not required to solve the
core problem.

------------------------------------------------------------------------

## Reliability, Privacy, and Data Integrity

RozKa handles business records, so reliability matters even in a
hackathon prototype.

### Reliability

-   Validate all user-entered values.
-   Handle database errors with understandable messages.
-   Avoid duplicate sale events from repeated taps.
-   Use transactions for related stock and event updates.
-   Test browser reloads and offline restarts.
-   Clearly disclose that local-only data may be lost if the user clears
    browser storage or loses the device.

### Privacy

-   Keep business data on the device in the MVP.
-   Do not transmit sales or product data to a remote service unless an
    explicitly implemented feature requires it.
-   If remote services or AI are added, document what information is
    sent and why.
-   Do not put secrets or API keys in the frontend bundle or public
    repository.

### Data integrity

-   Keep sales and stock adjustments distinguishable.
-   Provide a correction path for mistakes.
-   Explain how negative stock is handled.
-   Never fabricate missing sales history or price data.
-   Make reorder assumptions visible.

------------------------------------------------------------------------

## Testing and Demo Plan

The demo should prove the product solves the problem, not merely that
the interface looks good.

### Suggested three-minute demo

1.  Open RozKa and show the Hindi-friendly interface.
2.  Add a sample product and set its current stock and threshold.
3.  Record a sale and show the stock changing immediately.
4.  Show the product appearing in the low-stock list after it crosses
    its threshold.
5.  Show a slow-moving item using sample sales history.
6.  Generate a reorder suggestion and explain the calculation.
7.  Prepare and share a distributor order draft.
8.  Switch to airplane mode, reload the app, and record another sale.
9.  If the Gemma feature is implemented, demonstrate a distributor
    message becoming a validated draft order.

### Minimum test cases

-   Sale reduces stock by the correct quantity.
-   Fractional quantities work for supported units.
-   Invalid and non-finite quantities are rejected.
-   Reversing a sale restores the correct quantity without
    double-counting.
-   Low-stock detection respects the configured threshold.
-   A product with no history is not falsely labelled as proven dead
    stock.
-   Reorder output never becomes negative.
-   Missing lead-time or sales data is handled transparently.
-   Data survives reload and offline restart.
-   Sharing has a fallback when the Web Share API is unavailable.

### Demo data

Use clearly labelled illustrative data for the demo. Do not imply that
seeded data came from a real shop or that estimated savings are measured
results unless they have been verified.

------------------------------------------------------------------------

## Getting Started

> **Implementation note:** This section describes the intended
> development setup. The exact commands and scripts should be updated to
> match the repository once the application scaffold is created.

### Prerequisites

-   Node.js LTS
-   npm
-   A modern browser with IndexedDB and service-worker support

### Setup

After the project scaffold and scripts have been created:

``` bash
git clone <repository-url>
cd rozka
npm install
npm run dev
```

Open the local URL printed by Vite.

### Production build

``` bash
npm run build
npm run preview
```

The production build must be tested through a secure context or
localhost so service-worker behaviour can be verified. Test the deployed
build on an actual phone as well as a desktop browser.

### Before claiming offline support

Verify service-worker registration, cached assets, local persistence,
reload behaviour, and sale recording in airplane mode. A development
server that is still running on the laptop does not prove that the
deployed PWA works offline.

------------------------------------------------------------------------

## Project Structure

A possible structure for the implementation:

``` text
rozka/
├── public/
│   ├── icons/
│   └── manifest.webmanifest
├── src/
│   ├── app/
│   ├── components/
│   ├── features/
│   │   ├── products/
│   │   ├── sales/
│   │   ├── inventory/
│   │   ├── reorder/
│   │   └── settings/
│   ├── db/
│   ├── lib/
│   │   ├── inventory/
│   │   ├── validation/
│   │   └── sharing/
│   ├── i18n/
│   ├── styles/
│   └── main.tsx
├── tests/
├── README.md
├── CONTRIBUTING.md
├── LICENSE
├── package.json
└── vite.config.ts
```

This is a proposed structure, not a statement that these files already
exist.

------------------------------------------------------------------------

## Roadmap

### Phase 1 --- Reliable essentials

-   Product catalogue
-   Fast sale recording
-   Local stock updates
-   Low-stock and slow-moving lists
-   IndexedDB persistence
-   Offline PWA shell
-   Hindi-friendly UI

### Phase 2 --- Better reorder decisions

-   Sales-velocity calculations
-   Supplier lead-time settings
-   Explainable suggested quantities
-   Editable distributor order list
-   Share and copy fallback

### Phase 3 --- Carefully chosen extensions

-   Barcode scanning
-   Expiry tracking where useful
-   Optional backup and synchronisation
-   Gemma-assisted message parsing with schema validation and human
    confirmation

### Phase 4 --- Learn from real shops

-   Test with shopkeepers
-   Measure time to record a sale
-   Observe where users get confused
-   Improve language, touch targets, and product setup
-   Evaluate whether recommendations are useful and trusted

Progress should be driven by observed user needs, not by the number of
features on the roadmap.

------------------------------------------------------------------------

## Open Source

RozKa is being developed in the spirit of Hacktoberfest: an open-source
solution to a real operational problem.

The repository should include:

-   An OSI-approved open-source licence.
-   A README with setup, architecture, limitations, and attribution.
-   A `CONTRIBUTING.md` with practical instructions.
-   Clear setup and test instructions.
-   Credits for libraries, tools, models, datasets, and other assets.
-   Small, honest, meaningful commits that reflect actual work.
-   No secrets, private user data, or unlicensed assets.

The licence should be chosen explicitly before publishing. Do not claim
a licence has been applied until the corresponding `LICENSE` file is
present.

------------------------------------------------------------------------

## Contributing

Contributions are welcome once the repository's contribution process is
established.

Before submitting a change:

1.  Read `CONTRIBUTING.md`.
2.  Keep changes focused and explain the problem they solve.
3.  Test the affected workflow, especially stock calculations and
    offline behaviour.
4.  Do not include credentials, real shop records, or private data.
5.  Document new dependencies and externally sourced assets.
6.  Use meaningful commit messages that accurately describe the work.

Potential contribution areas include accessibility, Hindi wording, unit
handling, inventory logic, offline reliability, testing, and
documentation.

------------------------------------------------------------------------

## Acknowledgements

RozKa's initial product direction is based on the **Kirana Problem**
brief from **GDG on Campus SRMCEM × MLH Hackfest Lucknow, 21 October
2026**.

The proposed implementation uses open-source web technologies. Specific
dependency, model, and asset credits should be added as those components
are selected and integrated.

------------------------------------------------------------------------

## Project Status

**Stage:** Product concept and implementation plan.

The feature list, architecture, and roadmap in this document describe
the intended solution. They should not be interpreted as proof that
every feature has already been implemented or tested.

As development progresses, update this README to distinguish: -
Implemented and tested features - Implemented but unverified features -
Planned features - Known limitations

------------------------------------------------------------------------

::: {align="center"}
**RozKa**

*Roz ka hisaab. Business ka sukoon.*

Built for the people who keep neighbourhood commerce moving.
:::
