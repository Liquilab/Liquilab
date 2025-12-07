# 🧭 Navigatie Instructies - Liquilab Figma Make

## Hoe pagina's te vinden in Figma Make

Alle pagina's in dit Liquilab project zijn bereikbaar via **HashRouter** navigatie. Dit betekent dat routes worden toegevoegd na een `#` symbool in de URL.

### 📍 Base URL
```
https://www.figma.com/make/75w1dSinK03GLkglA4HVHa/
```

---

## 🎯 Belangrijkste Pagina's

### Design System & Screens Summary (Developer Handoff)
**Complete documentatie voor het implementeren van Liquilab in Next.js**

```
https://www.figma.com/make/75w1dSinK03GLkglA4HVHa/#/ds-summary
```

**Bevat:**
- Alle routes & screens map
- Design tokens & typografie
- Core componenten overzicht
- Plan-specific features (Premium vs Pro)
- Screen-by-screen component usage
- Implementation notes & caveats

---

### Component Overview (Navigatie Hub)
**Centrale hub met links naar alle pagina's en componenten**

```
https://www.figma.com/make/75w1dSinK03GLkglA4HVHa/#/overview
```

**Bevat:**
- Links naar alle 15+ pagina's
- Componenten overzicht
- ShadCN UI components lijst
- Design system resources

---

## 📄 Alle Routes

### Core Pagina's
| Pagina | Route | Volledige URL |
|--------|-------|---------------|
| **Home** | `/#/` | `https://www.figma.com/make/75w1dSinK03GLkglA4HVHa/#/` |
| **Pools Overview** | `/#/pools` | `https://www.figma.com/make/75w1dSinK03GLkglA4HVHa/#/pools` |
| **Pool Detail** | `/#/pool/1` | `https://www.figma.com/make/75w1dSinK03GLkglA4HVHa/#/pool/1` |
| **Pool Detail Pro** | `/#/pool/1/pro` | `https://www.figma.com/make/75w1dSinK03GLkglA4HVHa/#/pool/1/pro` |
| **Pool Universe** | `/#/pool/1/universe` | `https://www.figma.com/make/75w1dSinK03GLkglA4HVHa/#/pool/1/universe` |
| **Wallet Overview** | `/#/koen` | `https://www.figma.com/make/75w1dSinK03GLkglA4HVHa/#/koen` |

### Marketing & Info
| Pagina | Route | Volledige URL |
|--------|-------|---------------|
| **RangeBand Explainer** | `/#/rangeband` | `https://www.figma.com/make/75w1dSinK03GLkglA4HVHa/#/rangeband` |
| **Pricing** | `/#/pricing` | `https://www.figma.com/make/75w1dSinK03GLkglA4HVHa/#/pricing` |
| **FAQ** | `/#/faq` | `https://www.figma.com/make/75w1dSinK03GLkglA4HVHa/#/faq` |
| **Status** | `/#/status` | `https://www.figma.com/make/75w1dSinK03GLkglA4HVHa/#/status` |
| **Legal** | `/#/legal/terms` | `https://www.figma.com/make/75w1dSinK03GLkglA4HVHa/#/legal/terms` |

### Account & Developer Tools
| Pagina | Route | Volledige URL |
|--------|-------|---------------|
| **Account** | `/#/account` | `https://www.figma.com/make/75w1dSinK03GLkglA4HVHa/#/account` |
| **Component Overview** | `/#/overview` | `https://www.figma.com/make/75w1dSinK03GLkglA4HVHa/#/overview` |
| **DS Summary** | `/#/ds-summary` | `https://www.figma.com/make/75w1dSinK03GLkglA4HVHa/#/ds-summary` |
| **Icon Showcase** | `/#/icons` | `https://www.figma.com/make/75w1dSinK03GLkglA4HVHa/#/icons` |
| **Screenshot Generator** | `/#/screenshot-generator` | `https://www.figma.com/make/75w1dSinK03GLkglA4HVHa/#/screenshot-generator` |
| **RangeBand DS** | `/#/rangeband-ds` | `https://www.figma.com/make/75w1dSinK03GLkglA4HVHa/#/rangeband-ds` |

---

## 🔄 Drie Manieren om te Navigeren

### 1️⃣ Direct via URL Balk
De **snelste methode** voor directe toegang:
1. Kopieer de volledige URL van de gewenste pagina (zie tabellen hierboven)
2. Plak in de adresbalk van je browser
3. Druk op Enter

