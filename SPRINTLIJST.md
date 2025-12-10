# LiquiLab Sprint Plan — S0 t/m SP6

> Status: bijgewerkt op 2025-11-30  
> Bron: SPRINTLIJST_paginated_clean_v3.docx + PROJECT_STATE.md + SP2 handovers  
> Doel: alle AI-assistenten (Codex, Composer 1, Gemini 3 Pro, Claude Sonnet, Claude Opus) een gedeelde “roadmap view” geven:  
> – aan welke sprint ze werken  
> – waarom die sprint bestaat  
> – hoe individuele taken in het grotere geheel passen

---

## 0. Global sprint overview

| Sprint | Naam                         | Hoofdthema                           | Status       | Tijdvak (indicatief) | Hoofd-domeinen                |
|-------|------------------------------|--------------------------------------|-------------|----------------------|--------------------------------|
| S0    | Foundation & Infra           | Staging, CI, verify-suite           | Afgerond    | 2025-10              | OPS, FE                        |
| SP1   | Brand & Design System        | Tokens, DS, hero, OG, typography    | 90%+ done   | 2025-10 → 2025-11    | FE, OPS                        |
| SP2   | Data & Analytics (Strategy C)| Data-pijplijn, MVs, Universe/Pro    | **Actief**  | 2025-11 → 2025-12    | DATA, API, FE, OPS            |
| SP3   | Billing & Compliance         | Stripe, entitlements, account, legal| Gepland     | Na SP2               | API, BILLING, FE, OPS, MAIL   |
| SP4   | Observability & Reliability  | Sentry, uptime, /status, FAQ        | Gepland     | Na SP3               | OPS, FE                        |
| SP5   | Polish & UX Components       | ErrorBoundary, Toast, Forms, DS UX  | Gepland     | Na SP4               | FE                             |
| SP6   | Alerts & Advanced Features   | Alerts, toggles, post-MVP features  | Gepland     | Na SP5               | API, FE                        |
| Post  | Post-MVP Nice-to-have        | Reports export, leaderboard, onboarding | Later   | Post-launch          | API, FE                        |

**Actuele sprint:**  
- **SP2 — Data & Analytics / Strategy C**  
  - Focus: PoolEvent → 7d-MVs → Universe/Position/Portfolio endpoints, plus Weekly report & FTSO-first SSoT.  
  - Alle data-/API-taken die nu worden opgepakt horen bij SP2, tenzij expliciet anders vermeld.

---

## 1. Sprint 0 (S0) — Foundation & Infrastructure Setup

### S0 — Doel & context

- Doel: basis neerzetten zodat alle latere sprints op een stabiele technische fundering draaien: staging, CI, verify-suite.  
- Status: praktisch afgerond (alleen kleine tuning mogelijk).

### S0 taken

| ID        | Domein | Titel                                               | Status    | Opmerkingen                                  |
|-----------|--------|-----------------------------------------------------|-----------|----------------------------------------------|
| S0-OPS01  | OPS    | Railway staging environment + DB + Stripe TEST etc. | Done      | Staging basis voor alle volgende sprints.    |
| S0-OPS02  | OPS    | `npm run verify` in CI met fail-hard thresholds     | Done      | Verify-suite is merge gate.                  |
| S0-OPS03  | OPS    | CI workflow voor automatic staging deploy           | Done      | PR → staging-deploy + verify.                |
| S0-FE06   | FE     | `npm run verify:brand` implementeren                | Done      | Brand guardrail voor merges.                 |
| S0-FE07   | FE     | `npm run verify:typography` implementeren           | Done      | Tabular-nums guardrail.                      |

---

## 2. Sprint 1 (SP1) — Foundation & Design System

### SP1 — Doel & context

- Hoofddoel: LiquiLab brand & design system neerzetten (tokens, DS, hero, OG, typografie) als basis voor alle FE.  
- Status: grotendeels afgerond, kleine restpunten mogen parallel aan SP2 opgepakt worden zolang ze data-werk niet blokkeren.

### SP1 taken (kern)

