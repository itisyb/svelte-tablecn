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
- README data-table usage and option examples are now checked against the shipped public API
- `data-table`, pagination, toolbar, advanced toolbar, view options, skeletons, and filter/sort menus
- date, range, slider, faceted, and list-style data-table filters
- core UI primitive styling and slot markers for the shipped Svelte primitives
- `sortable` UI primitive is shipped, exported, registry-backed, and covered by source/browser tests
- `drawer` UI primitive is shipped, exported, registry-backed, and covered by source/browser tests using the existing Bits Dialog foundation
- `form` UI primitive is shipped, exported, registry-backed, and covered by source/browser tests using a Svelte-native error/context contract
- README now documents the shortcut dialog and standalone `drawer`, `form`, and `sortable` registry slices against the shipped public API

The biggest remaining gaps versus upstream React `tablecn` are:

1. keyboard shortcut verification against the shipped grid behavior and shortcut UI
2. a final documentation audit against any newly completed parity surfaces outside the README examples
3. a completion audit across exports, registry items, docs, and runtime behavior

## Recommended Starting Point

Start with the remaining shortcut and documentation audits, then evaluate the missing primitive ports one at a time.

Why this first:

- the undo/redo hook is shipped and the demo wiring tracks cells and rows, with focused edit, paste-batch, paste-expansion, selected-cell clear, document-level redo shortcut, global Escape selection-clear, and Ctrl/Cmd+Shift+F filter/search shortcut conflict coverage now in place
- it improves the existing `data-grid` directly
- it is much smaller than the `data-table` surface
- it reduces the biggest credibility gap before expanding scope
- it does not require adding React-only dependencies like `react-hook-form`

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

1. Keep `form` covered against the Svelte-native error/context contract while evaluating whether a richer form-state adapter is needed
2. Keep `drawer` covered against the existing Bits Dialog implementation while deciding whether Vaul-style drag/snap behavior needs a Svelte dependency
3. Keep `sortable` covered against the existing `svelte-dnd-action` implementation while closing the remaining primitive gaps
4. Add source and browser tests for any future primitive adapters' slot markers, classes, and core interaction behavior

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
- `sortable` is ported with the existing Svelte drag dependency
- `drawer` is ported with the existing Bits Dialog dependency and upstream slot/direction styling contract
- `form` is ported with a Svelte-native error/context contract that preserves upstream IDs, slots, and ARIA wiring

## Risks

- `drawer` depends on Vaul in upstream React; the current Svelte port covers the modal drawer contract with Bits Dialog, but deeper drag/snap behavior still needs an explicit dependency decision if required
- `form` depends on `react-hook-form` upstream; the current Svelte port covers the primitive contract, but richer controller-level integration needs an explicit Svelte form-state adapter if required
- `sortable` uses `svelte-dnd-action`, so any deeper keyboard or announcement parity work needs to respect that library's event model
- naming can still drift if exports and registry entries are not checked after each parity slice

## Next Milestone

Ship this small, clean milestone next:

1. finish any remaining broader documentation audit outside the README examples
2. complete a requirement-by-requirement parity audit across exports, registry items, docs, and runtime behavior

That gives the fastest path to a real parity improvement before opening richer adapter decisions for `drawer` drag/snap behavior or `form` controller-level integration.
