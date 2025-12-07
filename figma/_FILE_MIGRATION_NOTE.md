# File Migration Note

The following files currently exist in the repository root and should be referenced or migrated to `/figma/`:

## Files to Reference/Migrate

1. **`/FIGMA_MAKE_DS_SUMMARY_SPEC.md`** → Should be moved to `/figma/FIGMA_MAKE_DS_SUMMARY_SPEC.md`
   - Complete spec for the Figma_MAKE_DS_SUMMARY frame
   - Includes Strategy C sections
   - Currently ~530 lines

2. **`/DS_CONSISTENCY_AUDIT.md`** → Should be moved to `/figma/DS_CONSISTENCY_AUDIT.md`
   - DS consistency audit document
   - Known issues and resolutions

3. **`/HANDOVER_DESIGN_SYSTEM_SSOT.md`** → Should be moved to `/figma/HANDOVER_DESIGN_SYSTEM_SSOT.md`
   - High-level DS handover document

4. **`/RANGEBAND_UNIFICATION.md`** → Should be moved to `/figma/RANGEBAND_UNIFICATION.md`
   - Complete RangeBand™ specification

## Files Already in `/figma/`

- `/figma/DS_SUMMARY_EXPORT.md`
- `/figma/FILE_LOCATIONS.md`
- `/figma/GITHUB_INSTRUCTIONS.md`
- `/figma/IMPLEMENTATION_ROUTES.md`
- `/figma/README.md`

## Action Required

Run the following commands to move files:

```bash
# Move Design System docs to /figma
mv /FIGMA_MAKE_DS_SUMMARY_SPEC.md /figma/
mv /DS_CONSISTENCY_AUDIT.md /figma/
mv /HANDOVER_DESIGN_SYSTEM_SSOT.md /figma/
mv /RANGEBAND_UNIFICATION.md /figma/

# Then commit
git add figma/
git commit -m "Consolidate DS documentation under /figma"
git push origin main
```

**Note:** Since Figma Make cannot run shell commands, these file moves need to be done manually or we can recreate the content in the `/figma/` directory.
