# 🎨 Font Testing Instructions - HomePage Only

## Overzicht
De HomePage heeft nu een **Font Test Panel** (rechts bovenaan) waarmee je verschillende heading fonts kunt testen als vervanging voor Quicksand.

## Locatie
- **URL**: `/#/` (HomePage)
- **Test Panel**: Fixed panel rechts bovenaan (onder de navigation)

## Beschikbare Fonts

### 1. **Space Grotesk** ⭐ AANBEVOLEN
- **Karakter**: Tech-forward, modern, zelfverzekerd
- **Populair bij**: Crypto/DeFi platforms, fintech startups
- **Gevoel**: Geometric, strong, contemporary
- **Best voor**: Modern fintech met tech edge
- **Voorbeelden**: Uniswap, verschillende crypto dashboards

### 2. **Poppins**
- **Karakter**: Geometric, professioneel, sterk maar toegankelijk
- **Populair bij**: B2B SaaS, enterprise apps
- **Gevoel**: Clean, friendly professionalism
- **Best voor**: Balance tussen modern en approachable
- **Voorbeelden**: Veel SaaS dashboards

### 3. **DM Sans**
- **Karakter**: Clean, modern, zakelijk
- **Populair bij**: Corporate tools, business apps
- **Gevoel**: Professional, trustworthy, not flashy
- **Best voor**: Traditional professional look
- **Voorbeelden**: Enterprise software

### 4. **Outfit**
- **Karakter**: Geometric sans, sterk, contemporary
- **Populair bij**: Modern web apps, design tools
- **Gevoel**: Strong, confident, slightly playful
- **Best voor**: Modern but not too tech-heavy
- **Voorbeelden**: Design platforms

### 5. **Manrope**
- **Karakter**: Modern, vertrouwenwekkend, corporate-friendly
- **Populair bij**: Financial services, enterprise
- **Gevoel**: Balanced, trustworthy, professional
- **Best voor**: Serious business applications
- **Voorbeelden**: Banking apps, financial tools

### 6. **Plus Jakarta Sans**
- **Karakter**: Professional, modern, vriendelijk genoeg
- **Populair bij**: SaaS platforms, modern web apps
- **Gevoel**: Contemporary Indonesian-influenced geometric
- **Best voor**: Modern professional look
- **Voorbeelden**: Various SaaS products

### 7. **Sora**
- **Karakter**: Tech forward, clean, professioneel
- **Populair bij**: Tech startups, crypto
- **Gevoel**: Futuristic but readable
- **Best voor**: Cutting-edge tech feel
- **Voorbeelden**: Tech platforms

### 8. **Quicksand** (Current)
- **Karakter**: Friendly, approachable, rounded
- **Populair bij**: Consumer apps, friendly brands
- **Gevoel**: Warm, friendly, accessible
- **Waarom vervangen**: Te "designerig" en vriendelijk voor fintech

---

## Hoe te Testen

### Stap 1: Open HomePage
```
https://www.figma.com/make/75w1dSinK03GLkglA4HVHa/#/
```

### Stap 2: Vind het Font Test Panel
- Rechts bovenaan (onder de navigation)
- Blauwe border, backdrop blur effect
- Dropdown selector met alle font opties

### Stap 3: Switch tussen Fonts
1. Klik op de dropdown
2. Selecteer een font uit de lijst
3. **Alle headings EN het "Liquilab" logo in de navigation** updaten instant
4. Bekijk hoe het font eruitziet in verschillende contexten:
   - **"Liquilab" logo** in de navigation bar (top left)
   - Hero headline (groot, 56px)
   - Section headings (h2)
   - Social proof section
   - Featured pools section
   - Final CTA section

### Stap 4: Evalueer op Criteria
Beoordeel elk font op:
- ✅ **Zelfverzekerdheid**: Straalt het vertrouwen uit?
- ✅ **Serieus**: Professional genoeg voor fintech?
- ✅ **Modern**: Contemporary uitstraling?
- ✅ **Niet Saai**: Nog steeds interessant en engaging?
- ✅ **Leesbaarheid**: Clear in alle sizes?
- ✅ **Contrast met Inter**: Werkt het goed met Inter body text?

---

## Aanbevelingen per Use Case

### Voor Maximum Tech Credibility
**→ Space Grotesk**
- Meest populair in crypto/DeFi
- Strong geometric feel
- Modern en zelfverzekerd
- Past perfect bij "powered by RangeBand™" tech positioning

### Voor Professional Balance
**→ Poppins** of **Manrope**
- Professional maar niet saai
- Breed geaccepteerd in business apps
- Vertrouwenwekkend zonder te corporate

