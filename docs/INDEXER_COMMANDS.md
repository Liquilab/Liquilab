# V3 Pools Indexer - Terminal Commands

> Alle commando's voor het opstarten, controleren en beheren van de V3 pools indexer en Materialized Views.

---

## 🚀 Indexer Opstarten

### Lokaal (development)
```bash
# Start indexer follower (volgt chain head)
npm run indexer:follow:railway

# Start indexer met specifieke factory
npm run indexer:follow:railway -- --factory=enosys
npm run indexer:follow:railway -- --factory=sparkdex
npm run indexer:follow:railway -- --factory=all
```

### Railway (production)
De indexer start automatisch via de Dockerfile wanneer `SERVICE_TYPE=indexer` of de service naam "indexer" bevat.

---

## 📊 Indexer Status Controleren

### Via API (Railway)
```bash
# Volledige indexer status (checkpoints, counts, gaps)
curl "https://liquilab-staging-staging.up.railway.app/api/indexer/status" | jq

# Korte versie
curl -s "https://liquilab-staging-staging.up.railway.app/api/indexer/status" | jq '{currentBlock, checkpoints, counts, gaps}'
```

### Via Railway CLI
```bash
# Check checkpoints
railway run npm run verify:indexer:checkpoint

# Check recente activiteit
railway run npm run verify:indexer:activity

# Check RPC logs (direct van blockchain)
railway run npm run verify:indexer:rpc
```

---

## 🔄 Materialized Views

### MV Refresh (handmatig)
```bash
# Refresh alle MVs via API
curl -X POST "https://liquilab-staging-staging.up.railway.app/api/enrich/refresh-views" \
  -H "Authorization: Bearer $CRON_SECRET" | jq

# Met hardcoded secret (alleen voor testing)
curl -X POST "https://liquilab-staging-staging.up.railway.app/api/enrich/refresh-views" \
  -H "Authorization: Bearer 5f30b76606b639e9d2fa2696983fc83bd3b428f88bd2761bcffba2aeffba0c3d" | jq
```

### MV Management
```bash
# Drop alle MVs zonder index (voor recreatie)
curl -X POST "https://liquilab-staging-staging.up.railway.app/api/enrich/drop-mvs" \
  -H "Authorization: Bearer $CRON_SECRET" | jq

# Drop specifieke MV
curl -X POST "https://liquilab-staging-staging.up.railway.app/api/enrich/drop-single-mv?mv=mv_pool_fees_24h" \
  -H "Authorization: Bearer $CRON_SECRET" | jq
```

### Lokaal MVs refreshen
```bash
# Refresh MVs lokaal (vereist DATABASE_URL)
npm run refresh:mvs

# Create MVs direct (lokaal)
npm run fix:create-mvs-direct
```

---

## 🔧 Checkpoints & Fixes

### Checkpoint Management
```bash
# Check huidige checkpoints
railway run npm run verify:indexer:checkpoint

# Update checkpoint naar max data block
railway run npm run fix:checkpoint:update
```

### Database Fixes
```bash
# Check migration status
railway run npm run fix:migration:check-all

# Check nfpmAddress migration
railway run npm run fix:migration:check-nfpm
```

---

## 📈 Backfill

### ANKR Backfill (betaald, snel)
```bash
# Backfill via ANKR (vereist ANKR_NODE_URL)
# Dit wordt typisch gedaan via een apart script of de indexer met backfill mode
npm run indexer:backfill -- --factory=all --from=<startBlock> --to=<endBlock>
```

### Flare RPC Backfill (gratis, langzamer)
```bash
# De follower gebruikt automatisch Flare RPC
# INDEXER_MODE=follower zorgt ervoor dat alleen FLARE_RPC_URL wordt gebruikt
npm run indexer:follow:railway
```

---

## 🔍 Verificatie & Debugging

### Database Connectie
```bash
# Test database connectie
railway run npm run verify:cron:db

# Check DATABASE_URL type (public vs internal)
railway run npm run verify:cron:db-url
```

