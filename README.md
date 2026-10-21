# RozKa

**Roz ka hisaab. Business ka sukoon.**

RozKa is an offline-first inventory and stock management application designed for neighbourhood retailers. It brings everyday shop tasks—managing products, recording sales, checking stock, and preparing replenishment lists—into one simple experience built around the way small shops operate.

The goal is straightforward: help shopkeepers understand what is in stock, what is selling, and what may need to be reordered, without depending on complicated software or a constant internet connection.

> **Development status:** This repository’s implementation is not yet published. This README describes the intended product and architecture; it should be updated as features are implemented and verified.

## Contents

- [The problem](#the-problem)
- [How RozKa works](#how-rozka-works)
- [Core capabilities](#core-capabilities)
- [Reorder suggestions](#reorder-suggestions)
- [Offline-first experience](#offline-first-experience)
- [Product principles](#product-principles)
- [Technology](#technology)
- [Architecture overview](#architecture-overview)
- [Data model](#data-model)
- [Reliability and data integrity](#reliability-and-data-integrity)
- [Project status](#project-status)
- [Local development](#local-development)
- [Open source](#open-source)

## The problem

Neighbourhood retailers often manage stock through notebooks, memory, calculator apps, and messages exchanged with suppliers. These methods can work, but they make routine questions harder to answer:

- Which products are running low?
- What sold today, and how much stock should remain?
- Which products have not been selling?
- What should be included in the next supplier order?
- How can stock be managed when the internet is slow or unavailable?

Large retail systems can be too complex for these everyday needs. RozKa is designed around a smaller set of practical tasks, with a straightforward interface and inventory information that is easy to understand.

## How RozKa works

RozKa centres on a simple retail workflow:

1. **Add products.** Create a product catalogue with names, units, available quantities, and stock thresholds.
2. **Record sales.** Enter the products and quantities sold. The inventory calculation reflects the sale.
3. **Review stock.** Check current quantities and identify products that have reached their low-stock thresholds.
4. **Understand what needs attention.** Use recorded sales history to review fast-moving and slow-moving products.
5. **Prepare a supplier order.** Review suggested quantities, adjust them as needed, and prepare a list to share with a supplier.

The aim is to keep the routine actions quick and make important stock information available without forcing shopkeepers through complex reports.

## Core capabilities

### Product and inventory management

The product catalogue is the foundation of inventory tracking. Each product can be associated with a name, a unit of measurement, a current quantity, and a low-stock threshold.

Retail quantities are not always whole numbers. A practical inventory system should support units such as pieces, packets, kilograms, and litres, including fractional quantities where appropriate.

### Quick sales entry

Sales entry is designed to minimise the effort required to record an everyday transaction. When a sale is recorded, the corresponding quantity is deducted from inventory so that the stock view reflects the recorded activity.

Accurate inventory depends on accurate inputs. The application should make quantities clear and provide a way to correct mistakes without silently losing the history of a stock change.

### Low-stock visibility

A low-stock view helps a retailer focus on products that may need attention. Rather than requiring a shopkeeper to inspect the entire catalogue, it surfaces products whose available quantity has reached a configured threshold.

Thresholds should be adjustable because demand, delivery times, and storage capacity vary from shop to shop.

### Sales history and slow-moving products

Recorded sales can help reveal which products move regularly and which have seen little or no activity over a selected period. This can support better purchasing decisions and reduce the risk of repeatedly replenishing products that are not selling.

Any such insight depends on the history available in the application. Missing or incomplete sales records should not be treated as proof that a product has no demand.

### Supplier order lists

A replenishment list brings the products that need attention into one place. Suggested quantities should remain editable so that a retailer can account for local demand, supplier availability, pack sizes, and other practical considerations before placing an order.

The list is intended to be easy to review and share using available device sharing options, with a copyable-text fallback where supported.

## Reorder suggestions

RozKa is designed to make reorder calculations understandable. Rather than presenting an unexplained number, the application can base a suggested quantity on sales history, current inventory, supplier lead time, and a safety-stock allowance.

A basic target-stock estimate is:

```text
target stock = (average daily sales × supplier lead time in days)
               + safety stock
```

The inventory position can account for stock currently available and any outstanding order quantity recorded in the system:

```text
inventory position = current stock + outstanding order quantity

suggested order = max(0, target stock - inventory position)
```

The exact calculation must use consistent units and account for the way outstanding orders are represented. Where there is not enough reliable sales history, the application should communicate that limitation rather than produce a falsely precise forecast.

These suggestions are decision-support estimates. Retailers remain in control of the final order quantity.

## Offline-first experience

Connectivity can be inconsistent in real retail environments. RozKa is designed so that essential inventory workflows can remain available when a reliable internet connection is not present.

The intended approach uses local browser storage for application data and Progressive Web App capabilities to cache the application shell. IndexedDB can hold structured local records, allowing supported operations to work without sending every action to a remote server.

Offline support requires careful implementation. The application must distinguish locally saved changes from synchronised data if cloud synchronisation is introduced. It must not indicate that a change has reached another device or a server unless that operation has actually succeeded.

## Product principles

- **Simple by default:** prioritise everyday shop tasks over complicated dashboards.
- **Offline-aware:** design core workflows around unreliable connectivity.
- **Language-friendly:** use clear, readable labels and plan for Hindi and English interfaces.
- **Touch-friendly:** make frequent actions comfortable to use on a phone.
- **Transparent calculations:** show how reorder quantities are estimated.
- **Human-controlled decisions:** keep suggested orders editable and require confirmation for consequential actions.
- **Honest about data:** distinguish recorded facts from estimates and avoid inventing missing sales history.

## Technology

The intended stack is:

| Area | Technology | Purpose |
|---|---|---|
| Application interface | React | Build the interactive user interface |
| Development and build tooling | Vite | Run the development server and produce production builds |
| Language | TypeScript | Improve type safety for inventory records and calculations |
| Local persistence | IndexedDB | Store structured data in the browser |
| Offline application support | Progressive Web App and service worker | Cache the application shell for supported offline use |
| Inventory calculations | TypeScript domain logic | Keep stock and reorder calculations deterministic and testable |

The final implementation may differ. This table should be revised to match the dependencies and architecture actually present in the repository.

## Architecture overview

The intended application separates the user interface from inventory rules and local persistence:

```text
User interface
      |
      v
Inventory and sales workflows
      |
      v
Inventory domain logic
      |
      +---- Stock calculations
      +---- Low-stock checks
      +---- Reorder estimates
      |
      v
Local data layer (IndexedDB)
      |
      v
Browser storage
```

Keeping inventory calculations separate from the interface makes the rules easier to test and reduces the risk of different screens calculating stock differently. The data layer is responsible for reading and writing records, while the domain logic determines how sales and stock adjustments affect quantities.

This is an architectural direction, not a claim that these modules already exist in code.

## Data model

The core data concepts are expected to include:

- **Product:** product name, unit, current quantity, low-stock threshold, and relevant product settings.
- **Sale:** products sold, quantities, timestamp, and any information needed to correct or review a transaction.
- **Stock adjustment:** quantity changes caused by corrections, damaged goods, restocking, or other non-sale events.
- **Settings:** shop preferences, language, and configuration such as reorder thresholds.
- **Supplier order:** where implemented, proposed quantities and order status, including outstanding quantities used by reorder calculations.

The exact schema should follow the implementation. Records that affect inventory should be validated and updated consistently to prevent duplicate deductions or partially saved changes.

## Reliability and data integrity

Inventory records directly affect purchasing decisions, so reliability matters.

RozKa’s implementation should account for:

- validating quantities and units before saving changes;
- keeping stock changes consistent when a sale is recorded;
- preventing accidental duplicate sale submissions;
- handling corrections explicitly;
- avoiding unexplained negative stock values;
- preserving data when the application is refreshed or reopened;
- communicating storage and synchronisation limitations clearly.

These are implementation requirements and should only be marked complete after they are covered by working code and tests.

## Project status

RozKa is being prepared for development. The repository has not yet been published, so the features and architecture described here represent the intended product rather than a verified list of implemented functionality.

As development progresses, this section should link to working features, known limitations, screenshots, tests, and release notes. Documentation should reflect the actual state of the code.

## Local development

Installation and run commands will be added after the repository is created and its package scripts are available. Once the project is scaffolded, this section should include:

- prerequisites and supported runtime versions;
- installation commands;
- instructions for starting the development server;
- build and test commands;
- any environment configuration required.

No API keys or private credentials should be committed to the repository.

## Open source

RozKa is intended to be developed in the open. The repository should include an appropriate open-source licence and contribution guidance before inviting external contributions. Bug reports and feature requests should describe the observed behaviour, expected behaviour, and steps to reproduce the issue where applicable.

---

**RozKa — everyday stock management, made simpler.**
