# Liquilab — Figma Design System Export Package

This directory contains the complete Design System (DS) and Strategy C documentation for the Liquilab DeFi liquidity analytics application.

## 📋 Contents

### Primary Design System Reference

- **`guidelines.md`** — Main Design System Single Source of Truth (SSoT)
  - Complete color palette, typography, component patterns
  - Strategy C numeric clarity rules (time windows, denominators)
  - Premium vs Pro differentiation
  - "No advice" framing rules
  - **⭐ ALWAYS READ THIS FIRST**

### Detailed Specifications

- **`FIGMA_MAKE_DS_SUMMARY_SPEC.md`** — Comprehensive spec for the `Figma_MAKE_DS_SUMMARY` frame
  - Foundations (colors, typography, spacing, icons)
  - Components & Patterns (KPI cards, RangeBand, tables, charts)
  - Layout Templates (Portfolio Premium/Pro, Pool Pro, Pool Universe)
  - Strategy C-specific sections

- **`RANGEBAND_UNIFICATION.md`** — Complete RangeBand™ specification
  - Strategy definitions (Aggressive/Balanced/Conservative)
  - Three layout variants (List/Card/Hero)
  - Range Efficiency calculations
  - Universe comparison snippets

### Documentation & Audit

- **`DS_CONSISTENCY_AUDIT.md`** — Design System consistency audit
  - Known issues (before fixes)
  - Resolutions applied
  - Verification checklist

- **`HANDOVER_DESIGN_SYSTEM_SSOT.md`** — High-level DS handover document
  - Overall DS philosophy
  - Strategy C overview
  - Cross-references to detailed specs

### Implementation & Export

- **`IMPLEMENTATION_ROUTES.md`** — Figma frames ⇄ React components mapping
  - Portfolio Premium/Pro routes
  - Pool Pro & Universe routes
  - Component file locations

- **`FILE_LOCATIONS.md`** — Quick reference map of all DS files in repo

- **`GITHUB_INSTRUCTIONS.md`** — Git commands to commit and push this directory

## 🎯 Quick Start

### For Developers

1. **Read `guidelines.md` first** — Primary DS SSoT with all rules and patterns
2. **Check `IMPLEMENTATION_ROUTES.md`** — Find which component implements which Figma frame
3. **Reference `RANGEBAND_UNIFICATION.md`** — For RangeBand™-specific implementation

### For Designers

1. **Read `guidelines.md`** — Complete design language and component specs
2. **Use `FIGMA_MAKE_DS_SUMMARY_SPEC.md`** — Detailed breakdown of all DS elements
3. **Follow `DS_CONSISTENCY_AUDIT.md`** — Ensure consistency in new designs

### For AI Tools (Codex, Claude, etc.)

1. **Always read `/figma/guidelines.md` first** for DS/UX rules
2. **Use `FILE_LOCATIONS.md`** to find specific specs
3. **Follow Strategy C rules**:
   - Explicit time windows (30D/90D/24h/snapshot/lifetime)
   - Clear denominators for all percentages (% of portfolio TVL, % of pool TVL, % of time, etc.)
   - No advice language — describe and compare only
   - Premium screens = own metrics only; Pro screens = add neutral peer/universe comparisons

## 📦 Strategy C Principles

**Numeric Clarity:**
- All time windows explicit (e.g., "APR (30D, annualized)", "Range Efficiency (30D)")
- All percentages have clear denominators (e.g., "2.8% of your portfolio TVL", "86% of time")
- Health thresholds visible and neutral (e.g., "<1% OK · 1–3% High · >3% Extreme")

**Premium vs Pro Differentiation:**
- **Premium** screens: Show only own metrics with baseline numeric clarity
- **Pro** screens: Add neutral peer/universe comparisons without advice language
- Universe comparisons use neutral numeric forms (Top X%, above/below median)

**"No Advice" Rule:**
- Descriptive language only: check/see/note/compare/confirm
- No imperatives: avoid "should", "must", "consider", "fix this"
- Present data neutrally; let users draw conclusions

## 🔧 Maintenance

When updating the Design System:

1. **Update `guidelines.md` first** — It's the SSoT
2. **Update relevant spec files** (FIGMA_MAKE_DS_SUMMARY_SPEC.md, RANGEBAND_UNIFICATION.md, etc.)
3. **Update `IMPLEMENTATION_ROUTES.md`** if new components/routes are added
4. **Run consistency check** using DS_CONSISTENCY_AUDIT.md checklist
5. **Commit changes** following instructions in GITHUB_INSTRUCTIONS.md

## 📍 Location in Repository

All files in this directory live at `/figma/` in the Liquilab codebase.

For file-specific locations and mappings, see `FILE_LOCATIONS.md`.

---

**Last updated:** 2025-11-25  
**Maintained by:** Liquilab Design Team
