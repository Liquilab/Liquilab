# Uptime Monitor Setup Guide - Staging Environment

## Quick Start

**Endpoint to monitor:** `https://staging.liquilab.io/api/health`

**Expected response:** HTTP 200, JSON `{ "ok": true, "ts": <timestamp> }`

---

## Option 1: UptimeRobot (Free Tier Available)

### Step 1: Create Account
1. Go to https://uptimerobot.com
2. Sign up for free account (50 monitors free)
3. Verify email

### Step 2: Create Monitor
1. Click **"Add New Monitor"**
2. Select **"HTTP(s)"** type
3. Fill in:
   - **Friendly Name:** `LiquiLab Staging - Health`
   - **URL:** `https://staging.liquilab.io/api/health`
   - **Monitor Interval:** `5 minutes`
   - **Alert Contacts:** Add your email/Slack (configure in Settings → Alert Contacts first)
4. Click **"Create Monitor"**

### Step 3: Configure Alerts
1. Go to **Settings → Alert Contacts**
2. Add email/Slack webhook
3. Edit monitor → Alert Contacts → Select your contacts
4. Set **Alert When:** `Down for 2 checks` (10 minutes)

### Step 4: Verify
1. Monitor should show **"Up"** status (green)
2. Test by temporarily breaking endpoint (should alert after 2 checks)

---

## Option 2: Pingdom (Paid, More Features)

### Step 1: Create Account
1. Go to https://www.pingdom.com
2. Sign up (free trial available)
3. Verify account

### Step 2: Create Check
1. Go to **"Uptime"** → **"Add Check"**
2. Select **"HTTP(S) Check"**
3. Fill in:
   - **Check Name:** `LiquiLab Staging - Health`
   - **URL:** `https://staging.liquilab.io/api/health`
   - **Check Interval:** `5 minutes`
   - **Expected Status:** `200`
   - **Expected Body:** Contains `"ok":true`
4. Click **"Save Check"**

### Step 3: Configure Alerts
1. Go to **"Alerts"** → **"Add Contact"**
2. Add email/SMS/Slack
3. Edit check → **"Alert Settings"**
4. Set **Alert Threshold:** `2 consecutive failures`

---

## Option 3: GitHub Actions (Free, Basic)

For basic monitoring without external service, you can use GitHub Actions:

```yaml
# .github/workflows/uptime-check.yml
name: Uptime Check
on:
  schedule:
    - cron: '*/5 * * * *'  # Every 5 minutes
  workflow_dispatch:

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - name: Check staging health
        run: |
          response=$(curl -s -o /dev/null -w "%{http_code}" https://staging.liquilab.io/api/health)
          if [ "$response" != "200" ]; then
            echo "❌ Staging health check failed: $response"
            exit 1
          fi
          echo "✅ Staging health check passed"
```

**Note:** GitHub Actions free tier has limited minutes/month. Not recommended for production monitoring.

---

## Verification Steps

After setup, verify monitoring works:

1. **Check monitor status:**
   ```bash
   curl https://staging.liquilab.io/api/health
   ```
   Should return: `{"ok":true,"ts":...}`

2. **Test alert (optional):**
   - Temporarily break endpoint
   - Wait 10+ minutes (2 checks × 5 min interval)
   - Verify alert received
   - Restore endpoint

3. **Monitor dashboard:**
   - Check monitor shows "Up" status
   - Verify last check timestamp is recent (< 5 min ago)

---

## Recommended Settings Summary

| Setting | Value |
|---------|-------|
| **URL** | `https://staging.liquilab.io/api/health` |
| **Method** | `GET` |
| **Interval** | 5 minutes |
| **Timeout** | 10-15 seconds |
| **Expected Status** | `200 OK` |
| **Expected Body** | Contains `"ok":true` |
| **Alert Threshold** | 2 consecutive failures (10 minutes) |
| **Alert Contacts** | Ops team email/Slack |

---

## Troubleshooting

### Monitor shows "Down" but endpoint works
- Check timeout settings (increase to 15 seconds)
- Verify URL is correct (no trailing slash)
- Check if Railway deployment is active

### No alerts received
- Verify alert contacts are configured
- Check spam folder for email alerts
- Verify alert threshold is set correctly

### False positives
- Increase alert threshold to 3 checks (15 minutes)
- Check Railway deployment logs for intermittent issues

---

## Next Steps

After setup:
1. Document monitor URL in ops runbook
2. Add to team Slack channel for visibility
3. Set up escalation rules (e.g., page on-call after 30 min downtime)
4. Consider adding production monitor (`https://liquilab.io/api/health`)

---

## Related Documentation

- `docs/ops/UPTIME_MONITOR.md` - Technical endpoint details
- `PROJECT_STATE.md` section 7.11 - S0-OPS01 status

