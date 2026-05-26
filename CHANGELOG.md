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
- UI primitive README export documentation now includes drawer portal/overlay and form helper exports.
- Data-grid README option documentation now includes sorting, filter, and row-selection change callbacks and is checked against `UseDataGridOptions`.
- Data-table README option documentation now includes required `data` and `columns` options and is checked against `UseDataTableOptions`.
- Generated registry artifact coverage now verifies item metadata and file `type`/`target` entries against `registry.json`.
- Data grid select editor popovers now keep the original select radius and offset while matching the cell width.
- Data grid select editor options now keep the original select item radius inside the cell-width editor surface.
- Action bar browser coverage now verifies upstream entry-focus cancellation and item-select event ordering.
- Data-grid row coverage now checks the upstream custom-cell renderer switch: function headers render custom cells directly, while string headers use the grid cell path.
- README registry documentation now lists every installable `/r/*.json` item and is checked against `registry.json`.
- Registry parity coverage now asserts every original installable item remains present, with only `drawer`, `form`, and `sortable` as intentional Svelte additions.
- Registry parity coverage now asserts common installable items preserve upstream UI registry dependencies while allowing Svelte-specific additions.
- Data-grid registry coverage now asserts the full bundle ships Svelte equivalents for the original grid components, hook, helper, and type files.
- Data-table registry coverage now asserts the full bundle ships Svelte equivalents for the original table components, hook, helper, parser, config, and type files.
- Standalone data-table sort/filter menu registry slices are now checked and scoped to the files their Svelte implementations actually import.
- Standalone data-grid keyboard shortcuts registry coverage now checks the slice stays scoped to its Svelte implementation.
- Standalone data-grid select-column registry coverage now checks the slice stays scoped to row-selection rendering helpers.
- Data-grid registry coverage now guards against bundling the demo-only window size hook.
- Standalone grid menu/dialog registry dependency coverage now checks direct package imports rather than primitive implementation packages.
- Data-grid module coverage now checks upstream cell-key and row-height helpers are exported from `data-grid.ts`.
- Data-table filter coverage now checks the upstream `isRelativeToToday` date operator is accepted, mapped, and applied by the in-memory filter reference.

### Fixed

- Data-table range filters now preserve incomplete `isBetween` values like upstream and apply the same one-sided numeric behavior in the in-memory row filter reference.
- Data grid select editor popovers now use a square cell-editor surface while keeping the original select item radius.
- Parity audit tests now fail directly when a `registry.json` source path stops resolving.
- `DataTableFilterMenu` now forwards custom classes to the command popover content like upstream instead of styling the outer filter list.
- Data grid select editor popovers now use a softer cell-editor radius while preserving the original item radius, width, and offset.
- Data grid select editor popovers no longer override the shared select offset, matching the original menu placement.
- Short text and URL cell editors now restore the original value on `Escape`, matching upstream edit cancellation behavior.
- File editor popovers now only stop `Escape` key propagation, allowing ordinary keys to bubble like the upstream file editor.
- Data-table sort/filter keyboard shortcuts now remain wired like upstream even when the trigger button is disabled.
- Data-table slider filters now keep user-selected default-range values active until the explicit clear action, matching upstream behavior.
- Action bar groups now dispatch the cancelable upstream entry-focus event before moving focus into items, and action bar item `onselect` handlers now run during `actionbar.itemSelect` dispatch before the event bubbles.
- Data-grid rows now choose direct custom-cell rendering from function headers like upstream, instead of switching on the presence of a custom `cell` renderer alone.
- Standalone data-table sort/filter menu registry slices no longer over-ship unrelated advanced toolbar, view options, parser, config, or drag dependencies.
- Standalone data-grid keyboard shortcuts no longer ships the full data-grid type module or declares `@tanstack/table-core`.
- Data-grid components import Svelte table render helpers directly, so the data-grid and select-column registry slices no longer ship the full `$lib/table` barrel or table creation files.
- The full data-grid registry bundle no longer ships `use-window-size.svelte.ts`, matching the original registry where window sizing is demo-only.
- Standalone row-height, view, and keyboard-shortcut registry slices no longer declare `bits-ui` directly when it is only provided through UI primitive registry dependencies.
- `data-grid.ts` now re-exports cell-key and row-height helpers so module-level utility imports match the original API.
- Data grid select editor option highlights no longer override the shared select item radius.
- Data-table date filter operators now include the upstream `isRelativeToToday` option, with UI-to-SQL mapping and client-side row filtering support.
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
