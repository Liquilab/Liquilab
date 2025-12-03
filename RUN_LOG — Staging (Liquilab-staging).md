## RUN_LOG — Staging (Liquilab-staging)

> All timestamps in this log are Europe/Amsterdam local time. AI entries use YYYY-MM-DDT.. (time placeholder); precise times may be added manually.

RAW / NFPM
OK 2025-11-27T16:34 npm run indexer:nfpm:full:enosys  (voltooid->MV)
OK 2025-11-27T17:28 npm run indexer:sparkdex:nfpm (voltooid ->MV)
NOTE 2025-11-27T17:28 rFLR rewards backfillen (DB)
NOTE 2025-11-27T17:28 Aps rewards backfillen (DB)
NOTE 2025-11-27T17:28 Delegation rewards backfillen (DB)
NOTE 2025-11-27T17:28 Swap fee checken (DB)
WIP 2025-11-30T.. START PoolEvent tail backfill (resume)

WIP 2025-11-30T07:51 Nieuw Projectmanager chat inrichten op basis van handovers van Data Enrichment en Strategy C chats


FTSO
OK 2025-11-27T17:28 npm run indexer:ftso:follow (voltooid 8/10's maken prijzen)
WIP 2025-11-27T22:25 getAssetPriceUsd (DB in orde maken -NU alleen RAW data)
NOTE 2025-11-27T23:09 getReportPricingSnapshot  (Follow up sprint)

DATABASE
OK 2025-11-28T00:29 BACKUP GEMAAKT OP 2025-11-27T23:28 (STAGING)

REPORTS
HALT 2025-11-27T23:09 npm run report:weekly  (geparkeerd. DB in orde maken)
OK 2025-11-27T23:09 MVs aanmaken  (mv_position_state_v2 + mv_universe_range_efficiency_30d gevuld, 7d pool-MVs structureel aanwezig maar leeg omdat PoolEvent=0)
WIP 2025-11-27T23:09 enrich:pools:nfpm voor Enosys  (Pools gevuld voor Enosys + SparkDEX via NFPM))
READY 2025-11-28T..   PoolEvent backfill  (SparkDEX + Enosys swaps/mints/burns/collects voor 7d-MVs — v5 “dumb & explicit” script geïmplementeerd per Gemini prompt; command: `npm run backfill:poolevents:full -- --dex=all --mode=resume`. Nog niet gedraaid sinds herimplementatie.)
NOTE 2025-11-28T14:47 Backup tergzetten ivm PoolEvent data
WIP 2025-11-30T09:00 START lint fix verify-enrichment scripts (SP2-D11/SP2-T60)
OK 2025-11-30T09:05 DONE lint fix verify-enrichment scripts — npm run verify should be clean for these files
WIP 2025-11-30T09:09 START fix /api/analytics/summary 500 (verify:api:analytics, SP2-T13/SP2-T70)
NOTE 2025-11-30T09:15 Backfills draaien nog — analytics degradeert graceful tijdens backfills (query timeout 10s)
OK 2025-11-30T09:20 FIXED /api/analytics/summary 500 — verify:api:analytics should now pass (SP2-T13/SP2-T70)
WIP 2025-11-30T09:25 START SP2-D10 PoolEvent backfill progress & health tooling
OK 2025-11-30T09:30 SP2-D10 progress/health scripts ready — run before SP2-D11 (7d-MVs) and SP2-T60 (Weekly)
NOTE 2025-11-30T09:31 SP2-D10 tooling gereed; backfill draait. SP2-D11 (7d-MVs) en SP2-T60 (Weekly) blijven on hold tot backfill + checks groen.
NOTE 2025-11-30T09:40 SP2-T61: FTSO-first pricing SSoT vastgelegd (FTSO primary, CoinGecko fallback). Geen runtime wijzigingen; backfill blijft draaien.
WIP 2025-11-30T12:50 START SP2-T70 Universe endpoint wiring (/api/analytics/pool/[poolAddress])
OK 2025-11-30T13:00 SP2-T70 Universe endpoint wired to analytics MVs with degrade-safe behaviour; no backfills or MVs refreshed.
WIP 2025-11-30T13:30 START SP2-T70/T71 Universe/Pro data-state UX wiring
OK 2025-11-30T.. SP2-T70/T71 UX data states + FTSO disclaimer integrated (ok/warming/empty); no backend or backfills changed.
WIP 2025-11-30T13:30 START SP2-T70/T71 Strategy C data-state UX wiring (Universe/Pool/Position Pro)
OK 2025-11-30T13:30 SP2-T70/T71 data-state UX wiring complete for Universe, Pool Pro, Position Pro; no backend or backfills changed.
WIP 2025-12-02T.. START Railway Cron Job setup voor MV refresh (SP2-D11/SP2-T60)
OK 2025-12-02T.. Railway Cron Job geconfigureerd voor automatische MV refresh elke 10 minuten via `/api/enrich/refresh-views` endpoint. Cron job service gekoppeld aan Liquilab-staging web service. `CRON_SECRET` environment variable geconfigureerd in beide services. Documentatie: `docs/RAILWAY_CRON_MV_REFRESH.md`.
OK 2025-12-02T22:50 V3 pools indexer backfill compleet: 277.246 blocks gescand (51,313,812→51,593,215), 14.554 logs gevonden, 3.403 events geschreven. Performance: 74 blocks/s, ANKR cost: $0.0444. Checkpoints bijgewerkt: NPM:global op 51,591,057, FACTORY:enosys/sparkdex op 51,590,932. Indexer follower kan nu starten vanaf block 51,590,933.
OK 2025-12-02T23:30 Fix: nfpmAddress null constraint error opgelost. Schema bijgewerkt met nfpmAddress veld voor PositionEvent, decoder en dbWriter aangepast om nfpmAddress te vullen vanuit log.address. Migratie gemarkeerd als applied op Railway. Indexer zou nu PositionEvent records moeten kunnen schrijven zonder errors.

