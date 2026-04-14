# React Parity Plan

## Goal

Bring `svelte-tablecn` to feature parity with the original React `tablecn` in a staged, shippable order.

## Current Status

The local repo already covers most of the editable `data-grid` surface:

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

The biggest gaps versus upstream React `tablecn` are:

1. `use-data-grid-undo-redo`
2. `data-grid-skeleton`
3. standalone `data-grid-select-column` helper/export
4. the full `data-table` family:
   - `data-table`
   - `data-table-sort-list`
   - `data-table-filter-list`
   - `data-table-filter-menu`
   - pagination, toolbar, advanced toolbar, faceted filters, date/range/slider filters, skeleton

## Recommended Starting Point

Start with `use-data-grid-undo-redo`.

Why this first:

- it is missing from the shipped source but already claimed in `README.md`
- it improves the existing `data-grid` directly
- it is much smaller than the `data-table` surface
- it reduces the biggest credibility gap before expanding scope

## Execution Order

### Phase 1: Finish Data Grid Parity

1. Implement `use-data-grid-undo-redo`
2. Wire undo and redo keyboard shortcuts into the grid
3. Expose undo and redo in the public API
4. Update keyboard shortcuts UI to match behavior
5. Add `data-grid-skeleton`
6. Add a standalone `data-grid-select-column` export built from the current row-select pieces
7. Align docs and registry with the actual shipped grid surface

### Phase 2: Validate and Tighten Grid API

1. Verify exported components match the upstream React package where practical
2. Remove or correct unsupported README claims
3. Add focused tests for:
   - undo and redo behavior
   - selection plus edit history interactions
   - paste plus undo interactions
   - public select-column helper behavior

### Phase 3: Build Data Table Core

1. Add `useDataTable` hook
2. Add core `DataTable` component
3. Add pagination
4. Add toolbar and view options
5. Add faceted filter support
6. Add table skeleton

### Phase 4: Build Advanced Data Table Features

1. Add sort list
2. Add filter list
3. Add filter menu
4. Add advanced toolbar
5. Add date, range, and slider filters
6. Align types, config, and exports with upstream React behavior

## Acceptance Criteria

### Grid Parity

- undo and redo work for cell edits and paste operations
- keyboard shortcuts match shipped behavior
- `data-grid-skeleton` is available and exported
- `data-grid-select-column` is reusable and documented

### Table Parity

- a consumer can build the same server-side `data-table` flows as the React package
- filtering, sorting, pagination, and toolbar flows are available through public exports

## Risks

- the local repo currently has `data-table` types but no shipped `data-table` implementation, so naming can drift if we do not anchor to upstream API first
- dependency installation is currently blocked locally because `node_modules` is not present, so full verification will require installing dependencies before checks/tests

## First Milestone

Ship this small, clean milestone first:

1. `use-data-grid-undo-redo`
2. shortcut integration
3. README correction or confirmation

That gives the fastest path to a real parity improvement without opening the much larger `data-table` scope immediately.
