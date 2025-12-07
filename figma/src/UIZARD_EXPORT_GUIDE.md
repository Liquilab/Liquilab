# 🎨 Liquilab → Uizard Export Guide

Deze guide legt uit hoe je Liquilab pagina's exporteert naar Uizard voor design iteratie en prototyping.

## 📸 Stap 1: Screenshots Genereren

### Optie A: Automatisch (Aanbevolen)

1. **Open Screenshot Generator**
   - Navigeer naar `/screenshot-generator` in de app
   - Of ga via Account → Developer Tools → "Open Generator"

2. **Genereer Screenshots**
   - Klik op **"Generate All Screenshots"**
   - Wacht ~26 seconden (13 pagina's × 2 sec/pagina)
   - De tool navigeert automatisch door alle pagina's

3. **Download Screenshots**
   - Klik **"Download All"** om alle 13 screenshots te downloaden
   - Of download individuele pagina's met de download button per pagina
   - Files worden opgeslagen als: `Liquilab-01-HomePage.png`, `Liquilab-02-PoolsOverview.png`, etc.

### Optie B: Manueel (Fallback)

Als de automatische generator niet werkt:

1. Open elke pagina in de browser
2. Gebruik browser DevTools (F12) → Screenshot tool
3. Of gebruik een screenshot extensie zoals "Full Page Screen Capture"

## 📤 Stap 2: Upload naar Uizard

1. **Ga naar Uizard**
   - Open https://uizard.io
   - Log in met je account
   - Of klik op **"Open Uizard"** button in Screenshot Generator

2. **Maak Nieuw Project**
   - Klik **"New Project"**
   - Kies **"Screenshot"** als input method
   - Upload je screenshots (drag & drop of browse)

3. **Wacht op AI Conversie**
   - Uizard's AI analyseert de screenshots
   - Converteert naar editable design elements
   - Dit duurt ~1-2 minuten per screenshot

4. **Review & Edit**
   - Check of alle elementen correct zijn gedetecteerd
   - Componenten zijn nu editable (kleuren, tekst, layout)
   - Voeg interacties toe met Uizard's prototyping tools

## 📋 Pagina's die Worden Geëxporteerd

### Core Pages (4)
- **HomePage**: Hero + value propositions
- **PoolsOverview**: Grid + List views met filters
- **RangeBandExplainer**: Educational content
- **PricingPage**: 3 tiers + comparison table

### Detail Pages (3)
- **PoolDetailPage**: Standard analytics view
- **PoolDetailProPage**: PRO analytics view
- **WalletOverview**: Portfolio + positions table

### Account & Settings (2)
- **AccountPage**: Profile + subscription management
- **StatusPage**: System health monitoring

### Info Pages (4)
- **FAQPage**: Accordion met Q&A
- **Legal-Terms**: Terms of service
- **Legal-Privacy**: Privacy policy
- **Legal-Cookies**: Cookie policy

## 🎯 Best Practices

### Voor Beste Screenshot Kwaliteit

**DO:**
- ✅ Gebruik full-screen browser window (geen DevTools open)
- ✅ Zorg voor stable internet (voor font/icon loading)
- ✅ Wacht tot animaties zijn gestopt
- ✅ Gebruik 2x scale voor retina quality
- ✅ Export naar PNG (niet JPG - beter voor UI)

**DON'T:**
- ❌ Screenshot met open dropdown menus
- ❌ Screenshot met hover states (tenzij dat de bedoeling is)
- ❌ Screenshot met console errors visible
- ❌ Kleine viewport (Uizard werkt best met desktop sizes)

### In Uizard

**Aanbevolen workflow:**
1. **Importeer per flow** (niet alle 13 tegelijk)
   - Start met Core flow: Home → Pools → Pool Detail
   - Dan Detail flow: Wallet → Pool PRO
   - Dan Info flow: Pricing → Account → FAQ

2. **Link screens** met Uizard's prototyping
   - Maak clickable buttons/links
   - Simuleer user journeys
   - Test flows met preview mode

3. **Extract Design System**
   - Gebruik Uizard's component detection
   - Maak reusable components (RangeBand, PoolCard, Navigation)
   - Definieer color/typography styles

## 🔧 Troubleshooting

### Screenshots zijn blurry
**Oplossing**: Vergroot browser window of verhoog scale in html2canvas settings

### Fonts laden niet correct
**Oplossing**: Wacht langer voor screenshot (increase delay in code)

### Kleuren kloppen niet
**Oplossing**: Check of Uizard AI correct heeft gedetecteerd, pas handmatig aan

### Componenten worden niet herkend
**Oplossing**: In Uizard, selecteer elementen en markeer als component

### Generator crasht
**Oplossing**: 
1. Check browser console voor errors
2. Probeer één pagina tegelijk (individual download buttons)
3. Refresh app en probeer opnieuw

## 💡 Tips & Tricks

### Screenshot Naming Convention
Files zijn genummerd voor logische volgorde:
```
Liquilab-01-HomePage.png
Liquilab-02-PoolsOverview.png
Liquilab-03-PoolDetailPage.png
...
```

Upload in Uizard in deze volgorde voor beste flow detection.

### Component Prioriteit
Focus in Uizard eerst op deze unique components:
1. **RangeBand™** - USP component, belangrijk voor design system
2. **PoolCard/PoolTable** - Herbruikbaar in meerdere views
3. **Navigation** - Sticky header, alle pagina's
4. **TokenPairIcon** - Reusable icon component

### Design System Export
Na Uizard, kan je:
- **Export design tokens** (colors, spacing, typography)
- **Generate style guide** voor team handoff
- **Export to Figma** (Uizard → Figma plugin)
- **Share prototype** met stakeholders (public link)

## 🚀 Advanced: Direct to Figma

Als je liever direct naar Figma wilt:

### Via Uizard (Recommended)
```
React App → Screenshots → Uizard → Figma Plugin → Figma
```

### Via html.to.design Plugin
```
React App (running) → Figma plugin "html.to.design" → Figma
```
(Vereist lokale dev server)

## 📞 Support

**Issues met Screenshot Generator?**
- Check browser console (F12) voor errors
- Zorg dat html2canvas library is geladen
- Disable browser extensions die screenshots blokkeren

**Issues met Uizard Upload?**
- Check file size (max 10MB per screenshot)
- Use PNG format (not WebP or JPG)
- Check Uizard's status page voor outages

**Design niet zoals verwacht in Uizard?**
- Dit is normaal - AI detectie is ~80% accuraat
- Plan 30-60 min cleanup tijd per screenshot
- Focus op layout, kleuren kan je snel fixen

---

**Last Updated**: November 2024
**Tool Version**: Screenshot Generator v1.0
**Compatibility**: Uizard Pro/Enterprise, Figma (via Uizard)

Happy exporting! 🎨✨