**Voorbeeld:**
```
https://www.figma.com/make/75w1dSinK03GLkglA4HVHa/#/ds-summary
```

### 2️⃣ Via Component Overview Pagina
De **meest gebruiksvriendelijke methode**:
1. Ga naar `/#/overview` (Component Overview)
2. Klik op de gewenste pagina card
3. Je wordt automatisch doorgestuurd

**Speciale feature:** De DS Summary heeft een prominente banner bovenaan de overview pagina.

### 3️⃣ Via In-App Links
De **natuurlijke navigatie methode**:
- Gebruik de **Navigation bar** bovenaan
- Klik op **Footer links** onderaan
- Gebruik **floating buttons** (links onderaan voor Overview, rechts onderaan voor Screenshots)
- Klik op **CTA buttons** binnen pagina's

---

## 💡 HashRouter Uitleg

### Wat betekent de `#` in de URL?

De `#` scheidt de **base URL** van de **client-side route**:

```
https://www.figma.com/make/75w1dSinK03GLkglA4HVHa/  ←  Base URL
                                                  #  ←  HashRouter separator
                                                 /ds-summary  ←  Client-side route
```

**Waarom HashRouter?**
- ✅ Werkt perfect in Figma Make environment
- ✅ Geen server-side configuratie nodig
- ✅ Instant client-side navigatie
- ✅ Bookmark-able URLs

**Migratie naar Next.js:**
Bij migratie naar Next.js wordt HashRouter vervangen door Next.js Pages Router:
- `/#/pools` → `/pools`
- `/#/pool/1/pro` → `/pool/[id]/pro`
- `/#/ds-summary` → `/ds-summary`

---

## 🚀 Quick Start

### Voor Developers (First Time)
1. **Start met Component Overview:**
   ```
   https://www.figma.com/make/75w1dSinK03GLkglA4HVHa/#/overview
   ```

2. **Bekijk de DS Summary voor handoff:**
   ```
   https://www.figma.com/make/75w1dSinK03GLkglA4HVHa/#/ds-summary
   ```

3. **Lees de Guidelines:**
   Open `/guidelines/Guidelines.md` in de file structure

### Voor Designers
1. **Start met RangeBand Design System:**
   ```
   https://www.figma.com/make/75w1dSinK03GLkglA4HVHa/#/rangeband-ds
   ```

2. **Bekijk alle iconen:**
   ```
   https://www.figma.com/make/75w1dSinK03GLkglA4HVHa/#/icons
   ```

### Voor Product Managers
1. **Start met Home pagina:**
   ```
   https://www.figma.com/make/75w1dSinK03GLkglA4HVHa/#/
   ```

2. **Bekijk alle user flows via Component Overview:**
   ```
   https://www.figma.com/make/75w1dSinK03GLkglA4HVHa/#/overview
   ```

---

## 🔍 Veelgestelde Vragen

### ❓ "Ik zie alleen een witte pagina"
**Oplossing:** Controleer of de `#` correct in de URL staat. De volledige URL moet er zo uitzien:
```
https://www.figma.com/make/75w1dSinK03GLkglA4HVHa/#/ds-summary
```

### ❓ "De pagina laadt niet"
**Oplossing:** Refresh de pagina (Cmd+R / Ctrl+R) of herlaad de base URL en navigeer opnieuw.

### ❓ "Hoe kom ik terug naar het begin?"
**Oplossing:** Klik op het Liquilab logo in de navigation bar, of ga naar:
```
https://www.figma.com/make/75w1dSinK03GLkglA4HVHa/#/
```

### ❓ "Kan ik pagina's bookmarken?"
**Antwoord:** Ja! Alle URLs met `#` zijn bookmark-able. Gebruik de volledige URL inclusief de route.

---

## 📚 Aanvullende Documentatie

- **Guidelines.md** - Volledige component & architecture guidelines
- **DEVELOPER_HANDOFF.md** - Developer implementation notes
- **DS_CONSISTENCY_AUDIT.md** - Design system consistency checks
- **RANGEBAND_UNIFICATION.md** - RangeBand component specificaties
- **UIZARD_EXPORT_GUIDE.md** - Uizard export workflow instructies

---

**Laatste update:** November 2024  
**Maintained by:** Liquilab Team

Voor vragen of ondersteuning, bekijk de Component Overview pagina of raadpleeg de Guidelines.md file.