### Cron Job Verificatie
```bash
# Test MV refresh endpoint
railway run npm run test:cron:mv-refresh

# Check cron instructies
railway run npm run verify:cron:instructions
```

### Logs Bekijken (Railway Dashboard)
1. Ga naar Railway Dashboard → V3 pools Indexer service
2. Klik op "Deploy Logs" voor real-time logs
3. Klik op "Cron" tab voor cron job history

---

## 🌐 Environment Variables

### Vereist voor Indexer
| Variable | Beschrijving |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string (public URL) |
| `FLARE_RPC_URL` | Flare RPC endpoint (gratis) |
| `ANKR_NODE_URL` | ANKR RPC endpoint (betaald, voor backfills) |
| `INDEXER_MODE` | `follower` voor productie (gebruikt alleen Flare RPC) |

### Vereist voor Cron Job
| Variable | Beschrijving |
|----------|-------------|
| `CRON_SECRET` | Authenticatie token voor MV refresh API |

---

## 📋 Veelgebruikte Workflows

### 1. Indexer Status Check
```bash
curl -s "https://liquilab-staging-staging.up.railway.app/api/indexer/status" | jq '{
  currentBlock,
  checkpoints: [.checkpoints[] | {stream, lastBlock, lag}],
  counts,
  gaps
}'
```

### 2. MV Refresh Forceren
```bash
curl -X POST "https://liquilab-staging-staging.up.railway.app/api/enrich/refresh-views" \
  -H "Authorization: Bearer 5f30b76606b639e9d2fa2696983fc83bd3b428f88bd2761bcffba2aeffba0c3d" | jq
```

### 3. Volledige Reset van MVs
```bash
# Stap 1: Drop alle MVs
curl -X POST "https://liquilab-staging-staging.up.railway.app/api/enrich/drop-mvs" \
  -H "Authorization: Bearer 5f30b76606b639e9d2fa2696983fc83bd3b428f88bd2761bcffba2aeffba0c3d"

# Stap 2: Recreate en refresh
curl -X POST "https://liquilab-staging-staging.up.railway.app/api/enrich/refresh-views" \
  -H "Authorization: Bearer 5f30b76606b639e9d2fa2696983fc83bd3b428f88bd2761bcffba2aeffba0c3d"
```

### 4. Indexer Herstarten (Railway)
1. Railway Dashboard → V3 pools Indexer service
2. Klik op "Redeploy" of "Restart"

---

## 📊 Materialized Views Overzicht

| MV Naam | Beschrijving | Refresh Tijd |
|---------|-------------|--------------|
| `mv_pool_latest_state` | Laatste block per pool | ~100-300ms |
| `mv_pool_fees_24h` | 24h fees per pool | ~10-30ms |
| `mv_position_range_status` | In/out of range status | ~10-30ms |
| `mv_pool_position_stats` | Position stats per pool | ~10-30ms |
| `mv_position_latest_event` | Laatste event per positie | ~10-30ms |
| `mv_pool_volume_7d` | 7d volume per pool | ~10-30ms |
| `mv_pool_fees_7d` | 7d fees per pool | ~10-30ms |
| `mv_positions_active_7d` | Actieve posities (7d) | ~10-30ms |
| `mv_wallet_lp_7d` | Wallet LP activiteit (7d) | ~10-30ms |
| `mv_pool_changes_7d` | Pool wijzigingen (7d) | ~10-30ms |

---

## 🕐 Cron Schedule

De MV refresh cron job draait elke **10 minuten** (`*/10 * * * *` UTC).

Configuratie in Railway:
- Service: V3 pools Indexer (Cron)
- Command: `curl -X POST "https://liquilab-staging-staging.up.railway.app/api/enrich/refresh-views" -H "Authorization: Bearer $CRON_SECRET"`
- Schedule: `*/10 * * * *`

---

*Laatst bijgewerkt: 2025-12-03*