| ID       | Domein | Titel                                              | Status       | Notities                                     |
|----------|--------|----------------------------------------------------|--------------|----------------------------------------------|
| SP1-T37  | FE     | Figma Foundations → Style Dictionary → tokens.css | Done         | Brand tokens SSoT.                           |
| SP1-T38  | FE     | DS components visual spec in Figma                | 90% Done     | Basis voor ErrorBoundary/Toast/etc.         |
| SP1-T39  | FE     | OG & Social previews                              | In Progress  | Niet blocker voor SP2.                       |
| SP1-T40a | FE     | Wave-hero implementation                          | Done         | Hero-achtergrond in fold.                    |
| SP1-T40b | FE     | Typography & numerals refactor                    | In Progress  | Tabular-nums overal enforced.                |
| SP1-T30  | FE     | ErrorBoundary implementatie (FE-18)               | Verplaatst → SP5 | Zie SP5.                                   |
| SP1-T31  | FE     | Toast component (FE-19)                            | Verplaatst → SP5 | Zie SP5.                                   |
| SP1-T32  | FE     | Modal component (FE-20)                            | Verplaatst → SP5 | Zie SP5.                                   |
| SP1-T33  | FE     | Form.* components (FE-21)                          | Verplaatst → SP5 | Zie SP5.                                   |
| SP1-T36  | FE     | DataState component (FE-22)                        | Verplaatst → SP5 | Zie SP5.                                   |
| SP1-T13  | FE     | /faq page met Accordion                            | Verplaatst → SP4 | Zie SP4.                                   |

---

## 3. Sprint 2 (SP2) — Data & Analytics (Strategy C) — **ACTUEEL**

### SP2 — Hoofddoel & scope

- **Hoofddoel SP2:**  
  Data- & analytics-keten voor V3 LP’s op Flare zó inrichten dat Strategy C schermen (Universe, Pool Pro, Portfolio Pro) en het Weekly report op **stabiele, gedegradeerde, maar consistente MVs & endpoints** draaien.

- **Concrete doelen voor deze sprint:**
  1. PoolEvent backfill + 7d-MVs **stabiel en geverifieerd**.
  2. Minimaal 2 SP2-MVs als SSoT voor wallet- & position-overview volledig operationeel.
  3. Strategy C endpoints (`/api/analytics/pool`, `/api/analytics/position`, `/api/analytics/portfolio`) gevuld met echte MV-data (geen placeholders).
  4. Weekly report uit HALT halen en aligned maken met dezelfde pricing & MVs als de app.
  5. FTSO-first pricing SSoT expliciet vastleggen en afdwingen.

### 3.1 SP2 Data/MV-taken

| ID        | Domein | Titel                                           | Status        | Rol in grotere geheel                               |
|-----------|--------|-------------------------------------------------|---------------|-----------------------------------------------------|
| SP2-D01   | DATA   | MV wallet portfolio snapshot                    | PARTIAL       | Wallet-overview; opgegaan in nieuwe wallet-MVs.     |
| SP2-D02   | DATA   | MV position overview + RangeBand™ status        | **CRITICAL WIP** | SSoT voor RangeBand; voedt Pool/Position Pro.   |
| SP2-D03   | DATA   | MV position day stats (7d/30d)                  | Deferred → SP3| Nodig voor charts; niet blocker voor Strategy C v1. |
| SP2-D04   | DATA   | MV position events recent (7d-window)           | Deferred → SP3| Nice-to-have voor snelle event views.               |
| SP2-D10   | DATA   | PoolEvent backfill (SparkDEX + Enosys)          | Done          | Backfill afgerond 2025-12-02 (zie RUN_LOG).         |
| SP2-D11   | DATA   | 7d-MVs vullen + health checks                   | Done          | Alle 7d-MVs live + cron refresh (RUN_LOG 2025-12-03).|

**Korte duiding:**

- **D02, D10, D11** vormen de harde kern van SP2 aan de data-kant.  
- **D01** wordt functioneel ingevuld door bestaande wallet-MVs; D03+D04 schuiven door naar SP3.

### 3.2 SP2 API-taken

| ID        | Domein | Titel                                               | Status             | Relatie tot Strategy C                            |
|-----------|--------|-----------------------------------------------------|--------------------|---------------------------------------------------|
| SP2-T50   | API    | `/api/analytics/wallet/{wallet}/positions`         | Replaced by design | Rol opgenomen in `/api/positions` + Portfolio API |
| SP2-T51   | API    | `/api/rangeband/preview`                           | Parked / SP2+      | Voor range-calculator/alerts, niet SP2-blocker.   |
| SP2-T60   | API    | Weekly report weer activeren                        | **NEW / MUST**     | Weekly gebruikt dezelfde MVs/pricing als app.     |
| SP2-T61   | API    | FTSO-first policy expliciet maken & handhaven      | **NEW / MUST**     | Eén prijs-SSoT voor TVL/APR/Weekly.               |
| SP2-T62   | API    | Legacy pricing paths opschonen                     | NEW / SHOULD       | Restanten oude /prices-varianten wegnemen.        |

### 3.3 SP2 Strategy C endpoints (Universe / Position / Portfolio)

| ID        | Domein | Titel                                                     | Status        | Waarvoor gebruikt                                |
|-----------|--------|-----------------------------------------------------------|---------------|--------------------------------------------------|
| SP2-T70   | API    | Pool Universe endpoint wiring (volgens mapping-doc)       | Done          | Endpoint live en degrade-safe (RUN_LOG 2025-11-30). |
| SP2-T71   | API    | Position Pro endpoint wiring (volgens mapping-doc)        | CRITICAL WIP  | Voedt Position Pro scherm (Strategy C).          |
| SP2-T72   | API    | Portfolio endpoint afronden (PortfolioAnalyticsResponse)  | SHOULD        | Voedt Wallet Pro / Portfolio Pro.                |

