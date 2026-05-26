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
	DataGridActionBar
} from './components/data-grid';

// Data Grid filter utilities
export * from './data-grid-filters';
export {
	flexRender,
	formatDateForDisplay,
	formatDateToString,
	formatFileSize,
	formatCellValueForCopy,
	getColumnBorderVisibility,
	getColumnPinningStyle as getDataGridColumnPinningStyle,
	getColumnVariant,
	getEmptyCellValue,
	getFileIcon,
	getIsFileCellData,
	getIsInPopover,
	getRowIndicesForDeletion,
	getRowModelPosition,
	getScrollDirection,
	getUrlHref,
	matchSelectOption,
	parsePastedCellValue,
	parseTsv,
	parseLocalDate,
	serializeCellsToTsv,
	scrollCellIntoView,
	toPinningStyleString
} from './data-grid';
export {
	getColumnPinningStyle,
	getColumnPinningStyle as getDataTableColumnPinningStyle
} from './data-table';
export { formatDate } from './format';
export { generateId } from './id';
export { getAbsoluteUrl } from './utils';
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
	FileCell,
	RowSelectCell,
	RowSelectHeader
} from './components/data-grid/cells';

// UI Components
export {
	ActionBar,
	ActionBarSelection,
	ActionBarGroup,
	ActionBarItem,
	ActionBarClose,
	ActionBarSeparator
} from './components/ui/action-bar';
export { exportTableToCSV } from './export';
export { Badge, badgeVariants, type BadgeVariant } from './components/ui/badge';
export { Button, buttonVariants } from './components/ui/button';
export {
	Calendar,
	Caption as CalendarCaption,
	Cell as CalendarCell,
	Day as CalendarDay,
	Grid as CalendarGrid,
	GridBody as CalendarGridBody,
	GridHead as CalendarGridHead,
	GridRow as CalendarGridRow,
	Header as CalendarHeader,
	HeadCell as CalendarHeadCell,
	Heading as CalendarHeading,
	Month as CalendarMonth,
	Months as CalendarMonths,
	MonthSelect as CalendarMonthSelect,
	Nav as CalendarNav,
	NextButton as CalendarNextButton,
	PrevButton as CalendarPrevButton,
	YearSelect as CalendarYearSelect
} from './components/ui/calendar';
export {
	Faceted,
	FacetedBadgeList,
	FacetedContent,
	FacetedEmpty,
	FacetedGroup,
	FacetedInput,
	FacetedItem,
	FacetedList,
	FacetedSeparator,
	FacetedTrigger
} from './components/ui/faceted';
export {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
	getFormErrorMessage,
	getFormFieldState,
	type FormControlAttributes,
	type FormContextValue,
	type FormFieldContextValue,
	type FormFieldError,
	type FormFieldState,
	type FormItemContextValue
} from './components/ui/form';
export {
	Command,
	CommandDialog,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandLinkItem,
	CommandList,
	CommandLoading,
	CommandSeparator,
	CommandShortcut
} from './components/ui/command';
export {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogOverlay,
	DialogPortal,
	DialogTitle,
	DialogTrigger
} from './components/ui/dialog';
export {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerOverlay,
	DrawerPortal,
	DrawerTitle,
	DrawerTrigger,
	type DrawerContentProps,
	type DrawerDirection,
	type DrawerProps
} from './components/ui/drawer';
export {
	DropdownMenu,
	DropdownMenuCheckboxGroup,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuGroupHeading,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuPortal,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger
} from './components/ui/dropdown-menu';
export { Fps, fpsVariants } from './components/ui/fps';
export { Input } from './components/ui/input';
export { Kbd, KbdGroup } from './components/ui/kbd';
export { Label } from './components/ui/label';
export { Checkbox } from './components/ui/checkbox';
export {
	Popover,
	PopoverAnchor,
	PopoverClose,
	PopoverContent,
	PopoverTrigger
} from './components/ui/popover';
export { Separator } from './components/ui/separator';
export {
	Select,
	SelectContent,
	SelectGroup,
	SelectGroupHeading,
	SelectItem,
	SelectLabel,
	SelectScrollDownButton,
	SelectScrollUpButton,
	SelectSeparator,
	SelectTrigger,
	SelectValue
} from './components/ui/select';
export {
	Sheet,
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
	SheetTrigger
} from './components/ui/sheet';
export { Slider } from './components/ui/slider';
export {
	Sortable,
	SortableContent,
	SortableItem,
	SortableItemHandle,
	SortableOverlay,
	type SortableItemData,
	type SortableOrientation,
	type SortableValue
} from './components/ui/sortable';
export { Skeleton } from './components/ui/skeleton';
export { Toaster } from './components/ui/sonner';
export { Textarea } from './components/ui/textarea';
export { Toggle, toggleVariants } from './components/ui/toggle';
export { ToggleGroup, ToggleGroupItem } from './components/ui/toggle-group';
export { Tooltip, TooltipContent, TooltipPortal, TooltipProvider, TooltipTrigger } from './components/ui/tooltip';
export {
	Table,
	TableHeader,
	TableBody,
	TableFooter,
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
export type { EmptyProps, Prettify, QueryBuilderOpts, SearchParams } from './types';
export type {
	CellSelectOption,
	FileCellData,
	CellOpts,
	Option,
	CellPosition,
	CellRange,
	SelectionState,
	RowHeightValue,
	DataGridSelectHitboxSize,
	ContextMenuState,
	PasteDialogState,
	SearchMatch,
	SearchStateData,
	SearchState,
	FilterValue,
	CellUpdate,
	UpdateCell,
	NavigationDirection,
	DataGridProps,
	DataGridCellProps,
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
	ExtendedColumnSort,
	DataTableRowAction
} from './types/data-table';

export {
	TEXT_OPERATORS,
	NUMBER_OPERATORS,
	DATE_OPERATORS,
	SELECT_OPERATORS,
	MULTI_SELECT_OPERATORS,
	BOOLEAN_OPERATORS,
	getFilterOperators,
	getDefaultFilterOperator,
	getValidFilters
} from './types/data-table';

// ==============================================
// Config
// ==============================================
export {
	DEFAULT_ROW_HEIGHT,
	OVERSCAN,
	VIEWPORT_OFFSET,
	SCROLL_SYNC_RETRY_COUNT,
	HORIZONTAL_PAGE_SIZE,
	SEARCH_SHORTCUT_KEY,
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
	DATA_TABLE_MULTI_SELECT_OPERATORS,
	DATA_TABLE_BOOLEAN_OPERATORS,
	DATA_TABLE_SORT_ORDERS,
	DEFAULT_DATA_TABLE_QUERY_KEYS,
	DATA_TABLE_DEFAULTS,
	dataTableConfig
} from './config/data-table';
export type { DataTableConfig } from './config/data-table';

// ==============================================
// Hooks
// ==============================================
export { useWindowSize } from './hooks/use-window-size.svelte.js';
export { useAsRef, type AsRef } from './hooks/use-as-ref.svelte.js';
export { useLazyRef, type LazyRef } from './hooks/use-lazy-ref';
export { useMounted, type MountedState } from './hooks/use-mounted.svelte.js';
export { useMediaQuery, type MediaQueryState } from './hooks/use-media-query.svelte.js';
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
