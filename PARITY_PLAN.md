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
- The non-README docs now record the shipped shortcut dialog, standalone primitive registry slices, package-root/UI-barrel primitive helper/type exports, and cell-aligned select editor fix
- The adapter decision for the current parity target is explicit: `drawer`, `form`, and `sortable` preserve the installable slots, styling, exported names, IDs, and ARIA contracts without pulling in React-only runtime dependencies
- Generated `static/r` registry artifacts are checked against `registry.json` so installable slices cannot silently miss or drift from their declared file targets
- The keyboard shortcuts dialog is source-checked against the original 50-row shortcut map, and browser coverage exercises gated row mutation shortcuts, optional shortcuts, filtering, and the upstream empty state
- README data-table component documentation is now checked against the package-root export surface, including `DataTableDateFilter` and `DataTableSliderFilter`
- README primitive export documentation is checked against the package-root export surface, including `DrawerPortal`, `DrawerOverlay`, `getFormFieldState`, and `getFormErrorMessage`
- README data-grid option documentation is checked against `UseDataGridOptions`, including sorting, filter, and row-selection change callbacks
- README data-table option documentation is checked against `UseDataTableOptions`, including required `data` and `columns` options
- Generated registry artifacts are checked against `registry.json` for item metadata and file `type`/`target` entries, not only artifact presence
- The data-grid single-select cell editor uses square cell-scoped content and cancels select side translation, leaving the shared select primitive default shape intact
- README registry documentation is checked against `registry.json` so every installable `/r/*.json` slice is listed
- Registry item names are checked against the original installable set, with `drawer`, `form`, and `sortable` recorded as intentional Svelte-only primitive additions
- Common registry items are checked to preserve upstream UI registry dependencies while allowing Svelte-specific additions
- The full `data-grid` registry bundle is checked for Svelte equivalents to the original core grid components, hook, helper, and type files
- The full `data-table` registry bundle is checked for Svelte equivalents to the original table components, hook, helper, parser, config, and type files
- Standalone data-table sort/filter menu registry slices are checked against the files their Svelte implementations actually import, avoiding unrelated advanced-toolbar/view-options/parser/config payload drift
- Standalone data-grid keyboard shortcuts registry coverage checks the slice stays scoped to the component instead of over-shipping data-grid types or table-core
- Standalone data-grid select-column registry coverage checks the slice stays scoped to row-selection rendering helpers instead of over-shipping the full table barrel

The biggest remaining gaps versus upstream React `tablecn` are:

1. a completion audit across exports, registry items, docs, and runtime behavior
2. optional follow-up issues for deeper `drawer` drag/snap behavior, richer `form` controller integration, and sortable keyboard/announcement parity if the project decides to go beyond the current installable primitive contract

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
- current primitive parity intentionally excludes React-only runtime integrations:
  - no Vaul drag/snap physics in `drawer`
  - no `react-hook-form` controller adapter in `form`
  - no dnd-kit keyboard sensor/announcement layer in `sortable`
  These require explicit dependency/product decisions before implementation.

## Risks

- `drawer` depends on Vaul in upstream React; the current Svelte port covers the modal drawer contract with Bits Dialog. Drag/snap physics should be a separate follow-up only if a Svelte drawer dependency is accepted.
- `form` depends on `react-hook-form` upstream; the current Svelte port covers the primitive contract. Controller-level integration should be a separate follow-up only after choosing a Svelte form-state adapter.
- `sortable` uses `svelte-dnd-action`, so dnd-kit-style keyboard sensors or screen-reader announcements should be a separate follow-up only if that accessibility scope is required for the Svelte dependency model.
- naming can still drift if exports and registry entries are not checked after each parity slice

## Next Milestone

Ship this small, clean milestone next:

1. complete a requirement-by-requirement parity audit across exports, registry items, docs, and runtime behavior
2. if the audit accepts the current installable primitive scope, track deeper adapter behavior separately instead of treating it as required for this parity PR

That gives the fastest path to a real parity improvement before opening richer adapter decisions for `drawer` drag/snap behavior or `form` controller-level integration.
