# Uptime Monitor Configuration

## Overview

External uptime monitoring for LiquiLab staging environment via `/api/health` endpoint.

## Endpoint

**URL:** `https://staging.liquilab.io/api/health`

**Method:** `GET`

**Expected Response:**
```json
{
  "ok": true,
  "ts": 1734422400000
}
```

**Status Code:** `200 OK`

## Monitoring Configuration

### Recommended Settings

- **Service:** UptimeRobot, Pingdom, or similar
- **Check Interval:** 5 minutes
- **Timeout:** 10 seconds
- **Alert Threshold:** 2 consecutive failures
- **Expected Status:** `200`
- **Expected Body:** Contains `"ok":true`

### UptimeRobot Setup

1. Create new monitor
2. Type: HTTP(s)
3. URL: `https://staging.liquilab.io/api/health`
4. Interval: 5 minutes
5. Alert contacts: Ops team
6. Alert when: Down for 2 checks

### Pingdom Setup

1. Create new check
2. Type: HTTP
3. URL: `https://staging.liquilab.io/api/health`
4. Interval: 5 minutes
5. Alert contacts: Ops team

## Health Endpoint Behavior

- **Lightweight:** No database queries (DB-tolerant)
- **Fast:** Returns immediately with timestamp
- **Safe:** No side effects, safe for frequent polling
- **DB-Independent:** Works even when `HEALTH_DB_REQUIRED=false`

## Alert Response

When downtime is detected:

1. Check Railway deployment logs
2. Verify `/api/health` returns 200 locally
3. Check Railway service status
4. Review recent deployments
5. Escalate if unresolved after 15 minutes

## Related Documentation

- `PROJECT_STATE.md` section "7.7 Environments & Merge Gates"
- `ROADMAP_DOMAIN_SPECS.md` SP4-B05 (Uptime monitor)