### 3.4 SP2 Frontend integraties

| ID        | Domein | Titel                                       | Status       | Notities                                          |
|-----------|--------|---------------------------------------------|-------------|---------------------------------------------------|
| SP2-T13   | FE     | `/api/analytics/summary` integreren in /summary | Done     | Draait al met degrade-mode.                       |
| SP2-T14   | FE     | MV position overview in /pool/[id] integreren  | WIP      | Wacht op D02/T70 (RangeBand SSoT).                |
| SP2-T15   | FE     | Day Stats Chart 7d/30d                        | Deferred → SP3 | Koppelt aan D03.                                |
| SP2-T16   | FE     | RangeBand preview UI integratie              | Parked / SP2+ | Afhankelijk van T51; niet SP2-kritiek.         |
| SP2-FE-WALLET | FE | Wallet/Portfolio Pro FE — wallet-level positions view | TODO | Portfolio Pro scherm koppelen aan analytics endpoints/MVs (`mv_wallet_portfolio_latest`, Portfolio endpoint). Verifier: **Pro golden wallet 0x57d294d815968f0efa722f1e8094da65402cd951**. |
| SP2-FE-POOL-UNIVERSE | FE | Pool Universe FE — /pool/[poolAddress]/universe | TODO | Universe UI voeden met SP2-T70 output; kies/markeer golden pools uit PROJECT_STATE voor QA (TODO). |
| SP2-FE-POSITION-PRO | FE | Position Pro FE — /position/[tokenId]/pro | TODO | Position Pro scherm koppelen aan SP2-T71 endpoint + `mv_position_lifetime_v1`; gebruik Pro wallet voor testposities. |

### 3.5 SP2: hoe AI’s dit moeten zien

- **Als je aan indexers/MVs werkt (Codex/Composer/Gemini):**  
  Je zit in **SP2-D10/D11/D02**. Doel: 7d-laag en RangeBand SSoT stabiel krijgen.
- **Als je endpoints of Weekly aanpast:**  
  Je zit in **SP2-T60/T61/T62/T70/T71/T72**. Doel: Universe/Position/Portfolio endpoints vullen met MVs en Weekly alignen.
- **Als je frontend-schermen voor Universe/Pro bouwt:**  
  Je gebruikt de Strategy C endpoints; in SP2 is je taak vooral om **niet** om data-SSoT heen te werken.
- **Golden wallets voor QA:**  
  - Pro account: `0x57d294d815968f0efa722f1e8094da65402cd951`  
  - Premium account: `0x88ef07c79443efdf569c6e22aa21501d1702a8f7`

---

## 4. Sprint 3 (SP3) — Billing & Compliance

### SP3 — Doel & context

- Doel: billing, entitlements, account/settings, GDPR flows en pricing-page compliance afronden.  
- Start na SP2, zodat data/analytics eerst stabiel zijn.

### SP3 hoofd-clusters

1. **Billing & entitlements (server-authoritative):**  
   - SP3-T52 (Entitlements endpoint)  
   - SP3-B01/B02/B03 (email verplicht, EUR-label, trial badge)  
2. **Account & user settings:**  
   - SP3-T21/T22/T23/T24/T25/T26 (pricing-page UX, /account, settings CRUD, delete flow)  
3. **Legal & gating:**  
   - SP3-T42 (legal pages), SP3-G01/G02 (gating hook + route matrix)

### SP3 taken (samenvatting)

