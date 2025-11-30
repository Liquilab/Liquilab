# Position Pro Data States Test Guide

## Purpose

This guide provides step-by-step instructions for testing the Position Pro page (`/position/[tokenId]/pro`) in all three data states (`ok`, `warming`, `empty`) and capturing screenshots for Strategy C UX and IP documentation.

## Prerequisites

1. Development server running: `npm run dev`
2. Browser with developer tools open
3. Screenshot tool ready (browser DevTools, or external tool)

## Route Information

**Path:** `/position/[tokenId]/pro`

**Example URLs:**
- `/position/12345/pro`
- `/position/67890/pro`

**Note:** The Position Pro endpoint (`/api/analytics/position/[tokenId]`) currently returns placeholder data. The page uses mock data for demonstration purposes.

## Testing Procedure

### Step 1: Locate the State Toggle

Open `pages/position/[tokenId]/pro.tsx` and locate line ~48:

```tsx
const positionDataState: DataState = 'ok'; // Change to 'warming' or 'empty' for testing
```

### Step 2: Test Each State

#### State 1: `ok` (Full Data)

1. Ensure `positionDataState` is set to `'ok'`:
   ```tsx
   const positionDataState: DataState = 'ok';
   ```

2. Navigate to `/position/12345/pro` (or any tokenId)

3. **Expected UI:**
   - No banner displayed (DataStateBanner returns `null` for `'ok'`)
   - All metric cards show values (Position Value, Fees Earned, Incentives Earned, Lifetime APR)
   - RangeBand component displays with full data
   - Range efficiency metrics show percentages
   - Peer comparison table shows 4 metrics with values
   - FTSO disclaimer visible at top

4. **Screenshot:** Capture full page
   - **Filename:** `Liquilab-PositionPro-OK.png`

#### State 2: `warming` (Partial Data)

1. Change `positionDataState` to `'warming'`:
   ```tsx
   const positionDataState: DataState = 'warming';
   ```

2. Save file and refresh browser

3. **Expected UI:**
   - Yellow banner displayed at top with spinner:
     - Title: "Position data warming up"
     - Subtitle: "Some metrics are based on partial history. Full 7-day data will be available once the backfill completes."
   - Core metrics (Position Value) may still show values
   - Fees Earned, Incentives Earned, Lifetime APR show `—` (null)
   - RangeBand component displays (if basic data available)
   - Range efficiency metrics show `—` (null)
   - Peer comparison section shows `WarmingPlaceholder`:
     - Yellow spinner
     - "Building peer comparison data" title
     - Skeleton loaders
   - FTSO disclaimer visible

4. **Screenshot:** Capture full page
   - **Filename:** `Liquilab-PositionPro-WARMING.png`

#### State 3: `empty` (No Data)

1. Change `positionDataState` to `'empty'`:
   ```tsx
   const positionDataState: DataState = 'empty';
   ```

2. Save file and refresh browser

3. **Expected UI:**
   - Empty-state banner displayed at top:
     - Icon: AlertCircle
     - Title: "Not enough history yet"
     - Subtitle: "Not enough history yet to show position analytics for this position. Data will appear as events are indexed."
   - All metric cards show `—`:
     - Position Value: `—`
     - Fees Earned: `—`
     - Incentives Earned: `—`
     - Lifetime APR: `—`
   - RangeBand Status section shows `WarmingPlaceholder`:
     - "Building range status data" title
     - Skeleton loaders
   - Peer comparison section shows `WarmingPlaceholder`
   - FTSO disclaimer visible

4. **Screenshot:** Capture full page
   - **Filename:** `Liquilab-PositionPro-EMPTY.png`

## Screenshot Checklist

Capture the following screenshots for each state:

- [ ] **OK State:** Full page showing all populated metrics
- [ ] **WARMING State:** Full page showing yellow banner and placeholders
- [ ] **EMPTY State:** Full page showing empty-state banner and placeholders

### Screenshot Naming Convention

- `Liquilab-PositionPro-OK.png`
- `Liquilab-PositionPro-WARMING.png`
- `Liquilab-PositionPro-EMPTY.png`

### Screenshot Requirements

- **Resolution:** Minimum 1920x1080 (or browser viewport size)
- **Format:** PNG
- **Content:** Full page scroll (capture entire content, not just viewport)
- **Annotations:** None (clean screenshots for documentation)

## Verification Checklist

For each state, verify:

### OK State
- [ ] No DataStateBanner visible
- [ ] All metric cards show numeric values (not `—`)
- [ ] RangeBand component renders with data
- [ ] Range efficiency metrics show percentages
- [ ] Peer comparison table shows 4 rows with data
- [ ] FTSO disclaimer visible

### WARMING State
- [ ] Yellow banner visible with spinner
- [ ] Banner text mentions "warming up" and "partial history"
- [ ] Core metrics may show values or `—`
- [ ] 7d/30d-dependent sections show `WarmingPlaceholder`
- [ ] Peer comparison shows placeholder with skeleton loaders
- [ ] FTSO disclaimer visible

### EMPTY State
- [ ] Empty-state banner visible with AlertCircle icon
- [ ] Banner text mentions "Not enough history yet"
- [ ] All metric cards show `—`
- [ ] RangeBand Status shows `WarmingPlaceholder`
- [ ] Peer comparison shows `WarmingPlaceholder`
- [ ] FTSO disclaimer visible

## Common Issues & Troubleshooting

### Issue: State not changing after editing file

**Solution:**
- Ensure Next.js dev server is running (`npm run dev`)
- Hard refresh browser (Cmd+Shift+R on macOS, Ctrl+Shift+R on Windows)
- Check browser console for errors

### Issue: TypeScript errors

**Solution:**
- Ensure `DataState` type is imported: `import { DataState } from '@/components/DataStateBanner'`
- Check that `positionDataState` is typed as `DataState`

### Issue: Components not rendering

**Solution:**
- Verify imports are correct
- Check that components exist in `src/components/`
- Review browser console for import errors

## Next Steps After Testing

1. **Document Findings:**
   - Note any UI inconsistencies
   - Document any missing sections or placeholders
   - Record any performance issues

2. **Backend Integration:**
   - Once Position Pro endpoint is wired, replace mock data with API call
   - Update `deriveDataState()` to use API response status
   - Remove manual `positionDataState` constant

3. **Screenshot Review:**
   - Review screenshots for clarity and completeness
   - Ensure all three states are clearly distinguishable
   - Use screenshots for Strategy C UX documentation and IP evidence

## Related Files

- `pages/position/[tokenId]/pro.tsx` — Position Pro page implementation
- `src/components/DataStateBanner.tsx` — Banner component
- `src/components/WarmingPlaceholder.tsx` — Placeholder component
- `STRATEGY_C_DATA_STATES_OVERVIEW.md` — Master overview document
- `PROJECT_STATE.md` — Changelog and project state

