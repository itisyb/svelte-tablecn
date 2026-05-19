// TableCN Svelte - Main entry point
// A comprehensive data grid library for Svelte 5 using TanStack Table and TanStack Virtual

// ==============================================
// Components
// ==============================================

// Data Grid (main export)
export {
	DataGrid,
	DataGridCell,
	DataGridRow,
	DataGridColumnHeader,
	DataGridCellWrapper,
	DataGridSearch,
	DataGridContextMenu,
	DataGridPasteDialog
} from './components/data-grid';
export {
	DataGridSkeleton,
	DataGridSkeletonToolbar,
	DataGridSkeletonGrid,
	getDataGridSelectColumn,
	useDataGrid,
	useDataGridUndoRedo,
	type UseDataGridOptions,
	type UseDataGridReturn,
	type UseDataGridUndoRedoOptions,
	type UseDataGridUndoRedoReturn,
	type UndoRedoCellUpdate,
	type GetDataGridSelectColumnOptions
} from './components/data-grid';

// Data Grid Menu components
export {
	DataGridFilterMenu,
	DataGridSortMenu,
	DataGridViewMenu,
	DataGridRowHeightMenu,
	DataGridKeyboardShortcuts,
	DataGridRenderCount
} from './components/data-grid';

// Data Grid filter utilities
export { getFilterFn } from './components/data-grid';
export { getColumnPinningStyle } from './data-table';
export { formatDate } from './format';
export { generateId } from './id';
export { getSortingStateParser, getFiltersStateParser, type FilterItemSchema } from './parsers';

// Data Table
export {
	DataTable,
	DataTableColumnHeader,
	DataTablePagination,
	DataTableViewOptions,
	DataTableFacetedFilter,
	DataTableDateFilter,
	DataTableSliderFilter,
	DataTableRangeFilter,
	DataTableToolbar,
	DataTableSkeleton,
	DataTableSortList,
	DataTableFilterList,
	DataTableFilterMenu,
	DataTableAdvancedToolbar,
	useDataTable,
	type UseDataTableOptions,
	type UseDataTableReturn
} from './components/data-table';

// Cell variants
export {
	ShortTextCell,
	LongTextCell,
	NumberCell,
	CheckboxCell,
	SelectCell,
	MultiSelectCell,
	DateCell,
	UrlCell,
	FileCell
} from './components/data-grid/cells';

// UI Components
export { Button, buttonVariants } from './components/ui/button';
export { Input } from './components/ui/input';
export { Checkbox } from './components/ui/checkbox';
export { Select } from './components/ui/select';
export { Slider } from './components/ui/slider';
export {
	Table,
	TableHeader,
	TableBody,
	TableRow,
	TableHead,
	TableCell,
	TableCaption
} from './components/ui/table';

// ==============================================
// Table utilities
// ==============================================
export { createSvelteTable, tableOptions, FlexRender } from './table';
export { renderComponent, renderSnippet, isComponentRender, isSnippetRender } from './table';
export type { FlexRenderContent } from './table';

// Re-export TanStack Table types
export {
	createColumnHelper,
	getCoreRowModel,
	getSortedRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getExpandedRowModel,
	getGroupedRowModel,
	getFacetedRowModel,
	getFacetedUniqueValues,
	getFacetedMinMaxValues,
	type ColumnDef,
	type ColumnHelper,
	type Row,
	type Cell,
	type Header,
	type HeaderGroup,
	type Column,
	type Table as TanStackTable,
	type TableState,
	type SortingState,
	type ColumnFiltersState,
	type VisibilityState,
	type RowSelectionState,
	type PaginationState,
	type ExpandedState,
	type GroupingState,
	type ColumnSizingState,
	type ColumnPinningState,
	type Updater,
	type OnChangeFn,
	type RowData,
	type CellContext,
	type HeaderContext,
	type ColumnDefTemplate
} from '@tanstack/table-core';

// ==============================================
// Virtual utilities (re-export from TanStack Virtual)
// ==============================================
export { type VirtualItem } from '@tanstack/virtual-core';

// ==============================================
// Types
// ==============================================
export type {
	CellSelectOption,
	FileCellData,
	CellOpts,
	CellPosition,
	CellRange,
	SelectionState,
	RowHeightValue,
	DataGridSelectHitboxSize,
	ContextMenuState,
	PasteDialogState,
	SearchState,
	UpdateCell,
	NavigationDirection,
	DataGridProps,
	CellVariantProps
} from './types/data-grid';

export {
	getCellKey,
	getCellValueKey,
	parseCellKey,
	getRowHeightValue,
	getLineCount,
	ROW_HEIGHT_VALUES,
	ROW_LINE_COUNTS
} from './types/data-grid';

export type {
	FilterOperator,
	FilterVariant,
	DataTableOption,
	QueryKeys,
	TextFilterOperator,
	NumberFilterOperator,
	DateFilterOperator,
	SelectFilterOperator,
	BooleanFilterOperator,
	JoinOperator,
	FilterOperatorDef,
	ExtendedColumnFilter,
	ExtendedColumnSort
} from './types/data-table';

export {
	TEXT_OPERATORS,
	NUMBER_OPERATORS,
	DATE_OPERATORS,
	SELECT_OPERATORS,
	BOOLEAN_OPERATORS,
	getFilterOperators,
	getDefaultFilterOperator,
	getValidFilters
} from './types/data-table';

// ==============================================
// Config
// ==============================================
export {
	OVERSCAN,
	VIEWPORT_OFFSET,
	MIN_COLUMN_SIZE,
	MAX_COLUMN_SIZE,
	DEFAULT_COLUMN_SIZE,
	ROW_HEIGHTS,
	KEYBOARD_SHORTCUTS,
	SELECTION_BORDER_WIDTH,
	ANIMATION_DURATION,
	DEBOUNCE_DELAY,
	CELL_VARIANTS,
	DEFAULT_CELL_VARIANT,
	FILE_UPLOAD_DEFAULTS,
	DATE_FORMAT,
	DATE_TIME_FORMAT,
	CLIPBOARD_MIME_TYPE,
	CLIPBOARD_SEPARATOR,
	CLIPBOARD_ROW_SEPARATOR
} from './config/data-grid';
export {
	DATA_TABLE_FILTER_VARIANTS,
	DATA_TABLE_JOIN_OPERATORS,
	DATA_TABLE_TEXT_OPERATORS,
	DATA_TABLE_NUMERIC_OPERATORS,
	DATA_TABLE_DATE_OPERATORS,
	DATA_TABLE_SELECT_OPERATORS,
	DATA_TABLE_BOOLEAN_OPERATORS,
	DATA_TABLE_SORT_ORDERS,
	DEFAULT_DATA_TABLE_QUERY_KEYS,
	DATA_TABLE_DEFAULTS,
	dataTableConfig
} from './config/data-table';

// ==============================================
// Hooks
// ==============================================
export { useWindowSize } from './hooks/use-window-size.svelte.js';
export {
	useBadgeOverflow,
	clearBadgeWidthCache,
	type UseBadgeOverflowOptions,
	type UseBadgeOverflowReturn
} from './hooks/use-badge-overflow.svelte.js';
export { useDebouncedCallback, type DebouncedCallback } from './hooks/use-debounced-callback';
export { useCallbackRef } from './hooks/use-callback-ref';
export { filterRows } from './filter-rows.js';
export {
	toSqlFilterOperator,
	fromSqlFilterOperator,
	type SqlFilterOperator
} from './map-sql-filter-operators.js';