| ID        | Domein   | Titel                                        | Status   | Notities |
|-----------|----------|----------------------------------------------|----------|----------|
| SP3-T52   | API      | `/api/entitlements` (server-authoritative)   | WIP      | Endpoint live (staging) maar FE gating + plan badges nog niet afgerond; testen met golden wallets. |
| SP3-T53   | API      | `/api/user/settings`                         | Planned  | CRUD + UI wiring nodig. |
| SP3-T54   | API      | `/api/user/delete` (GDPR)                    | WIP      | API stub actief (`degrade:true`), UI/bevestiging emails pending. |
| SP3-B01   | BILLING  | Email verplicht in Stripe checkout           | Planned  | Stripe TEST keys aanwezig. |
| SP3-B02   | BILLING  | EUR label + 24h FX cache                     | Planned  | Sluit aan op SP2 pricing SSoT. |
| SP3-B03   | BILLING  | Trial countdown badge                        | Planned  | Afhankelijk van entitlements. |
| SP3-T21-23| FE       | /pricing: email/EUR/trial + calculator UX    | Planned  |  |
| SP3-T24   | FE       | /account page                                | Planned  |  |
| SP3-T25   | FE       | /account settings API integratie             | Planned  |  |
| SP3-T26   | FE       | /account delete flow                         | Planned  | Gebruikt SP3-T54. |
| SP3-T42   | OPS+FE   | /legal/privacy, /legal/terms, /legal/cookies | Planned  | Basispagina’s staan, copy/compliance afronden. |
| SP3-G01   | FE+API   | `usePlanGating()` hook                       | WIP      | Hook deels aanwezig; Visitor UI nog inconsistent. |
| SP3-G02   | FE+API   | Route×plan matrix enforcement                | WIP      | Route matrix deels afgedwongen, gating in UI nog te finetunen. |
| SP3-M01   | OPS+MAIL | Mailgun setup & verification                 | Planned  | DNS + env + API verify (`MAILGUN_MODE=degrade` in staging). |
| SP3-M02   | MAIL     | Mailgun e-mailflows (billing & compliance)   | Planned  | Welkom, trial reminder, payment failed/dunning, GDPR delete bevestiging. |
| SP3-ADM01 | OPS+FE   | Admin dashboard & ops overview               | Planned  | TVL/Premium/Pro counts, cron/indexer status, error feed. |

---

## 5. Sprint 4 (SP4) — Observability & Reliability

### SP4 — Doel & context

- Doel: observability (Sentry, uptime, health/status) en enkele supportende UI-pagina’s (FAQ, /status).  
- Dit is de “we kunnen rustig slapen”-sprint: errors, downtime en component-health zijn zichtbaar.

### SP4 taken (samenvatting)

| ID        | Domein | Titel                                       | Status   |
|-----------|--------|---------------------------------------------|----------|
| SP4-B04   | OPS+FE | Sentry front+back + ErrorBoundary hook-up   | Planned  |
| SP4-B05   | OPS    | Uptime monitor (/api/health)                | Planned  |
| SP4-T43   | OPS+FE | /status internal panel                      | Planned  |
| SP1-T13   | FE     | /faq page (Accordion)                       | Moved → SP4 |
| SP4-L01   | OPS+FE | CookieBanner component (FE-16)              | Planned  |

---

## 6. Sprint 5 (SP5) — Polish & UX Components

### SP5 — Doel & context

- Doel: alle DS-componenten uit SP1 nu echt in code landen (ErrorBoundary, Toast, Modal, Forms, DataState).  
- Timing: pas na SP3/SP4, zodat polish bovenop stabiele app/data gebeurt.

### SP5 taken (samenvatting)

| ID       | Domein | Titel                         | Status   |
|----------|--------|-------------------------------|----------|
| FE-18    | FE     | ErrorBoundary component       | Planned  |
| FE-19    | FE     | Toast component               | Planned  |
| FE-20    | FE     | Modal component               | Planned  |
| FE-21    | FE     | Form.* components             | Planned  |
| FE-22    | FE     | DataState component           | Planned  |

---

## 7. Sprint 6 (SP6) — Alerts & Advanced Features

### SP6 — Doel & context

- Doel: alerts-infra (CRUD, toggles) en eerste advanced features bovenop de data/analytics-kern.

### SP6 taken (samenvatting)

| ID       | Domein | Titel                             | Status   |
|----------|--------|-----------------------------------|----------|
| SP6-T55  | API    | Alerts CRUD `/api/user/alerts`    | Planned  |
| SP6-T32  | FE     | Alerts toggles in dashboard       | Planned  |

---

## 8. Post-MVP — Nice to Have

### Post-MVP taken (samenvatting)

| ID        | Domein | Titel                    | Status   |
|-----------|--------|--------------------------|----------|
| POST-REP  | API+FE | Reports export (CSV/PDF) | Later    |
| POST-LB   | API+FE | Leaderboard              | Later    |
| POST-ONB  | FE     | Onboarding wizard       | Later    |

---

## 9. Gebruik door AI-assistenten

- **Altijd eerst:**
  - Lees `PROJECT_STATE.md` voor actuele stand van zaken.
  - Raadpleeg deze `SPRINTLIJST.md` om te weten in welke sprint je taak valt.
- **Bepaal sprint-context:**
  - _Is dit een data- of endpoint-taak?_ → hoogstwaarschijnlijk **SP2** (nu).
  - _Is dit billing/compliance?_ → **SP3**.
  - _Is dit observability/health?_ → **SP4**.
- **Bij Codex/Composer prompts:**
  - Verwijs expliciet naar Sprint-ID (bijv. `Sprint/ID: SP2-D10`) zodat duidelijk is in welke context de wijziging valt.
  - Bewaak dat je geen werk uit een latere sprint vervroegd oppakt, tenzij expliciet gevraagd.
