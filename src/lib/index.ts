// TableCN Svelte - Main entry point
// A comprehensive data grid library for Svelte 5 using TanStack Table and TanStack Virtual

// ==============================================
// Components
// ==============================================

// Data Grid (main export)
export { DataGrid, DataGridCell, DataGridRow, DataGridColumnHeader, DataGridCellWrapper, DataGridSearch, DataGridContextMenu, DataGridPasteDialog } from './components/data-grid';
export { useDataGrid, type UseDataGridOptions, type UseDataGridReturn } from './components/data-grid';

// Data Grid Menu components
export { DataGridFilterMenu, DataGridSortMenu, DataGridViewMenu, DataGridRowHeightMenu, DataGridKeyboardShortcuts, DataGridRenderCount } from './components/data-grid';

// Data Grid filter utilities
export { getFilterFn } from './components/data-grid';

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
// Stores
// ==============================================
export { dataGridStore, DataGridStore, createDataGridStore } from './stores';

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
	ContextMenuState,
	PasteDialogState,
	SearchState,
	UpdateCell,
	NavigationDirection,
	DataGridProps,
	CellVariantProps
} from './types/data-grid';

export { getCellKey, parseCellKey, getRowHeightValue, getLineCount, ROW_HEIGHT_VALUES, ROW_LINE_COUNTS } from './types/data-grid';

export type {
	FilterOperator,
	FilterVariant,
	TextFilterOperator,
	NumberFilterOperator,
	DateFilterOperator,
	SelectFilterOperator,
	BooleanFilterOperator,
	JoinOperator,
	FilterOperatorDef,
	ExtendedColumnFilter,
	ExtendedColumnSort,
	UseDataTableOptions,
	UseDataTableReturn
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

// ==============================================
// Hooks
// ==============================================
export { useWindowSize } from './hooks/use-window-size.svelte.js';
export { useBadgeOverflow, clearBadgeWidthCache, type UseBadgeOverflowOptions, type UseBadgeOverflowReturn } from './hooks/use-badge-overflow.svelte.js';

// ==============================================
// Utils
// ==============================================
export {
	createKeyboardHandler,
	getKeyboardAction,
	matchesKeyBinding,
	formatKeyBinding,
	DEFAULT_KEY_BINDINGS,
	type KeyboardAction,
	type KeyBinding
} from './utils/keyboard';

export {
	parseClipboardText,
	formatClipboardText,
	getSelectedCellValues,
	formatCellValue,
	copyToClipboard,
	readFromClipboard,
	calculatePasteRequirements,
	createPasteOperations,
	type ClipboardData
} from './utils/clipboard';
