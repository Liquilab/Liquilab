# Git Instructions for Committing `/figma` Design System Documentation

**Document Purpose:** Step-by-step Git commands to commit and push the `/figma` directory to the Liquilab repository.

**⚠️ IMPORTANT:** Figma Make (AI) cannot run these commands. A human user must execute them in a terminal.

---

## 🚀 Step-by-Step Git Workflow

### Step 1: Navigate to Repository

```bash
cd ~/Liquilab_staging  # Of waar je repo staat
```

---

### Step 2: Check Current Status

```bash
git status
```

Je zou de nieuwe bestanden in `/figma/` moeten zien als "untracked files".

---

### Step 3: Stage All Files in `/figma`

```bash
git add figma/
```

---

### Step 4: Verify Staged Files

```bash
git status
```

Controleer dat alle bestanden onder "Changes to be committed" staan.

---

### Step 5: Commit Changes

```bash
git commit -m "Add complete Figma Design System export package under /figma

- Add comprehensive Design System documentation
- Include Strategy C numeric clarity rules (explicit time windows, clear denominators)
- Add Premium vs Pro differentiation guidelines
- Include RangeBand™ unified specification (List/Card/Hero variants)
- Add Figma ⇄ React component implementation routes
- Add DS consistency audit and handover documentation
- Add file location map and Git instructions"
```

**Korte versie:**

```bash
git commit -m "Add complete Figma Design System documentation to /figma"
```

---

### Step 6: Push to Remote

```bash
git push origin main
```

---

## 🔄 Één Commando (Voor Gevorderden)

```bash
git add figma/ && \
git commit -m "Add complete Figma Design System documentation to /figma" && \
git push origin main
```

---

## 📝 Verificatie

Na het pushen:

1. Open GitHub in je browser
2. Navigeer naar `/figma/` directory
3. Controleer dat alle bestanden aanwezig zijn:
   - README.md
   - guidelines.md
   - HANDOVER_DESIGN_SYSTEM_SSOT.md
   - RANGEBAND_UNIFICATION.md
   - IMPLEMENTATION_ROUTES.md
   - FILE_LOCATIONS.md
   - GITHUB_INSTRUCTIONS.md
   - DS_CONSISTENCY_AUDIT.md

---

## 🛠️ Troubleshooting

### "Permission denied" bij push

**Oplossing:** Controleer of je schrijftoegang hebt tot de repo.

---

### "Working directory not clean"

**Oplossing:** 
```bash
git stash
git pull
git stash pop
```

---

**Document Created:** 2025-11-25  
**Maintained by:** Liquilab Design Team
