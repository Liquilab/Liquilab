# ⏰ Railway Cron - MV Refresh Setup

## Quick Setup Guide

### Stap 1: Ga naar Railway Dashboard

1. Open: https://railway.app/dashboard
2. Selecteer je **LiquiLab** project
3. Klik op de **"Liquilab-staging"** service (web service met Next.js)
4. Ga naar **"Cron"** tab (of "Add New" → "Cron Job")

---

### Stap 2: Create Cron Job

**Basic Settings:**

| Field | Value |
|-------|-------|
| **Name** | `MV Refresh` |
| **Schedule** | `*/10 * * * *` (elke 10 minuten) |
| **Command** | `curl -X POST "https://liquilab-staging-staging.up.railway.app/api/enrich/refresh-views" -H "Authorization: Bearer $CRON_SECRET"` |
| **Service** | Link to **Liquilab-staging** (web service) |

**Let op:** 
- Vervang `liquilab-staging-staging.up.railway.app` met je eigen Railway public domain URL
- Je vindt deze in Railway dashboard → Liquilab-staging service → Settings → Domains
- Of gebruik `$RAILWAY_PUBLIC_DOMAIN` als die environment variable beschikbaar is

---

### Stap 3: Environment Variables

**Voor de Cron Job service:**
- `CRON_SECRET`: Maak een willekeurige secret key aan (bijv. via `openssl rand -hex 32`)

**Voor de Liquilab-staging service (web service):**
- `CRON_SECRET`: Zet dezelfde secret key als hierboven
- `DATABASE_URL`: Moet al gelinkt zijn aan Postgres

**Setup CRON_SECRET:**
1. Genereer een secret: `openssl rand -hex 32` (of gebruik een willekeurige string)
2. Zet deze in beide services:
   - Cron Job service → Variables → `CRON_SECRET`
   - Liquilab-staging service → Variables → `CRON_SECRET`

---

### Stap 4: Test Cron Job

**Handmatig triggeren:**
1. Ga naar Cron Job in Railway
2. Klik "Run Now" / "Trigger Manually"
3. Check logs voor output

**Expected Output in Cron Logs:**
```
curl: (0) no error
```

**Expected Output in Web Service Logs:**
Check de logs van de **Liquilab-staging** service om de refresh output te zien:
```
[refresh-views] Refreshing mv_pool_latest_state...
[refresh-views] Refreshing mv_pool_fees_24h...
...
```

**Of test het endpoint handmatig:**
```bash
curl -X POST "https://liquilab-staging-staging.up.railway.app/api/enrich/refresh-views" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

**Expected JSON Response:**
```json
{
  "success": true,
  "duration": 12345,
  "results": {
    "poolLatestState": { "success": true, "duration": 1234 },
    "poolFees24h": { "success": true, "duration": 567 },
    ...
  }
}
```

---

## 📅 Cron Schedule Opties

### Elke 10 minuten (aanbevolen voor actieve indexer)
```
*/10 * * * *
```

### Elke 5 minuten (voor zeer actieve indexer)
```
*/5 * * * *
```

### Elke 15 minuten (voor minder actieve indexer)
```
*/15 * * * *
```

### Elke uur (voor minder kritieke updates)
```
0 * * * *
```

**Belangrijk:** Railway draait in **UTC tijd**!

---

## 🔍 Welke MV's worden gerefresht?

Het script refresht deze Materialized Views in volgorde:

1. `mv_pool_latest_state` - Latest pool state
2. `mv_pool_fees_24h` - 24h fees
3. `mv_position_range_status` - Position range status
4. `mv_pool_position_stats` - Pool position stats
5. `mv_position_latest_event` - Latest position events
6. `mv_pool_volume_7d` - 7d volume
7. `mv_pool_fees_7d` - 7d fees
8. `mv_positions_active_7d` - Active positions (7d)
9. `mv_wallet_lp_7d` - LP wallets (7d)
10. `mv_pool_changes_7d` - Pool changes (7d)
11. `mv_position_lifetime_v1` - Lifetime positions

---

## 🚨 Troubleshooting

### Probleem: Cron draait niet

**Check:**
1. Cron schedule correct? (UTC tijd!)
2. `CRON_SECRET` gelijk in beide services? (Cron job + Liquilab-staging)
3. Command correct? (curl command met juiste Railway domain URL)
4. Web service draait? (Liquilab-staging moet online zijn)
5. Railway domain URL correct? (check in service Settings → Domains)

**Debug:**
```bash
# In Railway console voor de indexer service
which npm
npm --version
npm run refresh:mvs
```

### Probleem: Database connection error

```bash
# Check DATABASE_URL
echo $DATABASE_URL

# Test connection
psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM \"PositionTransfer\";"
```

### Probleem: MV refresh faalt

**Mogelijke oorzaken:**
- MV bestaat niet → Run `npm run db:create-mvs` eerst
- Unique index ontbreekt → Check MV definitie
- Database lock → Wacht en probeer opnieuw

**Check MV status:**
```bash
npm run verify:mv
```

---

## 📊 Monitor Cron Execution

### Railway Dashboard

1. Go to Cron Job
2. View "Logs" tab
3. Check execution history
4. Verify refresh success in logs

### Verifieer MV data

Na refresh, check of data up-to-date is:
```bash
npm run verify:mv
# Of
npm run verify:enrichment
```

---

## ✅ Best Practices

1. **Refresh frequentie:** 
   - Elke 10 minuten is meestal voldoende
   - Pas aan op basis van indexer activiteit

2. **Timing:**
   - Refresh niet tijdens piek indexer activiteit
   - Overweeg refresh na grote backfills

3. **Monitoring:**
   - Check logs regelmatig
   - Verifieer MV data freshness
   - Alert bij herhaalde failures

---

**Setup Date:** 2025-12-02  
**Version:** 1.0  
**Maintainer:** LiquiLab Dev Team

