# 07 — Threat Model

Method: asset-centred STRIDE over the data-flow in 03. Scope is the MVP (offline PWA, no backend). Stretch features add threats noted in §6.

## 1. Assets

| ID | Asset | Why it matters |
|---|---|---|
| A1 | Stock + sales ledger | The owner's business information (what sells, margins, volumes) |
| A2 | Item prices/costs (if entered) | Competitive/commercial information |
| A3 | App integrity (code in cache) | A tampered app could corrupt data or exfiltrate it |
| A4 | Backup files | Full copy of A1/A2 outside the app |
| A5 | Availability of the app offline | The product promise |

## 2. Trust assumptions
- The phone's OS and browser are trusted; a rooted/malware-infested phone is out of scope.
- The static host is trusted for code delivery over HTTPS only; it never sees data.
- Anyone holding the unlocked phone can use the app (no accounts in MVP).

## 3. Threats and mitigations (STRIDE)

| # | STRIDE | Threat | Asset | Likelihood / Impact | Mitigation |
|---|---|---|---|---|---|
| T1 | Tampering | Malicious update served (compromised host or repo) | A3 | Low / High | HTTPS only; HSTS; pin deploys to CI from protected branch; Subresource Integrity on any external file (target: none external); SW only updates from same origin; release tags signed |
| T2 | Tampering | XSS via item names (e.g. `<img onerror>` typed or imported) | A1, A3 | Medium / High | Render all user text via text nodes (Preact escapes by default); never `innerHTML`; strict **CSP** (`default-src 'self'; script-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'`); validate import file (§T7) |
| T3 | Information disclosure | Another person opens phone and reads sales | A1, A2 | Medium / Medium | Optional 4-digit app lock (stretch); prices optional; documented clearly that data is on-device |
| T4 | Information disclosure | Order text leaks more than intended | A1 | Low / Low | Share text contains only item names + quantities; shown for review before sending; no stock levels or prices |
| T5 | Information disclosure | Third-party scripts/analytics exfiltrate data | A1 | Low / High | **Zero third-party scripts/fonts/CDNs**; CSP `connect-src 'self'` blocks any exfil; no analytics |
| T6 | Denial of service / Loss | Browser evicts IndexedDB under storage pressure | A1, A5 | Medium / High | `navigator.storage.persist()`; warn if denied; backup nudge every 7 days and after 100 entries; one-tap export |
| T7 | Tampering | Malicious or corrupted backup file imported | A1 | Low / Medium | Strict schema validation, ULID format and safe-integer checks, size cap (20 MB), single atomic transaction, "merge" by id (cannot silently overwrite without `replace` + confirmation) |
| T8 | Tampering | Double-recording due to retries/double-taps | A1 | High / Low | Idempotent ULIDs per submit; 300 ms lock on modal Save buttons only (item tiles are never debounced, because rapid taps are real sales); atomic transaction; undo via void movement |
| T9 | Repudiation | Helper claims they didn't make an entry | A1 | Low / Low | Ledger is append-only with timestamps and `device_id`; no deletion path in UI (only void) |
| T10 | Spoofing | Look-alike phishing page imitating the app | A3 | Low / Medium | Single canonical HTTPS origin; install via that origin only; app name/icon consistent; no credential entry exists in the app, limiting phishing value |
| T11 | Elevation of privilege | Service worker scope abuse / stale SW pinned to bad build | A3 | Low / Medium | SW scope limited to app path; versioned caches; no remote kill-switch (app makes no network calls), so a bad SW is fixed by shipping a corrected build through the normal update flow; rollback steps in 09 |
| T12 | Denial of service | Corrupt cache leaves app blank offline | A5 | Medium / High | Precache verification after install ("Offline ready ✓" only once all assets cached); fallback offline page with "restore from backup"; tested in 08 |
| T13 | Information disclosure | Browser clearing site data deletes everything | A1 | Medium / High | Same as T6; on first run explain "Chrome ka data clear mat karein" in plain Hindi |
| T14 | Tampering | Clock changed on device skews velocity and expiry | A1 | Low / Low | Ledger uses ULID order for sequence; reorder engine clamps future timestamps; expiry shows warning if clock jumps > 7 days |

## 4. Data classification
| Data | Class | Handling |
|---|---|---|
| Item names, quantities | Business-confidential, no personal data | On-device only |
| Prices | Business-confidential | Optional field; excluded from share text |
| Barcodes | Non-sensitive | On-device |
| Customer information | **Not collected** | By design (non-goal) |

No personal data of customers or the owner is collected, so privacy-law exposure is minimal; there is no account, email or phone number in the MVP.

## 5. Security requirements derived (traceable to 02)
| Req | Source threat | Check |
|---|---|---|
| SR-1 No `innerHTML`/`dangerouslySetInnerHTML` in codebase | T2 | Lint rule + grep in CI |
| SR-2 CSP header/meta with `connect-src 'self'` | T2, T5 | E2E asserts header; Lighthouse best-practices |
| SR-3 No external origins in network log during a full session | T5 | Playwright network assertion |
| SR-4 Import rejects crafted files | T7 | Fuzz test: 200 malformed inputs |
| SR-5 Persist requested and warning shown if denied | T6 | Manual + unit |
| SR-6 HTTPS only, HSTS on host | T1, T10 | Deployment checklist (09) |
| SR-7 Backup reminder after 7 days / 100 entries | T6, T13 | Unit |

## 6. Stretch-feature threats
| Feature | New threat | Mitigation |
|---|---|---|
| Camera barcode | Unwanted camera access | Permission requested only on tapping Scan; stream stopped on leave; no frames stored or transmitted |
| WhatsApp share | Order sent to wrong chat | Share sheet is OS-controlled; owner reviews text; no auto-send |
| Multi-shop | Mixing data across shops | Every store row has `shop_id`; all repo queries require it; test for cross-shop leakage |
| Cloud sync (future) | Account takeover, data in transit/at rest | Per-device tokens, TLS, E2E encryption option, rate limits — out of MVP |
| App lock | Brute-force 4-digit PIN | Local lockout backoff (e.g., 30 s after 5 tries); acknowledged as casual protection only |

## 7. Residual risks accepted
- Anyone with the unlocked phone sees the data (no accounts).
- Device loss without a recent backup loses data.
- Browser storage eviction is not fully preventable on all devices.
