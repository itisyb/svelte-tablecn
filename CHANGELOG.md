# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- `DataGridKeyboardShortcuts` is documented with the shipped option surface and `Ctrl/Cmd + /` trigger.
- Standalone `drawer`, `form`, and `sortable` registry slices are documented and exported from the package root.
- Package root and UI barrel now forward the Svelte-native form helper functions and the public `drawer`, `form`, and `sortable` primitive type contracts.
- Adapter scope is documented for `drawer`, `form`, and `sortable`: current parity covers installable slots/styling/ARIA contracts without adding React-only runtime dependencies.
- Registry audit coverage now verifies every installable registry item is emitted in `static/r` with the expected file targets.
- Keyboard shortcut dialog coverage now checks the full original 50-row shortcut map.
- Data-table README component documentation now includes the exported date and slider filter components and is checked against package-root exports.

### Fixed

- Data grid select editor popovers use the upstream select content radius instead of forcing square corners.
- Cell and row selection after filtering: use row-model position (not core `row.index`) so shift-select and counts only include visible rows ([#20](https://github.com/itisyb/svelte-tablecn/issues/20))
- Click outside the grid clears cell focus (tablecn behavior); no longer re-focuses the cell on `focusout`

## [0.2.0] - 2026-05-20

### Added

- **Data grid — tablecn parity**
  - Column selection (click header) and single-cell selection mode
  - `getVisualRowIndex`, `getEmptyCellValue`, focus guard, `onRowSelect(rowId)`
  - Keyboard navigation: Ctrl+↑/↓ (first/last row in column), Alt+PgUp/PgDn (horizontal page scroll), Ctrl+Shift+↑/↓ (extend selection to grid edge)
  - `scrollCellIntoView` with RTL-aware horizontal scrolling
  - Text direction: LTR/RTL toggle with `dir` on grid, pinning, and resize direction
  - `stretchColumns` option to grow columns to fill the viewport
  - Column border styling for pinned columns (tablecn-style shadows)
- **Data grid — action bar & export**
  - `DataGridActionBar` for bulk status/department updates and delete on multi-cell selection
  - `exportTableToCSV` utility and Export button on the demo
- **Data grid — demo**
  - 10,000-row virtualized demo (200 rows under Vitest for faster tests)
  - Stretch columns and RTL toolbar controls
- **Data table**
  - Select-all header checkbox with indeterminate state
  - Rows-per-page label in pagination
  - Salary range filter with tablecn-style slider UX
  - Advanced filter list (add/reorder rules) and command filter menu
- **Tests**
  - `data-table-showcase.svelte.spec.ts` for filter UI browser tests
  - Vitest project split (server + browser); `test:browser` script

### Fixed

- **LTR / RTL**
  - Stop inferring RTL from negative `scrollLeft` after toggling back to LTR
  - Reset horizontal scroll when `dir` changes
  - Apply `dir` and explicit text alignment on rows, cells, and cell content (not only headers)
  - RTL-aware column navigation and Alt+horizontal paging
  - Toolbar menus (filter, sort, view, shortcuts) respect text direction
- **Column pinning**
  - Virtual rows use `top` positioning instead of `transform` so `position: sticky` on pinned cells works
  - Header and body share the same column order (`getVisibleLeafColumns` / `row.getVisibleCells`)
  - Grid body `min-width` matches table width for correct horizontal scroll
- **Add row**
  - Blank rows (`{ id }` only) ready to edit, tablecn-style
  - Footer-only Add row (removed duplicate toolbar button)
  - Row index resolves by `rowId` after sort/filter; `syncTableFromData` keeps table in sync
  - Focus and scroll-to-row after add (Shift+Enter)
- **Performance & UX**
  - Faster first paint: deferred demo data load, lighter table tab (200 rows)
  - Grid remount fix when switching demo tabs
  - Column resize contained within parent width
  - Advanced filter re-render loop and status filter infinite loop
  - Svelte 5 reactivity fixes in `createSvelteTable` and data table hooks
- **Misc**
  - Clear column selection highlight after pin/unpin
  - Removed debug `$inspect` from search component

### Removed

- Render Perf Demo tab and `grid-render-demo.svelte`
- `DataGridRenderCount` component (registry and exports)
- Demo helper copy (“10,000 rows…”, “All rows in memory…”)

### Changed

- Add row footer is sticky inside the scroll area (tablecn layout)
- `+page.svelte` uses static imports for grid/table demos (no dynamic import split)
- `data-table-showcase` imports from `$lib/components/data-table` instead of full `$lib` barrel where possible

## [0.1.0] - 2026-05-01

### Added

- Initial release: Svelte 5 port of tablecn data grid and data table
- Cell variants (text, number, date, select, multi-select, checkbox, URL, file)
- Keyboard navigation, selection, copy/paste, search, sort, filter, pin, resize
- Row virtualization, context menu, undo/redo
- shadcn-svelte registry (`data-grid`, `data-table` bundles)
- Live demo with Data Grid and Data Table tabs

[Unreleased]: https://github.com/itisyb/svelte-tablecn/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/itisyb/svelte-tablecn/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/itisyb/svelte-tablecn/releases/tag/v0.1.0
