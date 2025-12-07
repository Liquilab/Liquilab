# Liquilab — Design System File Locations Map

**Document Purpose:** Quick reference guide for locating all Design System and Figma-related documentation files in the Liquilab codebase.

**Last Updated:** 2025-11-25

---

## 📁 Primary Design System Documentation

### `/figma/` Directory — Central DS Hub

| File | Purpose | Size | Priority |
|------|---------|------|----------|
| **`README.md`** | Overview of `/figma/` directory and quick start guide | Medium | ⭐⭐⭐ Read First |
| **`guidelines.md`** | Reference to primary DS SSoT (`/guidelines/Guidelines.md`) | Small | ⭐⭐⭐ |
| **`HANDOVER_DESIGN_SYSTEM_SSOT.md`** | High-level DS handover for teams & AI tools | Large | ⭐⭐⭐ Essential |
| **`RANGEBAND_UNIFICATION.md`** | Complete RangeBand™ specification (3 variants) | Large | ⭐⭐⭐ Core Feature |
| **`IMPLEMENTATION_ROUTES.md`** | Figma frames ⇄ React components mapping | Medium | ⭐⭐ Implementation |
| **`DS_CONSISTENCY_AUDIT.md`** | DS audit, known issues, and resolutions | Medium | ⭐ Audit |
| **`FILE_LOCATIONS.md`** | This file — file location map | Small | ⭐ Reference |
| **`GITHUB_INSTRUCTIONS.md`** | Git commands to commit `/figma/` directory | Small | ⭐ Git Workflow |

---

## 📂 Primary Design System SSoT

### `/guidelines/` Directory

| File | Purpose | Priority |
|------|---------|----------|
| **`Guidelines.md`** | **MAIN DS SSoT** — Complete design system | ⭐⭐⭐⭐⭐ |

**⚠️ CRITICAL:**  
`/guidelines/Guidelines.md` is the **Single Source of Truth (SSoT)** for the entire Design System.  
**Always read this file first** when implementing new features or components.

---

## 📄 Project State & Changelog

| File | Purpose | Priority |
|------|---------|----------|
| **`PROJECT_STATE.md`** | Changelog of Strategy C updates | ⭐⭐⭐ Current State |

---

## 🧩 React Components

### Core Components — `/components/`

| File | Component | Used In |
|------|-----------|---------|
| `Rangeband.tsx` | RangeBand™ (List/Card/Hero) | PoolTable, PoolCard, PoolDetail |
| `PoolCard.tsx` | Pool card (grid view) | PoolsOverview (grid) |
| `PoolTable.tsx` | Pool table rows (list view) | PoolsOverview (list), WalletOverview |
| `TokenIcon.tsx` | Token icons & pairs | All pool/portfolio screens |
| `Navigation.tsx` | Main navigation bar | All pages (global) |
| `RangeBandIcon.tsx` | RangeBand™ brand icon | Navigation, AccountPage |

### UI Components — `/components/ui/`

ShadCN components (see `/guidelines/Guidelines.md` for full list)

---

## 📄 Pages — `/pages/`

### Portfolio Screens

| File | Route | Figma Frame |
|------|-------|-------------|
| `WalletOverview.tsx` | `/wallet-premium` | Portfolio Premium |
| `WalletOverviewPro.tsx` | `/wallet-pro` | Portfolio Pro |

### Pool Screens

| File | Route | Figma Frame |
|------|-------|-------------|
| `PoolsOverview.tsx` | `/pools` | Pool Overview |
| `PoolDetailPage.tsx` | `/pool/:id` | Pool Detail (Standard) |
| `PoolDetailProPage.tsx` | `/pool/:id/pro` | Pool Pro |
| `PoolUniversePage.tsx` | `/pool/:id/universe` | Pool Universe |

### Marketing & Info

| File | Route | Purpose |
|------|-------|---------|
| `HomePage.tsx` | `/` | Landing page |
| `RangeBandExplainer.tsx` | `/rangeband` | RangeBand™ education |
| `PricingPage.tsx` | `/pricing` | Pricing plans |
| `AccountPage.tsx` | `/account` | Subscription control |
| `FAQPage.tsx` | `/faq` | FAQ |

### Dev Tools

| File | Route | Purpose |
|------|-------|---------|
| `RangeBandDS.tsx` | `/rangeband-ds` | RangeBand™ DS showcase |
| `ComponentOverviewPage.tsx` | `/overview` | Navigation hub |
| `IconShowcase.tsx` | `/icons` | Icon library |

---

## 🎨 Styles

| File | Purpose |
|------|---------|
| `/styles/globals.css` | Global CSS (Tailwind v4, design tokens, typography) |

---

## 📋 Quick Reference Cheat Sheet

### For Developers

1. Read `/guidelines/Guidelines.md` — Main DS SSoT
2. Check `/figma/IMPLEMENTATION_ROUTES.md` — Component/route mappings
3. Reference `/figma/RANGEBAND_UNIFICATION.md` — RangeBand™ spec

### For Designers

1. Read `/figma/HANDOVER_DESIGN_SYSTEM_SSOT.md` — DS overview
2. Reference `/guidelines/Guidelines.md` — Complete design language
3. Follow `/figma/DS_CONSISTENCY_AUDIT.md` — Ensure consistency

### For AI Tools

**Always read in this order:**
1. `/guidelines/Guidelines.md` — Main DS SSoT (colors, typography, components, Strategy C rules)
2. `/figma/HANDOVER_DESIGN_SYSTEM_SSOT.md` — High-level overview + Strategy C principles
3. `/figma/IMPLEMENTATION_ROUTES.md` — Figma ⇄ code mappings
4. `/PROJECT_STATE.md` — Current implementation state & changelog

---

**Last Updated:** 2025-11-25  
**Maintained by:** Liquilab Design Team