### Voor Clean Modern Business
**→ DM Sans** of **Plus Jakarta Sans**
- Clean en professional
- Subtle sophistication
- Works well in serious contexts

### Voor Strong Contemporary Look
**→ Outfit**
- Bold en zelfverzekerd
- Modern geometric
- Slight playfulness zonder friendly te zijn

---

## Technische Details

### Implementatie
- **Scope**: HomePage headings (h1, h2) + "Liquilab" logo in Navigation
- **Logo**: Het font wijzigt mee met je selectie in de Navigation bar (alleen op HomePage)
- **Body text**: Blijft Inter (onveranderd)
- **Other pages**: Blijven Quicksand gebruiken voor headings (geen wijziging)
- **Font loading**: Google Fonts CDN (al geladen in globals.css)
- **Technical**: Gebruikt CSS custom property `--font-heading-test` die automatisch reset bij page leave

### Font Weights
Alle test fonts zijn geladen met weights:
- 400 (Regular)
- 500 (Medium)
- 600 (Semi-Bold) ← **Gebruikt voor h1/h2**
- 700 (Bold)

### CSS
```css
/* HomePage headings gebruiken inline style */
style={{ fontFamily: headingFont }}

/* Plus explicit font-weight */
className="font-semibold"  /* = 600 weight */

/* Logo gebruikt CSS custom property fallback */
fontFamily: 'var(--font-heading-test, var(--font-heading))'
```

**Logo Behavior**:
- Op HomePage: Logo font wijzigt mee met dropdown selectie
- Op andere paginas: Logo blijft Quicksand gebruiken (default)
- Auto-cleanup: Font reset bij verlaten HomePage

---

## Decision Criteria Checklist

Bij het kiezen van een font, overweeg:

### ✅ Brand Alignment
- [ ] Past bij "premium DeFi analytics" positioning?
- [ ] Ondersteunt "powered by RangeBand™" tech story?
- [ ] Voelt modern en cutting-edge aan?

### ✅ Audience Fit
- [ ] Spreekt professional traders & LPs aan?
- [ ] Serious genoeg voor B2B/enterprise?
- [ ] Niet te casual of playful?

### ✅ Readability & Hierarchy
- [ ] Clear onderscheid tussen heading en body?
- [ ] Goed leesbaar in alle sizes?
- [ ] Werkt op dark navy background?

### ✅ Competitive Context
- [ ] Hoe gebruiken andere fintech/DeFi platforms fonts?
- [ ] Onderscheidt het zich van Quicksand?
- [ ] Voelt het contemporary aan?

---

## Next Steps

### Na Font Selectie
1. **Besluit**: Kies je favoriete font uit de test
2. **Verify**: Check alle headings op HomePage
3. **Document**: Noteer welke font je kiest en waarom
4. **Roll-out** (optioneel): 
   - Update Guidelines.md met nieuwe font
   - Apply to all pages (vervangt Quicksand globaal)
   - Update globals.css font-family defaults

### Verwijder Test Panel
Als je klaar bent met testen:
```tsx
// Verwijder uit HomePage.tsx:

// 1. Font Testing Panel UI
{/* Font Testing Panel - ONLY on HomePage */}
<div className="fixed top-20 right-6 z-50 ...">
  ...
</div>

// 2. State & useEffect
const [headingFont, setHeadingFont] = useState<string>("Quicksand");

useEffect(() => {
  document.documentElement.style.setProperty('--font-heading-test', headingFont);
  return () => {
    document.documentElement.style.setProperty('--font-heading-test', 'Quicksand');
  };
}, [headingFont]);

// 3. Font options array
const fontOptions = [ ... ];

// 4. Inline style attributes op headings
style={{ fontFamily: headingFont }}
```

---

## Font Comparison Quick Reference

| Font | Gevoel | Best Use | DeFi Fit |
|------|--------|----------|----------|
| **Space Grotesk** | Tech, strong | Crypto/fintech | ⭐⭐⭐⭐⭐ |
| **Poppins** | Balanced pro | B2B SaaS | ⭐⭐⭐⭐ |
| **DM Sans** | Clean business | Enterprise | ⭐⭐⭐⭐ |
| **Outfit** | Strong modern | Design tools | ⭐⭐⭐⭐ |
| **Manrope** | Corporate trust | Finance | ⭐⭐⭐⭐ |
| **Plus Jakarta Sans** | Professional | SaaS | ⭐⭐⭐ |
| **Sora** | Tech forward | Tech startups | ⭐⭐⭐⭐ |
| Quicksand (current) | Friendly | Consumer | ⭐⭐ |

---

## Vragen?

Check `/guidelines/Guidelines.md` voor de volledige design system documentatie.

**Laatste update**: November 2024
