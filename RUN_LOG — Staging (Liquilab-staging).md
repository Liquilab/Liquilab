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