MATERIALIZED VIEWS
WIP 2025-12-03T00:30 START MV refresh endpoint fixes - MVs ontbraken in database
OK 2025-12-03T00:45 Fix: Inline SQL definities voor alle MVs in `/api/enrich/refresh-views` endpoint (geen file system access nodig)
OK 2025-12-03T00:50 Fix: CONCURRENTLY fallback - als MV niet populated is, refresh zonder CONCURRENTLY eerst
OK 2025-12-03T00:55 Fix: Type cast voor SUM() in mv_pool_fees_24h (CAST to NUMERIC)
OK 2025-12-03T01:00 Fix: Unique indexes toegevoegd aan alle MVs voor CONCURRENTLY refresh support
OK 2025-12-03T01:10 API endpoints toegevoegd: `/api/enrich/drop-mvs` en `/api/enrich/drop-single-mv` voor MV management
OK 2025-12-03T01:20 ✅ ALLE 10 MVs WERKEN! Refresh endpoint volledig functioneel. Totale refresh tijd: 378ms. Cron job (elke 10 min) zal MVs automatisch refreshen.
OK 2025-12-03T01:30 Fix: nfpmAddress code was niet gepusht naar Railway. Nu gecommit en gepusht: src/indexer/dbWriter.ts, src/indexer/eventDecoder.ts, prisma/schema.prisma, migration. Indexer zou nu PositionEvents correct moeten schrijven.
OK 2025-12-03T01:35 ✅ INDEXER WERKT! Events worden correct geschreven. Checkpoint op block 51,598,996. Geen null constraint errors meer. V3 pools indexer follower is volledig operationeel.
OK 2025-12-03T01:45 ANKR backfill compleet: 8.208 blocks, 275 events, 115s, $0.0013. MVs refreshen correct (221ms voor alle 10). Cron job actief.

DATA ENRICHMENT & ANALYTICS
NOTE 2025-12-03T02:00 SP2: mv_position_lifetime_v1 MV aangemaakt (db/views/mv_position_lifetime_v1.sql). Lifetime v3 LP positions (Enosys + SparkDEX v3 on Flare), one row per tokenId. Verifier: `npm run verify:data:lifetime-vs-w3` vergelijkt coverage vs W3 Cross-DEX reference (74,857 positions; 8,594 wallets).
