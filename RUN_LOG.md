# RUN_LOG — LiquiLab Development Sessions

> Chronological log of development sessions, decisions, and key changes.
> See `PROJECT_STATE.md` for current architecture and SSoT documentation.

---

## 2025-12-04 — Token Pricing SSoT & TVL Coverage

**Session Goal:** Achieve 100% TVL coverage compared to SparkDEX/Enosys UI references.

### Key Changes

1. **Token Pricing Config SSoT (`config/token-pricing.config.ts`)**
   - Created central configuration for all token pricing sources
   - Added `pricingUniverse` flag to control TVL eligibility
   - Implemented FTSO-first with CoinGecko fallback for Flare-native tokens

2. **New Tokens Added to Pricing Universe:**
   | Token | CoinGecko ID | Price | Impact |
   |-------|-------------|-------|--------|
   | stXRP | ripple (via FTSO XRP) | $2.14 | +$8M TVL |
   | flrETH | flare-staked-ether | $3,084 | +$3.6M TVL |
   | cyWETH | cyclo-cyweth | $0.47 | Corrected from $3,166! |
   | JOULE | joule-2 | $0.0053 | +$93K TVL |
   | BUGO | bugo | $0.0007 | +$97K TVL |
   | SPRK | sparkdex | $0.022 | +$1.4M TVL |
   | HLN | enosys | $0.076 | Already priced |

3. **Critical Bug Fixed: cyWETH Pricing**
   - Was incorrectly priced as ETH ($3,166)
   - Correct price: ~$0.47 (Cyclo yield token)
   - This was causing $89M overcount in Cyclo TVL!

4. **stXRP Token Address Corrected:**
   - Old (wrong): `0xffed33d28ca65e52e927849f456d8e820b324508` (SparkDEX pool address!)
   - New (correct): `0x4c18ff3c89632c3dd62e796c0afa5c07c4c1b2b3` (actual token)

### Final TVL Coverage

| DEX | UI Reference | LiquiLab | Coverage |
|-----|-------------|----------|----------|
| SparkDEX v3 | $62.40M | $62.37M | 100.0% ✅ |
| Enosys v3 | ~$6.05M | $6.19M | 102% ✅ |
| **Total** | ~$68.5M | $68.56M | 100.1% ✅ |

### Unpriced Tokens (by design)

These tokens lack CoinGecko listings and represent <0.1% of total TVL:
- XVN ($31.70k)
- FLEME ($5.45k)
- PiCO ($4.11k)
- FUF, BULL, MOON, FINU (<$5k each)

### Commands Added

```bash
npm run verify:data:tvl-by-dex     # TVL breakdown by DEX
npm run verify:data:w49-vs-w3      # Compare with W3 reference
npm run verify:data:coverage-gaps  # Data flow analysis
npm run fix:backfill-pools         # Backfill pools from factory
npm run fix:resolve-unknown-pools  # Fix "unknown" pool events
```

### Files Modified

- `config/token-pricing.config.ts` — New SSoT (created)
- `src/services/tokenPriceService.ts` — FTSO/CG/Fixed logic updated
- `scripts/verify-data/tvl-by-dex.mts` — New diagnostic script
- `scripts/fix/backfill-missing-pools.mts` — Pool backfill from factory
- `scripts/fix/resolve-unknown-pools.mts` — Fix unknown pool refs
- `db/views/mv_pool_liquidity.sql` — Pool liquidity aggregation

### Lessons Learned

1. **Never assume token address from pool address** — stXRP was using pool address as token address
2. **Verify CoinGecko IDs manually** — cyWETH is NOT 1:1 with ETH
3. **Check both SparkDEX and Enosys UIs** — They show different pools/tokens
4. **Event-based TVL can drift** — On-chain verification needed for production

### Next Steps (Future Sprint)

1. Implement on-chain TVL verification via Multicall3
2. Add "verified" badge to dashboard when event-based matches on-chain
3. Create alert for TVL drift >10%

---

## Template for Future Sessions

```markdown
## YYYY-MM-DD — Session Title

**Session Goal:** [One-line description]

### Key Changes
[List major changes with files]

### Commands Added/Modified
[New npm scripts]

### Lessons Learned
[What we learned for next time]

### Next Steps
[What to do next]
```

