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
| **Command** | `npm run refresh:mvs` |
| **Service** | Link to `V3 pools Indexer` service |

---

### Stap 3: Environment Variables

Zorg dat deze variabelen beschikbaar zijn in de Cron service:

```bash
# Required voor HTTP request
RAILWAY_PUBLIC_DOMAIN=${{Liquilab-staging.RAILWAY_PUBLIC_DOMAIN}}
CRON_SECRET=your-secret-key-here
```

**Setup:**
- `RAILWAY_PUBLIC_DOMAIN`: Automatisch beschikbaar in Railway (bijv. `liquilab-staging-staging.up.railway.app`)
- `CRON_SECRET`: Maak een willekeurige secret key aan (bijv. via `openssl rand -hex 32`)
- Zet dezelfde `CRON_SECRET` in de **Liquilab-staging** service environment variables

---

### Stap 4: Test Cron Job

**Handmatig triggeren:**
1. Ga naar Cron Job in Railway
2. Klik "Run Now" / "Trigger Manually"
3. Check logs voor output

**Expected Output:**
```
[refresh-views] mv_pool_latest_state → refresh
[refresh-views] mv_pool_latest_state ✓
[refresh-views] mv_pool_fees_24h → refresh
[refresh-views] mv_pool_fees_24h ✓
...
[refresh-views] Done
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
2. Environment variables linked?
3. Command correct? (`npm run refresh:mvs`)
4. Service heeft toegang tot database?

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

