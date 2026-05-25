# React Parity Plan

## Goal

Bring `svelte-tablecn` to feature parity with the original React `tablecn` in a staged, shippable order.

## Current Status

The local repo now covers the main editable `data-grid` and `data-table` surfaces:

- editable cells
- keyboard navigation
- cell selection
- copy, cut, paste
- search
- sort, filter, view, row-height menus
- column pinning, resizing, visibility
- virtualization
- context menu
- paste dialog
- data grid skeletons
- standalone data-grid select-column helpers
- README grid usage, paste flag, and undo/redo wiring examples are now checked against the shipped public API
- `data-table`, pagination, toolbar, advanced toolbar, view options, skeletons, and filter/sort menus
- date, range, slider, faceted, and list-style data-table filters
- core UI primitive styling and slot markers for the shipped Svelte primitives

The biggest remaining gaps versus upstream React `tablecn` are:

1. keyboard shortcut verification against the shipped grid behavior and shortcut UI
2. upstream UI primitives that are not shipped in the Svelte port yet:
   - `drawer`
   - `form`
   - `sortable`
3. a final documentation audit against newly completed parity surfaces
4. documentation examples that still need to be checked against the current public API

## Recommended Starting Point

Start with the remaining shortcut and documentation audits, then evaluate the missing primitive ports one at a time.

Why this first:

- the undo/redo hook is shipped and the demo wiring tracks cells and rows, with focused edit, paste-batch, paste-expansion, selected-cell clear, document-level redo shortcut, global Escape selection-clear, and Ctrl/Cmd+Shift+F filter/search shortcut conflict coverage now in place
- it improves the existing `data-grid` directly
- it is much smaller than the `data-table` surface
- it reduces the biggest credibility gap before expanding scope
- it does not require choosing new Svelte equivalents for React-only dependencies like `vaul` or `react-hook-form`

## Execution Order

### Phase 1: Finish Data Grid Parity

1. Verify keyboard shortcuts against the shipped hook behavior
2. Update keyboard shortcuts UI if behavior changes
3. Align docs with the actual shipped grid surface

### Phase 2: Validate and Tighten Grid API

1. Verify exported components match the upstream React package where practical
2. Remove or correct unsupported README claims
3. Add focused tests for:
   - selection plus edit history interactions
   - public select-column helper behavior
   - public package exports and registry entries (covered for data-grid)

### Phase 3: Close Missing UI Primitive Gaps

1. Port `drawer` with an explicit Svelte dependency decision for Vaul-style behavior
2. Port `form` only after choosing the Svelte form-state integration that replaces `react-hook-form`
3. Port `sortable` against the existing `svelte-dnd-action` dependency
4. Add source and browser tests for each primitive's slot markers, classes, and core interaction behavior

### Phase 4: Final Data Table API Audit

1. Verify `DataTable` examples against upstream table flows
2. Recheck filter, sort, pagination, and toolbar public APIs
3. Align types, config, docs, and exports with upstream behavior where practical

## Acceptance Criteria

### Grid Parity

- undo and redo work for cell edits, paste operations, and selected-cell clears
- keyboard shortcuts match shipped behavior
- `data-grid-skeleton` is available and exported
- `data-grid-select-column` is reusable and documented

### Table Parity

- a consumer can build the same server-side `data-table` flows as the React package
- filtering, sorting, pagination, and toolbar flows are available through public exports
- documented examples compile against the public package entrypoint

### UI Primitive Parity

- shipped primitives expose the same `data-slot` contract as upstream where the Svelte implementation has an equivalent component
- `drawer`, `form`, and `sortable` are either ported or explicitly documented as out of scope until their dependency decisions are made

## Risks

- `drawer` depends on Vaul in upstream React, so the Svelte port needs an equivalent behavior choice before implementation
- `form` depends on `react-hook-form`, so a direct port is not possible without choosing a Svelte form-state contract
- `sortable` is feasible with `svelte-dnd-action`, but it has a larger interaction surface than the slot-marker parity fixes
- naming can still drift if exports and registry entries are not checked after each parity slice

## Next Milestone

Ship this small, clean milestone next:

1. continue shortcut verification beyond undo/redo, global Escape, and filter/search conflict paths
2. finish the broader README/data-table documentation audit

That gives the fastest path to a real parity improvement before opening larger dependency decisions for `drawer`, `form`, or `sortable`.
