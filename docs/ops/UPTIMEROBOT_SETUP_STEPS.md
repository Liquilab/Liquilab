# UptimeRobot Setup - Stap voor Stap

## Stap 1: Account Aanmaken

1. Ga naar: **https://uptimerobot.com**
2. Klik op **"Sign Up"** (rechtsboven)
3. Vul in:
   - Email: jouw email
   - Password: veilig wachtwoord
4. Klik **"Create Account"**
5. Check je email en klik op verificatielink

**✅ Checkpoint:** Je bent ingelogd op UptimeRobot dashboard

---

## Stap 2: Alert Contact Configureren (Eerst!)

**BELANGRIJK:** Configureer eerst je alert contact, anders krijg je geen meldingen.

1. Klik op **"My Settings"** (rechtsboven, naast je naam)
2. Ga naar tab **"Alert Contacts"**
3. Klik **"Add Alert Contact"**
4. Kies type:
   - **Email:** Vul je email in
   - **Slack:** Voeg webhook URL toe (optioneel)
5. Klik **"Create Alert Contact"**
6. Noteer de naam van je contact (bijv. "Email - Koen")

**✅ Checkpoint:** Alert contact staat in de lijst

---

## Stap 3: Monitor Aanmaken

1. Klik op **"Add New Monitor"** (grote groene knop)
2. Vul in:

   **Monitor Type:**
   - Selecteer: **"HTTP(s)"** (eerste optie)

   **Friendly Name:**
   - Vul in: `LiquiLab Staging - Health`

   **URL (or IP):**
   - Vul in: `https://staging.liquilab.io/api/health`

   **Monitoring Interval:**
   - Selecteer: **"5 minutes"**

   **Alert Contacts:**
   - Vink aan: Je zojuist aangemaakte alert contact (bijv. "Email - Koen")

   **Alert When:**
   - Selecteer: **"Down for 2 checks"** (dit betekent: alert na 10 minuten downtime)

3. Klik **"Create Monitor"**

**✅ Checkpoint:** Monitor verschijnt in dashboard met status "Up" (groen)

---

## Stap 4: Verificatie

### 4.1 Check Monitor Status
- Monitor moet **"Up"** status tonen (groen bolletje)
- Laatste check moet < 5 minuten geleden zijn
- Response time moet < 1000ms zijn

### 4.2 Test Endpoint Handmatig
Open terminal en run:
```bash
curl https://staging.liquilab.io/api/health
```

Verwacht resultaat:
```json
{"ok":true,"ts":1763374978190}
```

### 4.3 Test Alert (Optioneel)
Als je wilt testen of alerts werken:
1. Stop tijdelijk de Railway service (of blokkeer de URL)
2. Wacht 10+ minuten (2 checks × 5 min)
3. Je zou een email alert moeten krijgen
4. Herstel de service
5. Monitor zou weer "Up" moeten worden

---

## Stap 5: Monitor Details Bekijken

Klik op de monitor naam om details te zien:
- **Uptime percentage:** Moet ~100% zijn
- **Response time:** Gemiddelde response tijd
- **Logs:** Geschiedenis van checks (laatste 24 uur)

---

## Troubleshooting

### Monitor blijft "Down" maar endpoint werkt
- Check of URL correct is (geen trailing slash)
- Verhoog timeout naar 15 seconden (Edit monitor → Advanced)
- Check Railway deployment logs

### Geen alerts ontvangen
- Check spam folder
- Verify alert contact is aangevinkt bij monitor
- Check alert threshold (moet "Down for 2 checks" zijn)

### Monitor toont "Paused"
- Klik op monitor → "Resume" knop
- Check of je account actief is

---

## Configuratie Samenvatting

| Setting | Waarde |
|---------|--------|
| **Type** | HTTP(s) |
| **Name** | LiquiLab Staging - Health |
| **URL** | `https://staging.liquilab.io/api/health` |
| **Interval** | 5 minutes |
| **Timeout** | 10-15 seconds |
| **Alert When** | Down for 2 checks (10 minutes) |
| **Expected Status** | 200 OK |
| **Expected Body** | Contains `"ok":true` |

---

## Volgende Stappen

Na succesvolle setup:
1. ✅ Monitor draait en toont "Up"
2. ✅ Alert contact werkt (test met optionele downtime test)
3. 📝 Documenteer monitor URL in team runbook
4. 🔔 Voeg toe aan team Slack channel (optioneel)
5. 🚀 Overweeg production monitor (`https://liquilab.io/api/health`)

---

## Hulp Nodig?

- UptimeRobot docs: https://uptimerobot.com/api/
- Check `docs/ops/UPTIME_MONITOR.md` voor technische details
- Check `docs/ops/UPTIME_MONITOR_SETUP.md` voor alternatieve opties

