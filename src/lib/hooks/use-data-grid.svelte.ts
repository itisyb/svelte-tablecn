/**
 * useDataGrid - Svelte 5 data grid hook using TanStack Table
 *
 * This hook manages all data grid state including:
 * - Cell focus and editing
 * - Cell selection (single, multi, range)
 * - Keyboard navigation
 * - Copy/paste functionality
 * - Search
 * - Context menus
 * - Row virtualization
 *
 * ## Reactivity Pattern
 *
 * TanStack Table's `@tanstack/table-core` is framework-agnostic and doesn't have
 * built-in Svelte reactivity. To make it reactive, we use `createSubscriber` from
 * `svelte/reactivity`:
 *
 * 1. `subscribeToTable()` - Called in table method getters to register effects as subscribers
 * 2. `notifyTableUpdate()` - Called after `table.setOptions()` to trigger re-renders
 *
 * This pattern is essential for async data sources (like database queries) where
 * data arrives after the initial render. Without it, `$derived(table.getRowModel().rows)`
 * would not update when data loads.
 *
 * @see https://svelte.dev/docs/svelte/svelte-reactivity#createSubscriber
 */

import { untrack } from 'svelte';
import { on } from 'svelte/events';
import { SvelteSet, SvelteMap, createSubscriber } from 'svelte/reactivity';
import {
	createTable,
	getCoreRowModel,
	getSortedRowModel,
	getFilteredRowModel,
	type ColumnDef,
	type RowData,
	type TableOptions,
	type TableOptionsResolved,
	type Table,
	type TableMeta,
	type SortingState,
	type ColumnFiltersState,
	type RowSelectionState,
	type TableState,
	type ColumnPinningState,
	type VisibilityState,
	type ColumnSizingState,
	type ColumnSizingInfoState,
	type Updater
} from '@tanstack/table-core';
import * as virtualCore from '@tanstack/virtual-core';
import type { Virtualizer, VirtualItem } from '@tanstack/virtual-core';
import type {
	CellPosition,
	CellRange,
	SelectionState,
	ContextMenuState,
	PasteDialogState,
	RowHeightValue,
	NavigationDirection,
	UpdateCell,
	SearchState,
	FileCellData,
	Direction
} from '$lib/types/data-grid.js';
import {
	getCellKey,
	getCellValueKey,
	parseCellKey,
	getRowHeightValue
} from '$lib/types/data-grid.js';
import {
	getEmptyCellValue,
	getIsInPopover,
	getRowIndicesForDeletion,
	getScrollDirection,
	parsePastedCellValue,
	parseTsv,
	scrollCellIntoView,
	serializeCellsToTsv as serializeCellsToTsvData
} from '$lib/data-grid.js';
import { toast } from 'svelte-sonner';
import {
	DEFAULT_COLUMN_SIZE,
	HORIZONTAL_PAGE_SIZE,
	MAX_COLUMN_SIZE,
	MIN_COLUMN_SIZE,
	SCROLL_SYNC_RETRY_COUNT,
	VIEWPORT_OFFSET
} from '$lib/config/data-grid.js';

// ============================================
// Types
// ============================================

export interface UseDataGridOptions<TData extends RowData> {
	columns: ColumnDef<TData, unknown>[];
	/** Pass data as a getter function for reactivity: () => data */
	data: TData[] | (() => TData[]);
	rowHeight?: RowHeightValue;
	autoFocus?: boolean | { rowIndex?: number; columnId?: string };
	enableColumnSelection?: boolean;
	enableSingleCellSelection?: boolean;
	enableSearch?: boolean;
	enablePaste?: boolean;
	readOnly?: boolean;
	overscan?: number;
	dir?: Direction | (() => Direction);
	getRowId?: (row: TData, index: number) => string;
	initialState?: {
		sorting?: SortingState;
		columnFilters?: ColumnFiltersState;
		columnVisibility?: VisibilityState;
		columnPinning?: ColumnPinningState;
		columnSizing?: ColumnSizingState;
		rowSelection?: RowSelectionState;
	};
	onDataChange?: (data: TData[]) => void;
	onSortingChange?: (sorting: SortingState) => void;
	onColumnFiltersChange?: (columnFilters: ColumnFiltersState) => void;
	onRowSelectionChange?: (rowSelection: RowSelectionState) => void;
	onRowAdd?: (
		event?: MouseEvent
	) => Partial<CellPosition> | null | void | Promise<Partial<CellPosition> | null | void>;
	onRowsAdd?: (count: number) => void | Promise<void>;
	onRowsDelete?: (rows: TData[], rowIndices: number[]) => void | Promise<void>;
	onRowHeightChange?: (value: RowHeightValue) => void;
	onPaste?: (updates: UpdateCell[]) => void | Promise<void>;
	onFilesUpload?: (params: {
		files: File[];
		rowIndex: number;
		columnId: string;
		row: TData;
	}) => Promise<FileCellData[]>;
	onFilesDelete?: (params: {
		fileIds: string[];
		rowIndex: number;
		columnId: string;
		row: TData;
	}) => void | Promise<void>;
}

export interface UseDataGridReturn<TData extends RowData> {
	// Refs
	dataGridRef: HTMLDivElement | null;
	headerRef: HTMLDivElement | null;
	rowMapRef: Map<number, HTMLDivElement>;
	footerRef: HTMLDivElement | null;

	// Table instance
	table: Table<TData>;
	tableMeta: TableMeta<TData>;

	// Virtualizer
	rowVirtualizer: VirtualizerReturn;
	virtualTotalSize: number;
	virtualItems: VirtualItem[];
	measureElement: (element: Element | null) => void;

	// Columns
	columns: ColumnDef<TData, unknown>[];

	// Selection state - exposed as getters for use in $derived
	selectedCellsSet: SvelteSet<string>;
	selectionState: { readonly version: number };
	getSelectionVersion: () => number;

	// Row selection state - reactive for header checkbox
	getRowSelection: () => RowSelectionState;

	// Search state (if enabled)
	searchState?: SearchState;
	searchMatchesByRow: Map<number, Set<string>> | null;
	activeSearchMatch: CellPosition | null;

	// Column size CSS variables
	columnSizeVars: Record<string, number>;

	// Cell state
	cellSelectionMap: Map<number, Set<string>> | null;
	focusedCell: CellPosition | null;
	editingCell: CellPosition | null;
	rowHeight: RowHeightValue;
	contextMenu: ContextMenuState;
	pasteDialog: PasteDialogState;

	// Text direction (ltr | rtl)
	dir: Direction;

	// Row add handler
	onRowAdd?: (event?: MouseEvent) => Promise<void>;

	// Virtual row layout mode
	adjustLayout: boolean;

	// Setters for refs (for bind:this)
	setDataGridRef: (el: HTMLDivElement | null) => void;
	setHeaderRef: (el: HTMLDivElement | null) => void;
	setFooterRef: (el: HTMLDivElement | null) => void;
}

// VirtualizerReturn interface for the virtualizer object we expose
interface VirtualizerReturn {
	readonly virtualItems: VirtualItem[];
	readonly totalSize: number;
	readonly isScrolling: boolean;
	scrollToIndex: (index: number, options?: { align?: 'start' | 'center' | 'end' | 'auto' }) => void;
	measureElement: (element: Element | null) => void;
	getVirtualItems: () => VirtualItem[];
	getTotalSize: () => number;
}

// ============================================
// Non-navigable columns (skip during keyboard nav)
// ============================================

const NON_NAVIGABLE_COLUMNS = new Set(['select', 'actions']);

function isSortingStateEqual(left: SortingState, right: SortingState): boolean {
	if (left.length !== right.length) return false;
	for (let i = 0; i < left.length; i++) {
		const a = left[i];
		const b = right[i];
		if (a?.id !== b?.id || a?.desc !== b?.desc) return false;
	}
	return true;
}
function isColumnFiltersStateEqual(a: ColumnFiltersState, b: ColumnFiltersState): boolean {
	if (a.length !== b.length) return false;
	for (let i = 0; i < a.length; i++) {
		if (a[i]?.id !== b[i]?.id || !Object.is(a[i]?.value, b[i]?.value)) return false;
	}
	return true;
}
function isVisibilityStateEqual(a: VisibilityState, b: VisibilityState): boolean {
	const keys = Object.keys(a);
	if (keys.length !== Object.keys(b).length) return false;
	for (const k of keys) if (a[k] !== b[k]) return false;
	return true;
}

// ============================================
// Main Hook
// ============================================

export function useDataGrid<TData extends RowData>(
	options: UseDataGridOptions<TData>
): UseDataGridReturn<TData> {
	const {
		columns,
		data: dataProp,
		rowHeight: initialRowHeight = 'short',
		autoFocus = false,
		enableColumnSelection = false,
		enableSingleCellSelection = false,
		enableSearch = false,
		enablePaste = false,
		readOnly,
		overscan = 3,
		dir: dirProp = 'ltr',
		getRowId,
		initialState,
		onDataChange,
		onSortingChange: onSortingChangeProp,
		onColumnFiltersChange: onColumnFiltersChangeProp,
		onRowSelectionChange: onRowSelectionChangeProp,
		onRowAdd: onRowAddProp,
		onRowsAdd,
		onRowsDelete: onRowsDeleteProp,
		onRowHeightChange: onRowHeightChangeProp,
		onPaste,
		onFilesUpload,
		onFilesDelete
	} = options;

	function getDir(): Direction {
		return typeof dirProp === 'function' ? dirProp() : dirProp;
	}

	// Support both direct data array and getter function for reactivity
	// Using a getter function () => data allows Svelte 5 to track changes
	const getData = typeof dataProp === 'function' ? dataProp : () => dataProp;

	// SvelteMap for CELL-LEVEL fine-grained reactivity
	// Key is "rowIndex:columnId", value is the cell value
	// Only the specific cell that changed will re-render
	const cellValueMap = new SvelteMap<string, unknown>();

	// Expose the map directly so cells can access it in $derived for proper reactivity
	// When a cell calls cellValueMap.get(key) inside $derived, Svelte tracks that specific key
	function getCellValueMap(): SvelteMap<string, unknown> {
		return cellValueMap;
	}

	// Helper to set cell value with fine-grained reactivity
	function setCellValue(rowId: string, columnId: string, value: unknown): void {
		cellValueMap.set(getCellValueKey(rowId, columnId), value);
	}

	// Helper to clear cell value cache (called when table state changes)
	function clearCellValueCache(): void {
		cellValueMap.clear();
	}

	// ========================================
	// Reactive State using Svelte 5 runes
	// ========================================

	// Refs
	let dataGridRef = $state<HTMLDivElement | null>(null);
	let headerRef = $state<HTMLDivElement | null>(null);
	let footerRef = $state<HTMLDivElement | null>(null);
	let rowMapRef = new Map<number, HTMLDivElement>();
	let cellMapRef = new Map<string, HTMLDivElement>();

	// Table state - use initialState if provided
	let sorting = $state<SortingState>(initialState?.sorting ?? []);
	let columnFilters = $state<ColumnFiltersState>(initialState?.columnFilters ?? []);
	let rowSelection = $state<RowSelectionState>(initialState?.rowSelection ?? {});
	let columnPinning = $state<ColumnPinningState>(initialState?.columnPinning ?? {});
	let columnVisibility = $state<VisibilityState>(initialState?.columnVisibility ?? {});
	let columnSizing = $state<ColumnSizingState>(initialState?.columnSizing ?? {});
	let columnSizingInfo = $state<ColumnSizingInfoState>({
		startOffset: null,
		startSize: null,
		deltaOffset: null,
		deltaPercentage: null,
		isResizingColumn: false,
		columnSizingStart: []
	});
	let rowHeight = $state<RowHeightValue>(initialRowHeight);

	// Cell state
	let focusedCell = $state<CellPosition | null>(null);
	let editingCell = $state<CellPosition | null>(null);
	let lastClickedCell = $state<CellPosition | null>(null);
	let selectionState = $state<SelectionState>({
		selectedCells: new Set(),
		selectionRange: null,
		isSelecting: false
	});
	let cutCells = $state<Set<string>>(new Set());

	// SvelteSet for fine-grained reactivity on cell selection
	// Cells can call selectedCellsSet.has(key) in $derived for proper Svelte tracking
	const selectedCellsSet = new SvelteSet<string>();
	// Version counter to force cell re-renders when selection changes
	// Cells read this in $derived to create a reactive dependency
	let selectionVersion = $state(0);

	// Track the anchor cell for shift+arrow range selection
	let selectionAnchor = $state<CellPosition | null>(null);

	// Context menu state
	let contextMenu = $state<ContextMenuState>({
		open: false,
		x: 0,
		y: 0
	});

	// Paste dialog state
	let pasteDialog = $state<PasteDialogState>({
		open: false,
		rowsNeeded: 0,
		clipboardText: ''
	});

	// Search state
	let searchOpen = $state(false);
	let searchQuery = $state('');
	let searchMatches = $state<CellPosition[]>([]);
	let matchIndex = $state(-1);

	// SvelteSet for O(1) reactive search match lookups
	let searchMatchSet = new SvelteSet<string>();

	// Helper to sync SvelteSet with regular Set for selection
	function syncSelectedCellsSet(newCells: Set<string>) {
		selectedCellsSet.clear();
		for (const key of newCells) {
			selectedCellsSet.add(key);
		}
		// Increment version to trigger re-renders in cells
		selectionVersion++;
	}

	/** Re-key selection to row-model positions (0..n-1) after filter/sort; drops hidden rows. */
	function syncSelectionToRowModel() {
		const rows = table.getRowModel().rows;
		if (!rows.length) {
			if (selectionState.selectedCells.size > 0) {
				onSelectionClear();
			}
			return;
		}

		const visibleIds = new Set(rows.map((r) => r.id));
		const prunedRowSelection: RowSelectionState = {};
		for (const [rowId, selected] of Object.entries(rowSelection)) {
			if (selected && visibleIds.has(rowId)) {
				prunedRowSelection[rowId] = true;
			}
		}
		if (Object.keys(prunedRowSelection).length !== Object.keys(rowSelection).length) {
			rowSelection = prunedRowSelection;
		}

		const newSelected = new Set<string>();
		for (const key of selectionState.selectedCells) {
			const { rowIndex, columnId } = parseCellKey(key);
			const row = rows[rowIndex] ?? rows.find((r) => r.index === rowIndex);
			if (!row || !visibleIds.has(row.id)) continue;
			const pos = rows.findIndex((r) => r.id === row.id);
			if (pos !== -1) {
				newSelected.add(getCellKey(pos, columnId));
			}
		}

		if (
			newSelected.size !== selectionState.selectedCells.size ||
			[...newSelected].some((k) => !selectionState.selectedCells.has(k))
		) {
			syncSelectedCellsSet(newSelected);
			selectionState = {
				...selectionState,
				selectedCells: newSelected
			};
		}
	}

	// Track last clicked row for shift-click selection
	let lastClickedRowId = $state<string | null>(null);

	// Prevent focusout handler from stealing focus during scroll/focus operations
	let focusGuard = false;

	// Cache visual row index (1-based) by row id for O(1) lookups
	let visualRowIndexCache: {
		rows: ReturnType<Table<TData>['getRowModel']>['rows'];
		map: Map<string, number>;
	} | null = null;

	// Virtualizer state
	let virtualItems = $state<VirtualItem[]>([]);
	let totalSize = $state(0);
	let isScrolling = $state(false);
	const adjustLayout = $derived.by(() => {
		const isFirefox =
			typeof navigator !== 'undefined' && navigator.userAgent.indexOf('Firefox') !== -1;
		return (
			isFirefox && ((columnPinning.left?.length ?? 0) > 0 || (columnPinning.right?.length ?? 0) > 0)
		);
	});

	// ========================================
	// Derived values (declared later after table is created)
	// ========================================

	// ========================================
	// Helper Functions
	// ========================================

	function getNavigableColumns() {
		return table
			.getAllColumns()
			.filter((col) => col.getIsVisible() && !NON_NAVIGABLE_COLUMNS.has(col.id));
	}

	function getFirstNavigableColumnId(): string | null {
		const cols = getNavigableColumns();
		return cols[0]?.id ?? null;
	}

	function getLastNavigableColumnId(): string | null {
		const cols = getNavigableColumns();
		return cols[cols.length - 1]?.id ?? null;
	}

	function getNavigableColumnIds(): string[] {
		return getNavigableColumns().map((col) => col.id);
	}

	function scrollFocusedCellIntoView(
		rowIndex: number,
		columnId: string,
		direction?: NavigationDirection
	) {
		const container = dataGridRef;
		const targetCell = cellMapRef.get(getCellKey(rowIndex, columnId));
		if (container && targetCell) {
			scrollCellIntoView({
				container,
				targetCell,
				table,
				viewportOffset: VIEWPORT_OFFSET,
				direction: direction ? getScrollDirection(direction) : undefined,
				isRtl: getDir() === 'rtl'
			});
		}
	}

	function getNextNavigableColumnId(
		currentColumnId: string,
		direction: 'left' | 'right'
	): string | null {
		const cols = getNavigableColumns();
		const currentIndex = cols.findIndex((col) => col.id === currentColumnId);
		if (currentIndex === -1) return null;

		const step = direction === 'right' ? 1 : -1;
		const nextIndex = getDir() === 'rtl' ? currentIndex - step : currentIndex + step;
		return cols[nextIndex]?.id ?? null;
	}

	function getIsCellSelected(rowIndex: number, columnId: string): boolean {
		return selectionState.selectedCells.has(getCellKey(rowIndex, columnId));
	}

	function getIsSearchMatch(rowIndex: number, columnId: string): boolean {
		// O(1) lookup using the derived Set instead of O(n) .some()
		return searchMatchSet.has(getCellKey(rowIndex, columnId));
	}

	function getIsActiveSearchMatch(rowIndex: number, columnId: string): boolean {
		const activeMatch = searchMatches[matchIndex];
		return activeMatch?.rowIndex === rowIndex && activeMatch?.columnId === columnId;
	}

	function getSearchMatchesByRow(): Map<number, Set<string>> | null {
		if (searchMatches.length === 0) return null;

		const matchesByRow = new Map<number, Set<string>>();
		for (const match of searchMatches) {
			let columnSet = matchesByRow.get(match.rowIndex);
			if (!columnSet) {
				columnSet = new Set<string>();
				matchesByRow.set(match.rowIndex, columnSet);
			}
			columnSet.add(match.columnId);
		}

		return matchesByRow;
	}

	function getCellSelectionMap(): Map<number, Set<string>> | null {
		if (selectionState.selectedCells.size === 0) return null;

		const selectedByRow = new Map<number, Set<string>>();
		for (const cellKey of selectionState.selectedCells) {
			const { rowIndex, columnId } = parseCellKey(cellKey);
			let columnSet = selectedByRow.get(rowIndex);
			if (!columnSet) {
				columnSet = new Set<string>();
				selectedByRow.set(rowIndex, columnSet);
			}
			columnSet.add(columnId);
		}

		return selectedByRow;
	}

	function getVisualRowIndex(rowId: string): number | undefined {
		const rows = table.getRowModel().rows;
		if (!rows.length) return undefined;

		if (visualRowIndexCache?.rows !== rows) {
			const map = new Map<string, number>();
			for (const [i, row] of rows.entries()) {
				map.set(row.id, i + 1);
			}
			visualRowIndexCache = { rows, map };
		}

		return visualRowIndexCache.map.get(rowId);
	}

	function releaseFocusGuard(immediate = false) {
		if (immediate) {
			focusGuard = false;
			return;
		}

		setTimeout(() => {
			focusGuard = false;
		}, 300);
	}

	// ========================================
	// Cell Focus & Navigation
	// ========================================

	function focusCell(rowIndex: number, columnId: string, opts?: { keepAnchor?: boolean }) {
		focusGuard = true;
		focusedCell = { rowIndex, columnId };

		const cellKey = getCellKey(rowIndex, columnId);

		// Clear selection when focusing new cell (unless holding shift or explicitly keeping anchor)
		if (!selectionState.isSelecting && !opts?.keepAnchor) {
			const newCells = new Set([cellKey]);
			syncSelectedCellsSet(newCells);
			selectionState = {
				selectedCells: newCells,
				selectionRange: null,
				isSelecting: false
			};
			// Set anchor to the newly focused cell
			selectionAnchor = { rowIndex, columnId };
		}

		// Scroll to row if needed (for virtualization)
		if (virtualizer) {
			virtualizer.scrollToIndex(rowIndex, { align: 'auto' });
		}

		// Focus the cell element - use multiple attempts to handle virtualization
		const attemptFocus = (attempts = 0) => {
			const cellElement = cellMapRef.get(cellKey);
			if (cellElement) {
				cellElement.scrollIntoView({ block: 'nearest', inline: 'nearest' });
				scrollFocusedCellIntoView(rowIndex, columnId);
				cellElement.focus();
				releaseFocusGuard();
			} else if (attempts < 3) {
				// Retry if cell not in DOM yet (virtualization)
				requestAnimationFrame(() => attemptFocus(attempts + 1));
			} else {
				dataGridRef?.focus();
				releaseFocusGuard();
			}
		};

		// Start first attempt immediately, then use RAF for subsequent attempts
		requestAnimationFrame(() => attemptFocus());
	}

	function blurCell() {
		focusedCell = null;
		editingCell = null;
		lastClickedCell = null;

		const active = document.activeElement;
		if (dataGridRef && active instanceof HTMLElement && dataGridRef.contains(active)) {
			active.blur();
		}
	}

	function navigateCell(direction: NavigationDirection) {
		if (!focusedCell) return;

		const navigableColumnIds = getNavigableColumnIds();
		const rows = table.getRowModel().rows;
		const rowCount = rows.length;
		const { rowIndex, columnId } = focusedCell;
		const currentColIndex = navigableColumnIds.indexOf(columnId);

		let newRowIndex = rowIndex;
		let newColumnId = columnId;
		const isRtl = getDir() === 'rtl';

		switch (direction) {
			case 'up':
				newRowIndex = Math.max(0, rowIndex - 1);
				break;
			case 'down':
				newRowIndex = Math.min(rowCount - 1, rowIndex + 1);
				break;
			case 'left': {
				const prevCol = getNextNavigableColumnId(columnId, 'left');
				if (prevCol) {
					newColumnId = prevCol;
				}
				break;
			}
			case 'right': {
				const nextCol = getNextNavigableColumnId(columnId, 'right');
				if (nextCol) {
					newColumnId = nextCol;
				}
				break;
			}
			case 'home':
				newColumnId = navigableColumnIds[0] ?? columnId;
				break;
			case 'end':
				newColumnId = navigableColumnIds[navigableColumnIds.length - 1] ?? columnId;
				break;
			case 'ctrl+home':
				newRowIndex = 0;
				newColumnId = navigableColumnIds[0] ?? columnId;
				break;
			case 'ctrl+end':
				newRowIndex = Math.max(0, rowCount - 1);
				newColumnId = navigableColumnIds[navigableColumnIds.length - 1] ?? columnId;
				break;
			case 'ctrl+up':
				newRowIndex = 0;
				break;
			case 'ctrl+down':
				newRowIndex = Math.max(0, rowCount - 1);
				break;
			case 'pageup': {
				const pageSize = virtualizer?.getVirtualItems().length ?? 10;
				newRowIndex = Math.max(0, rowIndex - pageSize);
				break;
			}
			case 'pagedown': {
				const pageSize = virtualizer?.getVirtualItems().length ?? 10;
				newRowIndex = Math.min(rowCount - 1, rowIndex + pageSize);
				break;
			}
			case 'pageleft':
				if (isRtl) {
					if (currentColIndex < navigableColumnIds.length - 1) {
						const targetIndex = Math.min(
							navigableColumnIds.length - 1,
							currentColIndex + HORIZONTAL_PAGE_SIZE
						);
						newColumnId = navigableColumnIds[targetIndex] ?? columnId;
					}
				} else if (currentColIndex > 0) {
					const targetIndex = Math.max(0, currentColIndex - HORIZONTAL_PAGE_SIZE);
					newColumnId = navigableColumnIds[targetIndex] ?? columnId;
				}
				break;
			case 'pageright':
				if (isRtl) {
					if (currentColIndex > 0) {
						const targetIndex = Math.max(0, currentColIndex - HORIZONTAL_PAGE_SIZE);
						newColumnId = navigableColumnIds[targetIndex] ?? columnId;
					}
				} else if (currentColIndex < navigableColumnIds.length - 1) {
					const targetIndex = Math.min(
						navigableColumnIds.length - 1,
						currentColIndex + HORIZONTAL_PAGE_SIZE
					);
					newColumnId = navigableColumnIds[targetIndex] ?? columnId;
				}
				break;
		}

		if (newRowIndex !== rowIndex || newColumnId !== columnId) {
			focusCell(newRowIndex, newColumnId);

			const container = dataGridRef;
			if (!container) return;

			const targetRow = rowMapRef.get(newRowIndex);
			const cellKey = getCellKey(newRowIndex, newColumnId);
			const targetCell = cellMapRef.get(cellKey);

			if (!targetRow) {
				if (virtualizer) {
					const align =
						direction === 'up' ||
						direction === 'pageup' ||
						direction === 'ctrl+up' ||
						direction === 'ctrl+home'
							? 'start'
							: direction === 'down' ||
								  direction === 'pagedown' ||
								  direction === 'ctrl+down' ||
								  direction === 'ctrl+end'
								? 'end'
								: 'center';

					virtualizer.scrollToIndex(newRowIndex, { align });

					if (newColumnId !== columnId) {
						requestAnimationFrame(() => {
							scrollFocusedCellIntoView(newRowIndex, newColumnId, direction);
						});
					}
				}
				return;
			}

			if (newRowIndex !== rowIndex && targetRow) {
				requestAnimationFrame(() => {
					const containerRect = container.getBoundingClientRect();
					const headerHeight = headerRef?.getBoundingClientRect().height ?? 0;
					const viewportTop = containerRect.top + headerHeight + VIEWPORT_OFFSET;
					const viewportBottom = containerRect.bottom - VIEWPORT_OFFSET;

					const rowRect = targetRow.getBoundingClientRect();
					const isFullyVisible = rowRect.top >= viewportTop && rowRect.bottom <= viewportBottom;

					if (!isFullyVisible) {
						const isVerticalNavigation =
							direction === 'up' ||
							direction === 'down' ||
							direction === 'pageup' ||
							direction === 'pagedown' ||
							direction === 'ctrl+up' ||
							direction === 'ctrl+down' ||
							direction === 'ctrl+home' ||
							direction === 'ctrl+end';

						if (isVerticalNavigation) {
							if (
								direction === 'down' ||
								direction === 'pagedown' ||
								direction === 'ctrl+down' ||
								direction === 'ctrl+end'
							) {
								container.scrollTop += rowRect.bottom - viewportBottom;
							} else {
								container.scrollTop -= viewportTop - rowRect.top;
							}
						}
					}
				});
			}

			if (newColumnId !== columnId && targetCell) {
				requestAnimationFrame(() => {
					scrollFocusedCellIntoView(newRowIndex, newColumnId, direction);
				});
			}
		}
	}

	// ========================================
	// Cell Editing
	// ========================================

	function startEditing(rowIndex: number, columnId: string) {
		if (readOnly) return;
		focusedCell = { rowIndex, columnId };
		editingCell = { rowIndex, columnId };
	}

	function stopEditing(opts?: { direction?: NavigationDirection; moveToNextRow?: boolean }) {
		const currentEditing = editingCell;
		editingCell = null;

		if (!currentEditing) return;

		const { rowIndex, columnId } = currentEditing;

		if (opts?.moveToNextRow) {
			const nextRowIndex = rowIndex + 1;
			if (nextRowIndex < table.getRowModel().rows.length) {
				requestAnimationFrame(() => {
					focusCell(nextRowIndex, columnId);
				});
			}
		} else if (opts?.direction) {
			focusedCell = { rowIndex, columnId };
			requestAnimationFrame(() => {
				navigateCell(opts.direction ?? 'right');
			});
		} else {
			focusedCell = { rowIndex, columnId };
			scrollAndFocusCell(rowIndex, columnId);
		}
	}

	// ========================================
	// Cell Selection
	// ========================================

	function selectCell(rowIndex: number, columnId: string, event?: MouseEvent) {
		if (event?.button === 2) return;

		const cellKey = getCellKey(rowIndex, columnId);

		if (event?.ctrlKey || event?.metaKey) {
			// Toggle selection
			const newSelected = new Set(selectionState.selectedCells);
			if (newSelected.has(cellKey)) {
				newSelected.delete(cellKey);
			} else {
				newSelected.add(cellKey);
			}
			syncSelectedCellsSet(newSelected);
			selectionState = {
				...selectionState,
				selectedCells: newSelected
			};
		} else if (event?.shiftKey && focusedCell) {
			// Range selection
			selectRange(focusedCell, { rowIndex, columnId });
		} else {
			// Single selection
			const newCells = new Set([cellKey]);
			syncSelectedCellsSet(newCells);
			selectionState = {
				selectedCells: newCells,
				selectionRange: null,
				isSelecting: false
			};
		}

		focusCell(rowIndex, columnId);
	}

	function onCellClick(rowIndex: number, columnId: string, event?: MouseEvent) {
		if (event?.button === 2) return;

		if (event?.ctrlKey || event?.metaKey) {
			event.preventDefault();
			lastClickedCell = { rowIndex, columnId };
			const cellKey = getCellKey(rowIndex, columnId);
			const newSelected = new Set(selectionState.selectedCells);

			if (newSelected.has(cellKey)) {
				newSelected.delete(cellKey);
			} else {
				newSelected.add(cellKey);
			}

			syncSelectedCellsSet(newSelected);
			selectionState = {
				selectedCells: newSelected,
				selectionRange: null,
				isSelecting: false
			};
			focusCell(rowIndex, columnId, { keepAnchor: true });
			return;
		}

		if (event?.shiftKey && focusedCell) {
			event.preventDefault();
			lastClickedCell = { rowIndex, columnId };
			selectRange(focusedCell, { rowIndex, columnId });
			scrollAndFocusCell(rowIndex, columnId);
			return;
		}

		if (selectionState.selectedCells.size > 0 && !selectionState.isSelecting) {
			const cellKey = getCellKey(rowIndex, columnId);
			const isClickingSelectedCell = selectionState.selectedCells.has(cellKey);

			if (!isClickingSelectedCell) {
				onSelectionClear();
			} else {
				lastClickedCell = { rowIndex, columnId };
				focusCell(rowIndex, columnId, { keepAnchor: true });
				scrollAndFocusCell(rowIndex, columnId);
				return;
			}
		} else if (Object.keys(rowSelection).length > 0 && columnId !== 'select') {
			onSelectionClear();
		}

		if (
			(focusedCell?.rowIndex === rowIndex && focusedCell.columnId === columnId) ||
			(lastClickedCell?.rowIndex === rowIndex && lastClickedCell.columnId === columnId)
		) {
			lastClickedCell = { rowIndex, columnId };
			startEditing(rowIndex, columnId);
			return;
		}

		lastClickedCell = { rowIndex, columnId };
		focusCell(rowIndex, columnId, { keepAnchor: true });
		scrollAndFocusCell(rowIndex, columnId);
	}

	function selectRange(start: CellPosition, end: CellPosition, keepSelecting = false) {
		const cols = getNavigableColumns();
		const startColIndex = cols.findIndex((c) => c.id === start.columnId);
		const endColIndex = cols.findIndex((c) => c.id === end.columnId);

		const minRow = Math.min(start.rowIndex, end.rowIndex);
		const maxRow = Math.max(start.rowIndex, end.rowIndex);
		const minCol = Math.min(startColIndex, endColIndex);
		const maxCol = Math.max(startColIndex, endColIndex);

		const newSelected = new Set<string>();
		for (let row = minRow; row <= maxRow; row++) {
			for (let col = minCol; col <= maxCol; col++) {
				const colId = cols[col]?.id;
				if (colId) {
					newSelected.add(getCellKey(row, colId));
				}
			}
		}

		syncSelectedCellsSet(newSelected);
		selectionState = {
			selectedCells: newSelected,
			selectionRange: { start, end },
			isSelecting: keepSelecting ? selectionState.isSelecting : false
		};
	}

	function selectAll() {
		const rows = table.getRowModel().rows;
		const cols = getNavigableColumns();
		const newSelected = new Set<string>();

		for (let row = 0; row < rows.length; row++) {
			for (const col of cols) {
				newSelected.add(getCellKey(row, col.id));
			}
		}

		syncSelectedCellsSet(newSelected);
		selectionState = {
			selectedCells: newSelected,
			selectionRange: null,
			isSelecting: false
		};
	}

	function clearSelection() {
		const newCells = new Set<string>();
		syncSelectedCellsSet(newCells);
		selectionState = {
			selectedCells: newCells,
			selectionRange: null,
			isSelecting: false
		};
		blurCell();
	}

	function clearCellSelection() {
		const newCells = new Set<string>();
		syncSelectedCellsSet(newCells);
		selectionState = {
			selectedCells: newCells,
			selectionRange: null,
			isSelecting: false
		};
	}

	function onSelectionClear() {
		clearCellSelection();
		rowSelection = {};
	}

	function selectColumn(columnId: string) {
		const rows = table.getRowModel().rows;
		const rowCount = rows.length;
		if (rowCount === 0) return;

		const selectedCells = new Set<string>();
		for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
			selectedCells.add(getCellKey(rowIndex, columnId));
		}

		syncSelectedCellsSet(selectedCells);
		selectionState = {
			selectedCells,
			selectionRange: {
				start: { rowIndex: 0, columnId },
				end: { rowIndex: rowCount - 1, columnId }
			},
			isSelecting: false
		};
	}

	function onColumnClick(columnId: string) {
		if (!enableColumnSelection) {
			onSelectionClear();
			return;
		}

		selectColumn(columnId);
	}

	function handleRowSelect(rowId: string, selected: boolean, shiftKey: boolean) {
		const rows = table.getRowModel().rows;
		const currentRowIndex = rows.findIndex((r) => r.id === rowId);
		if (currentRowIndex === -1) return;

		let newRowSelection: RowSelectionState;

		if (shiftKey && lastClickedRowId !== null) {
			const lastClickedRowIndex = rows.findIndex((r) => r.id === lastClickedRowId);
			if (lastClickedRowIndex === -1) {
				newRowSelection = {
					...rowSelection,
					[rowId]: selected
				};
			} else {
				const startIndex = Math.min(lastClickedRowIndex, currentRowIndex);
				const endIndex = Math.max(lastClickedRowIndex, currentRowIndex);

				newRowSelection = { ...rowSelection };
				for (let i = startIndex; i <= endIndex; i++) {
					const row = rows[i];
					if (row) {
						newRowSelection[row.id] = selected;
					}
				}
			}
		} else {
			newRowSelection = {
				...rowSelection,
				[rowId]: selected
			};
		}

		const visibleIds = new Set(rows.map((r) => r.id));
		const prunedRowSelection: RowSelectionState = {};
		for (const [id, sel] of Object.entries(newRowSelection)) {
			if (sel && visibleIds.has(id)) {
				prunedRowSelection[id] = true;
			}
		}
		rowSelection = prunedRowSelection;
		onRowSelectionChangeProp?.(prunedRowSelection);

		const selectedRows = Object.keys(prunedRowSelection);
		const newSelectedCells = new Set<string>();
		const allColumnIds = table.getAllColumns().map((col) => col.id);

		for (const selectedRowId of selectedRows) {
			const rowIdx = rows.findIndex((r) => r.id === selectedRowId);
			if (rowIdx === -1) continue;

			for (const columnId of allColumnIds) {
				newSelectedCells.add(getCellKey(rowIdx, columnId));
			}
		}

		syncSelectedCellsSet(newSelectedCells);
		selectionState = {
			selectedCells: newSelectedCells,
			selectionRange: null,
			isSelecting: false
		};

		focusedCell = null;
		editingCell = null;
		lastClickedRowId = rowId;
	}

	// ========================================
	// Mouse Selection (Drag)
	// ========================================

	function onCellMouseDown(rowIndex: number, columnId: string, event: MouseEvent) {
		if (event.button !== 0) return; // Only left click

		// Set selection anchor for drag selection
		const cellKey = getCellKey(rowIndex, columnId);

		if (event.ctrlKey || event.metaKey) {
			// Toggle selection - don't start drag, keep anchor
			const newSelected = new Set(selectionState.selectedCells);
			if (newSelected.has(cellKey)) {
				newSelected.delete(cellKey);
			} else {
				newSelected.add(cellKey);
			}
			syncSelectedCellsSet(newSelected);
			selectionState = {
				...selectionState,
				selectedCells: newSelected,
				isSelecting: false
			};
			// Update focused cell but keep anchor for future shift-clicks
			focusedCell = { rowIndex, columnId };
			scrollAndFocusCell(rowIndex, columnId);
		} else if (event.shiftKey && (selectionAnchor || focusedCell)) {
			// Range selection from anchor (or focused cell if no anchor) to this cell
			const anchor = selectionAnchor || focusedCell!;
			selectRange(anchor, { rowIndex, columnId });
			selectionState = { ...selectionState, isSelecting: false };
			// Update focused cell but keep anchor for future shift-clicks
			focusedCell = { rowIndex, columnId };
			scrollAndFocusCell(rowIndex, columnId);
		} else {
			// Start drag selection - set this cell as anchor
			const newCells = enableSingleCellSelection ? new Set([cellKey]) : new Set<string>();
			syncSelectedCellsSet(newCells);
			selectionState = {
				selectedCells: newCells,
				selectionRange: {
					start: { rowIndex, columnId },
					end: { rowIndex, columnId }
				},
				isSelecting: true
			};
			rowSelection = {};
			selectionAnchor = { rowIndex, columnId };
			focusCell(rowIndex, columnId);
		}
	}

	// Helper to scroll to cell and focus it without changing selection anchor
	function scrollAndFocusCell(rowIndex: number, columnId: string) {
		const cellKey = getCellKey(rowIndex, columnId);

		// Scroll to row if needed (for virtualization)
		if (virtualizer) {
			virtualizer.scrollToIndex(rowIndex, { align: 'auto' });
		}

		// Focus the cell element
		requestAnimationFrame(() => {
			if (editingCell?.rowIndex === rowIndex && editingCell.columnId === columnId) return;

			const cellElement = cellMapRef.get(cellKey);
			if (cellElement) {
				cellElement.scrollIntoView({ block: 'nearest', inline: 'nearest' });
				cellElement.focus();
			}
		});
	}

	function onCellMouseEnter(rowIndex: number, columnId: string, event: MouseEvent) {
		if (!selectionState.isSelecting || !selectionAnchor) return;

		// Extend selection from anchor to current cell, keeping isSelecting true
		selectRange(selectionAnchor, { rowIndex, columnId }, true);
	}

	function onCellMouseUp() {
		selectionState = { ...selectionState, isSelecting: false };
	}

	// ========================================
	// Clipboard Operations
	// ========================================

	function serializeCellsToTsv(): { tsvData: string; selectedCells: string[] } | null {
		return serializeCellsToTsvData({
			selectedCells: selectionState.selectedCells,
			focusedCell,
			rows: table.getRowModel().rows,
			getCellVariant: (columnId) => table.getColumn(columnId)?.columnDef.meta?.cell?.variant,
			nonNavigableColumnIds: NON_NAVIGABLE_COLUMNS
		});
	}

	async function copySelectedCells() {
		const result = serializeCellsToTsv();
		if (!result) return;

		try {
			await navigator.clipboard.writeText(result.tsvData);
			if (cutCells.size > 0) {
				cutCells = new Set();
			}

			const cellCount = result.selectedCells.length;
			toast.success(`${cellCount} cell${cellCount !== 1 ? 's' : ''} copied`);
		} catch (error) {
			toast.error(error instanceof Error ? error.message : 'Failed to copy to clipboard');
		}
	}

	async function cutSelectedCells() {
		if (readOnly) return;

		const result = serializeCellsToTsv();
		if (!result) return;

		try {
			await navigator.clipboard.writeText(result.tsvData);
			cutCells = new Set(result.selectedCells);

			const cellCount = result.selectedCells.length;
			toast.success(`${cellCount} cell${cellCount !== 1 ? 's' : ''} cut`);
		} catch (error) {
			toast.error(error instanceof Error ? error.message : 'Failed to cut to clipboard');
		}
	}

	async function onCellsPaste(expandRows = false) {
		if (readOnly) return;
		if (!focusedCell) return;

		try {
			const text = pasteDialog.clipboardText || (await navigator.clipboard.readText());
			if (!text.trim()) return;

			const rows = table.getRowModel().rows;
			const cols = getNavigableColumns();

			const lines = parseTsv(text, cols.length);

			// Determine paste target
			const startPos = focusedCell;
			const startColIndex = cols.findIndex((c) => c.id === startPos.columnId);
			if (startColIndex === -1) return;

			// Check if we need more rows
			const rowsNeeded = startPos.rowIndex + lines.length - rows.length;

			if (rowsNeeded > 0 && !expandRows && (onRowsAdd || onRowAddProp) && !pasteDialog.clipboardText) {
				pasteDialog = {
					open: true,
					rowsNeeded,
					clipboardText: text
				};
				return;
			}

			if (rowsNeeded > 0 && expandRows) {
				const expectedRowCount = rows.length + rowsNeeded;

				if (onRowsAdd) {
					await onRowsAdd(rowsNeeded);
				} else if (onRowAddProp) {
					for (let i = 0; i < rowsNeeded; i++) {
						await onRowAddProp();
					}
				}

				let attempts = 0;
				const maxAttempts = 50;

				do {
					syncTableFromData();
					if (table.getRowModel().rows.length >= expectedRowCount) break;
					await new Promise((resolve) => setTimeout(resolve, 100));
					attempts++;
				} while (attempts < maxAttempts);
			}

			// Perform paste
			await performPaste(text, startPos, startColIndex);
			pasteDialog = { open: false, rowsNeeded: 0, clipboardText: '' };
		} catch {
			// Clipboard access denied
		}
	}

	async function pasteFromClipboard() {
		await onCellsPaste(false);
	}

	async function performPaste(text: string, startPos: CellPosition, startColIndex: number) {
		const rows = table.getRowModel().rows;
		const cols = getNavigableColumns();
		const lines = parseTsv(text, cols.length);

		const updates: UpdateCell[] = [];
		let cellsSkipped = 0;
		let endRowIndex = startPos.rowIndex;
		let endColIndex = startColIndex;

		for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
			const line = lines[lineIdx];
			if (!line) continue;

			const rowIndex = startPos.rowIndex + lineIdx;
			if (rowIndex >= rows.length) break;

			for (let cellIdx = 0; cellIdx < line.length; cellIdx++) {
				const colIndex = startColIndex + cellIdx;
				const col = cols[colIndex];
				if (!col) break;

				const cellOpts = col.columnDef.meta?.cell;
				const { value, shouldSkip } = parsePastedCellValue(line[cellIdx] || '', cellOpts);
				if (shouldSkip) {
					cellsSkipped++;
					endRowIndex = Math.max(endRowIndex, rowIndex);
					endColIndex = Math.max(endColIndex, colIndex);
					continue;
				}
				updates.push({ rowIndex, columnId: col.id, value });
				endRowIndex = Math.max(endRowIndex, rowIndex);
				endColIndex = Math.max(endColIndex, colIndex);
			}
		}

		if (updates.length > 0) {
			await onPaste?.(updates);

			// Clear cut cells first if we had any (to merge all updates together)
			if (cutCells.size > 0) {
				const tableColumns = table.getAllColumns();
				const columnById = new Map(tableColumns.map((c) => [c.id, c]));

				for (const cellKey of cutCells) {
					const { rowIndex, columnId } = parseCellKey(cellKey);
					const column = columnById.get(columnId);
					const cellVariant = column?.columnDef?.meta?.cell?.variant;
					const emptyValue = getEmptyCellValue(cellVariant);
					updates.push({ rowIndex, columnId, value: emptyValue });
				}
				cutCells = new Set();
			}

			handleDataUpdate(updates);

			if (cellsSkipped > 0) {
				toast.success(
					`${updates.length} cell${updates.length !== 1 ? 's' : ''} pasted, ${cellsSkipped} skipped`
				);
			} else {
				toast.success(`${updates.length} cell${updates.length !== 1 ? 's' : ''} pasted`);
			}

			const endColumnId = cols[endColIndex]?.id;
			if (endColumnId) {
				selectRange(startPos, { rowIndex: endRowIndex, columnId: endColumnId });
			}

			requestAnimationFrame(() => {
				dataGridRef?.focus();
			});
		} else if (cellsSkipped > 0) {
			toast.error(
				`${cellsSkipped} cell${cellsSkipped !== 1 ? 's' : ''} skipped pasting for invalid data`
			);
		}
	}

	// ========================================
	// Delete/Clear Operations
	// ========================================

	function clearSelectedCells() {
		if (readOnly) return;

		let cellsToClear: Set<string>;
		if (selectionState.selectedCells.size > 0) {
			cellsToClear = selectionState.selectedCells;
		} else if (focusedCell) {
			cellsToClear = new Set([getCellKey(focusedCell.rowIndex, focusedCell.columnId)]);
		} else {
			cellsToClear = new Set();
		}

		if (cellsToClear.size === 0) return;

		const tableColumns = table.getAllColumns();
		const columnById = new Map(tableColumns.map((c) => [c.id, c]));
		const updates: UpdateCell[] = [];

		for (const cellKey of cellsToClear) {
			const { rowIndex, columnId } = parseCellKey(cellKey);
			const column = columnById.get(columnId);
			const cellVariant = column?.columnDef?.meta?.cell?.variant;
			const emptyValue = getEmptyCellValue(cellVariant);
			updates.push({ rowIndex, columnId, value: emptyValue });
		}

		if (updates.length > 0) {
			handleDataUpdate(updates);

			if (selectionState.selectedCells.size > 0) {
				onSelectionClear();
			}

			if (cutCells.size > 0) {
				cutCells = new Set();
			}
		}
	}

	async function deleteRowsByIndices(rowIndices: number[]) {
		if (readOnly || !onRowsDeleteProp) return;
		if (rowIndices.length === 0) return;

		const rows = table.getRowModel().rows;
		if (rows.length === 0) return;

		const currentFocusedColumn = focusedCell?.columnId ?? getFirstNavigableColumnId();
		const minDeletedRowIndex = Math.min(...rowIndices);
		const rowsToDelete = rowIndices.map((idx) => rows[idx]?.original).filter(Boolean) as TData[];

		if (rowsToDelete.length > 0) {
			await onRowsDeleteProp(rowsToDelete, rowIndices);
			clearSelection();
			rowSelection = {};
			editingCell = null;

			requestAnimationFrame(() => {
				const currentRows = table.getRowModel().rows;
				if (currentRows.length > 0 && currentFocusedColumn) {
					focusCell(Math.min(minDeletedRowIndex, currentRows.length - 1), currentFocusedColumn);
				}
			});
		}
	}

	function deleteSelectedRows() {
		const selectedRowIndices = new Set<number>();

		for (const cellKey of selectionState.selectedCells) {
			const { rowIndex } = parseCellKey(cellKey);
			selectedRowIndices.add(rowIndex);
		}

		deleteRowsByIndices(Array.from(selectedRowIndices));
	}

	// ========================================
	// Search
	// ========================================

	function performSearch(query: string) {
		if (!query.trim()) {
			searchMatches = [];
			searchMatchSet.clear();
			matchIndex = -1;
			return;
		}

		const rows = table.getRowModel().rows;
		const cols = getNavigableColumns();
		const matches: CellPosition[] = [];
		const lowerQuery = query.toLowerCase();

		// Clear set before building - we'll add during the same loop
		searchMatchSet.clear();

		for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
			const row = rows[rowIndex];
			if (!row) continue;

			for (const col of cols) {
				const value = row.getValue(col.id);
				const strValue = String(value ?? '').toLowerCase();
				if (strValue.includes(lowerQuery)) {
					const columnId = col.id;
					matches.push({ rowIndex, columnId });
					// Build Set in same loop - single pass
					searchMatchSet.add(getCellKey(rowIndex, columnId));
				}
			}
		}

		searchMatches = matches;
		matchIndex = matches.length > 0 ? 0 : -1;

		// Scroll to the first match without moving focus out of the search input.
		if (matches.length > 0 && matches[0]) {
			virtualizer?.scrollToIndex(matches[0].rowIndex, { align: 'center' });
		}
	}

	function navigateToNextMatch() {
		if (searchMatches.length === 0) return;

		const newIndex = (matchIndex + 1) % searchMatches.length;
		const match = searchMatches[newIndex];
		if (match) {
			virtualizer?.scrollToIndex(match.rowIndex, { align: 'center' });
			requestAnimationFrame(() => {
				matchIndex = newIndex;
				requestAnimationFrame(() => {
					focusCell(match.rowIndex, match.columnId);
				});
			});
		}
	}

	function navigateToPrevMatch() {
		if (searchMatches.length === 0) return;

		const newIndex = (matchIndex - 1 + searchMatches.length) % searchMatches.length;
		const match = searchMatches[newIndex];
		if (match) {
			virtualizer?.scrollToIndex(match.rowIndex, { align: 'center' });
			requestAnimationFrame(() => {
				matchIndex = newIndex;
				requestAnimationFrame(() => {
					focusCell(match.rowIndex, match.columnId);
				});
			});
		}
	}

	// ========================================
	// Context Menu
	// ========================================

	function onCellContextMenu(rowIndex: number, columnId: string, event: MouseEvent) {
		event.preventDefault();
		event.stopPropagation();

		// Select cell if not already selected
		const cellKey = getCellKey(rowIndex, columnId);
		if (!selectionState.selectedCells.has(cellKey)) {
			selectCell(rowIndex, columnId);
		}

		contextMenu = {
			open: true,
			x: event.clientX,
			y: event.clientY
		};
	}

	// ========================================
	// Keyboard Handler
	// ========================================

	function handleKeyDown(event: KeyboardEvent) {
		// Search shortcut
		if ((event.ctrlKey || event.metaKey) && event.key === 'f' && enableSearch) {
			event.preventDefault();
			event.stopPropagation();
			handleSearchOpenChange(true);
			return;
		}

		if (enableSearch && searchOpen && !editingCell) {
			if (event.key === 'Enter') {
				event.preventDefault();
				event.stopPropagation();
				if (event.shiftKey) {
					navigateToPrevMatch();
				} else {
					navigateToNextMatch();
				}
				return;
			}

			if (event.key === 'Escape') {
				event.preventDefault();
				event.stopPropagation();
				handleSearchOpenChange(false);
				return;
			}
			return;
		}

		// Cell editors handle their own keyboard events before they bubble to the grid.
		if (editingCell) return;

		// Delete selected/focused rows
		if (
			(event.ctrlKey || event.metaKey) &&
			(event.key === 'Delete' || event.key === 'Backspace') &&
			!readOnly &&
			onRowsDeleteProp
		) {
			const rowIndices = getRowIndicesForDeletion({
				rowSelection,
				selectedCells: selectionState.selectedCells,
				focusedCell,
				rows: table.getRowModel().rows
			});

			if (rowIndices.length > 0) {
				event.preventDefault();
				event.stopPropagation();
				deleteRowsByIndices(rowIndices);
			}
			return;
		}

		if (!focusedCell) return;

		// Copy
		if ((event.ctrlKey || event.metaKey) && !event.shiftKey && event.key === 'c') {
			event.preventDefault();
			event.stopPropagation();
			copySelectedCells();
			return;
		}

		// Cut
		if ((event.ctrlKey || event.metaKey) && !event.shiftKey && event.key === 'x' && !readOnly) {
			event.preventDefault();
			event.stopPropagation();
			cutSelectedCells();
			return;
		}

		// Paste
		if ((event.ctrlKey || event.metaKey) && !event.shiftKey && event.key === 'v' && enablePaste && !readOnly) {
			event.preventDefault();
			event.stopPropagation();
			pasteFromClipboard();
			return;
		}

		// Select all
		if ((event.ctrlKey || event.metaKey) && !event.shiftKey && event.key === 'a') {
			event.preventDefault();
			event.stopPropagation();
			selectAll();
			return;
		}

		// Delete/Backspace
		if (event.key === 'Delete' || event.key === 'Backspace') {
			if (!editingCell) {
				event.preventDefault();
				event.stopPropagation();
				clearSelectedCells();
				return;
			}
		}

		// Escape
		if (event.key === 'Escape') {
			event.preventDefault();
			event.stopPropagation();
			if (editingCell) {
				stopEditing();
			} else if (searchOpen) {
				handleSearchOpenChange(false);
			} else if (selectionState.selectedCells.size > 0 || Object.keys(rowSelection).length > 0) {
				onSelectionClear();
			} else {
				blurCell();
			}
			return;
		}

		// Navigation
		const isCtrlPressed = event.ctrlKey || event.metaKey;
		const { altKey, shiftKey } = event;
		let direction: NavigationDirection | null = null;

		switch (event.key) {
			case 'ArrowUp':
				if (altKey && !isCtrlPressed && !shiftKey) {
					direction = 'pageup';
				} else if (isCtrlPressed && shiftKey && focusedCell) {
					const navigableColumnIds = getNavigableColumnIds();
					const selectionEdge = selectionState.selectionRange?.end ?? focusedCell;
					const currentColIndex = navigableColumnIds.indexOf(selectionEdge.columnId);
					const selectionStart = selectionState.selectionRange?.start ?? focusedCell;

					selectRange(selectionStart, {
						rowIndex: 0,
						columnId: navigableColumnIds[currentColIndex] ?? selectionEdge.columnId
					});

					virtualizer?.scrollToIndex(0, { align: 'start' });
					dataGridRef?.focus();

					event.preventDefault();
					event.stopPropagation();
					return;
				} else if (isCtrlPressed && !shiftKey) {
					direction = 'ctrl+up';
				} else {
					direction = 'up';
				}
				break;
			case 'ArrowDown':
				if (altKey && !isCtrlPressed && !shiftKey) {
					direction = 'pagedown';
				} else if (isCtrlPressed && shiftKey && focusedCell) {
					const rowCount = table.getRowModel().rows.length;
					const navigableColumnIds = getNavigableColumnIds();
					const selectionEdge = selectionState.selectionRange?.end ?? focusedCell;
					const currentColIndex = navigableColumnIds.indexOf(selectionEdge.columnId);
					const selectionStart = selectionState.selectionRange?.start ?? focusedCell;
					const lastRowIndex = Math.max(0, rowCount - 1);

					selectRange(selectionStart, {
						rowIndex: lastRowIndex,
						columnId: navigableColumnIds[currentColIndex] ?? selectionEdge.columnId
					});

					virtualizer?.scrollToIndex(lastRowIndex, { align: 'end' });
					dataGridRef?.focus();

					event.preventDefault();
					event.stopPropagation();
					return;
				} else if (isCtrlPressed && !shiftKey) {
					direction = 'ctrl+down';
				} else {
					direction = 'down';
				}
				break;
			case 'ArrowLeft':
				if (isCtrlPressed && shiftKey && focusedCell) {
					const navigableColumnIds = getNavigableColumnIds();
					const selectionEdge = selectionState.selectionRange?.end ?? focusedCell;
					const selectionStart = selectionState.selectionRange?.start ?? focusedCell;
					const targetColumnId =
						getDir() === 'rtl'
							? navigableColumnIds[navigableColumnIds.length - 1]
							: navigableColumnIds[0];

					if (targetColumnId) {
						selectRange(selectionStart, {
							rowIndex: selectionEdge.rowIndex,
							columnId: targetColumnId
						});
						scrollFocusedCellIntoView(selectionEdge.rowIndex, targetColumnId, 'home');
						dataGridRef?.focus();
					}

					event.preventDefault();
					event.stopPropagation();
					return;
				} else if (isCtrlPressed && !shiftKey) {
					direction = 'home';
				} else {
					direction = 'left';
				}
				break;
			case 'ArrowRight':
				if (isCtrlPressed && shiftKey && focusedCell) {
					const navigableColumnIds = getNavigableColumnIds();
					const selectionEdge = selectionState.selectionRange?.end ?? focusedCell;
					const selectionStart = selectionState.selectionRange?.start ?? focusedCell;
					const targetColumnId =
						getDir() === 'rtl'
							? navigableColumnIds[0]
							: navigableColumnIds[navigableColumnIds.length - 1];

					if (targetColumnId) {
						selectRange(selectionStart, {
							rowIndex: selectionEdge.rowIndex,
							columnId: targetColumnId
						});
						scrollFocusedCellIntoView(selectionEdge.rowIndex, targetColumnId, 'end');
						dataGridRef?.focus();
					}

					event.preventDefault();
					event.stopPropagation();
					return;
				} else if (isCtrlPressed && !shiftKey) {
					direction = 'end';
				} else {
					direction = 'right';
				}
				break;
			case 'Home':
				direction = isCtrlPressed ? 'ctrl+home' : 'home';
				break;
			case 'End':
				direction = isCtrlPressed ? 'ctrl+end' : 'end';
				break;
			case 'PageUp':
				direction = altKey ? 'pageleft' : 'pageup';
				break;
			case 'PageDown':
				direction = altKey ? 'pageright' : 'pagedown';
				break;
		}

		if (direction) {
			event.preventDefault();
			event.stopPropagation();

			if (shiftKey && event.key !== 'Tab' && focusedCell) {
				const anchor = selectionAnchor || focusedCell;
				const newPos = getNavigationTarget(direction);
				if (newPos) {
					selectRange(anchor, newPos);
					focusedCell = newPos;

					if (virtualizer) {
						virtualizer.scrollToIndex(newPos.rowIndex, { align: 'auto' });
					}

					requestAnimationFrame(() => {
						const cellElement = cellMapRef.get(getCellKey(newPos.rowIndex, newPos.columnId));
						if (cellElement) {
							cellElement.scrollIntoView({ block: 'nearest', inline: 'nearest' });
							scrollFocusedCellIntoView(newPos.rowIndex, newPos.columnId, direction);
							cellElement.focus();
						}
					});
				}
			} else {
				navigateCell(direction);
			}
			return;
		}

		// Tab navigation (direction flips in RTL)
		if (event.key === 'Tab') {
			event.preventDefault();
			event.stopPropagation();
			const tabDirection =
				getDir() === 'rtl'
					? event.shiftKey
						? 'right'
						: 'left'
					: event.shiftKey
						? 'left'
						: 'right';
			navigateCell(tabDirection);
			return;
		}

		// Shift+Enter adds a row (tablecn)
		if (event.key === 'Enter' && event.shiftKey && !readOnly && onRowAddProp && focusedCell) {
			event.preventDefault();
			event.stopPropagation();

			const initialRowCount = getData().length;
			const currentColumnId = focusedCell.columnId;

			void Promise.resolve(onRowAddProp())
				.then(async (result) => {
					if (result === null) return;
					await focusAddedRow(result, initialRowCount, currentColumnId);
				})
				.catch(() => {
					// Callback threw; skip scroll/focus
				});
			return;
		}

		// Enter to start editing
		if (event.key === 'Enter' && focusedCell) {
			event.preventDefault();
			event.stopPropagation();
			startEditing(focusedCell.rowIndex, focusedCell.columnId);
			return;
		}

		// F2 to start editing
		if (event.key === 'F2' && focusedCell) {
			event.preventDefault();
			event.stopPropagation();
			startEditing(focusedCell.rowIndex, focusedCell.columnId);
			return;
		}

		// Typing starts editing
		if (focusedCell && !readOnly && event.key.length === 1 && !event.ctrlKey && !event.metaKey) {
			startEditing(focusedCell.rowIndex, focusedCell.columnId);
		}
	}

	function getNavigationTarget(direction: NavigationDirection): CellPosition | null {
		if (!focusedCell) return null;

		const navigableColumnIds = getNavigableColumnIds();
		const rows = table.getRowModel().rows;
		const rowCount = rows.length;
		const { rowIndex, columnId } = focusedCell;
		const currentColIndex = navigableColumnIds.indexOf(columnId);

		let newRowIndex = rowIndex;
		let newColumnId: string | null = columnId;

		const isRtl = getDir() === 'rtl';

		switch (direction) {
			case 'up':
				newRowIndex = Math.max(0, rowIndex - 1);
				break;
			case 'down':
				newRowIndex = Math.min(rowCount - 1, rowIndex + 1);
				break;
			case 'left':
				if (isRtl) {
					if (currentColIndex < navigableColumnIds.length - 1) {
						newColumnId = navigableColumnIds[currentColIndex + 1] ?? columnId;
					}
				} else if (currentColIndex > 0) {
					newColumnId = navigableColumnIds[currentColIndex - 1] ?? columnId;
				}
				break;
			case 'right':
				if (isRtl) {
					if (currentColIndex > 0) {
						newColumnId = navigableColumnIds[currentColIndex - 1] ?? columnId;
					}
				} else if (currentColIndex < navigableColumnIds.length - 1) {
					newColumnId = navigableColumnIds[currentColIndex + 1] ?? columnId;
				}
				break;
			case 'home':
				newColumnId = navigableColumnIds[0] ?? null;
				break;
			case 'end':
				newColumnId = navigableColumnIds[navigableColumnIds.length - 1] ?? null;
				break;
			case 'ctrl+home':
				newRowIndex = 0;
				newColumnId = navigableColumnIds[0] ?? null;
				break;
			case 'ctrl+end':
				newRowIndex = Math.max(0, rowCount - 1);
				newColumnId = navigableColumnIds[navigableColumnIds.length - 1] ?? null;
				break;
			case 'ctrl+up':
				newRowIndex = 0;
				break;
			case 'ctrl+down':
				newRowIndex = Math.max(0, rowCount - 1);
				break;
			case 'pageup': {
				const pageSize = virtualizer?.getVirtualItems().length ?? 10;
				newRowIndex = Math.max(0, rowIndex - pageSize);
				break;
			}
			case 'pagedown': {
				const pageSize = virtualizer?.getVirtualItems().length ?? 10;
				newRowIndex = Math.min(rowCount - 1, rowIndex + pageSize);
				break;
			}
			case 'pageleft':
				if (isRtl) {
					if (currentColIndex < navigableColumnIds.length - 1) {
						const targetIndex = Math.min(
							navigableColumnIds.length - 1,
							currentColIndex + HORIZONTAL_PAGE_SIZE
						);
						newColumnId = navigableColumnIds[targetIndex] ?? null;
					}
				} else if (currentColIndex > 0) {
					const targetIndex = Math.max(0, currentColIndex - HORIZONTAL_PAGE_SIZE);
					newColumnId = navigableColumnIds[targetIndex] ?? null;
				}
				break;
			case 'pageright':
				if (isRtl) {
					if (currentColIndex > 0) {
						const targetIndex = Math.max(0, currentColIndex - HORIZONTAL_PAGE_SIZE);
						newColumnId = navigableColumnIds[targetIndex] ?? null;
					}
				} else if (currentColIndex < navigableColumnIds.length - 1) {
					const targetIndex = Math.min(
						navigableColumnIds.length - 1,
						currentColIndex + HORIZONTAL_PAGE_SIZE
					);
					newColumnId = navigableColumnIds[targetIndex] ?? null;
				}
				break;
		}

		if (newColumnId) {
			return { rowIndex: newRowIndex, columnId: newColumnId };
		}
		return null;
	}

	// ========================================
	// Table sync + row index resolution (sort/filter aware)
	// ========================================

	function syncTableFromData() {
		const currentData = getData();
		table.setOptions((prev) => ({
			...prev,
			data: currentData,
			state: {
				...prev.state,
				sorting,
				columnFilters,
				rowSelection,
				columnPinning,
				columnVisibility,
				columnSizing,
				columnSizingInfo
			},
			meta
		}));
		notifyTableUpdate?.();
	}

	function resolveDisplayRowIndex(
		result: Partial<CellPosition> | null | void,
		fallbackIndex: number
	): number {
		const rows = table.getRowModel().rows;
		if (!rows.length) return 0;

		if (result?.rowId) {
			const byId = rows.findIndex((row) => row.id === result.rowId);
			if (byId !== -1) return byId;
		}

		if (result?.rowIndex !== undefined && getRowId) {
			const sourceRow = getData()[result.rowIndex];
			if (sourceRow) {
				const rowId = getRowId(sourceRow, result.rowIndex);
				const bySourceId = rows.findIndex((row) => row.id === rowId);
				if (bySourceId !== -1) return bySourceId;
			}
		}

		return Math.min(Math.max(0, fallbackIndex), rows.length - 1);
	}

	// ========================================
	// Scroll to row (tablecn-style: virtualizer + viewport + focus retries)
	// ========================================

	async function scrollToRow(opts: Partial<CellPosition>) {
		const resolvedColumnId = opts.columnId ?? getFirstNavigableColumnId();

		if (!resolvedColumnId) return;

		focusGuard = true;

		const columnId = resolvedColumnId;
		let rowIndex = opts.rowIndex ?? 0;

		async function scrollAndFocus(retryCount: number) {
			syncTableFromData();

			const rows = table.getRowModel().rows;
			const currentRowCount = rows.length;

			if (currentRowCount === 0) {
				if (retryCount > 0) {
					await new Promise((resolve) => setTimeout(resolve, 50));
					await scrollAndFocus(retryCount - 1);
				} else {
					releaseFocusGuard();
				}
				return;
			}

			rowIndex = resolveDisplayRowIndex(opts, rowIndex);

			if (rowIndex >= currentRowCount && retryCount > 0) {
				await new Promise((resolve) => setTimeout(resolve, 50));
				await scrollAndFocus(retryCount - 1);
				return;
			}

			const safeRowIndex = Math.min(rowIndex, Math.max(0, currentRowCount - 1));
			const isBottomHalf = safeRowIndex > currentRowCount / 2;

			if (virtualizer) {
				virtualizer.scrollToIndex(safeRowIndex, {
					align: isBottomHalf ? 'end' : 'start'
				});
			}

			await new Promise((resolve) => requestAnimationFrame(resolve));

			const container = dataGridRef;
			const targetRow = rowMapRef.get(safeRowIndex);

			if (container && targetRow) {
				const containerRect = container.getBoundingClientRect();
				const headerHeight = headerRef?.getBoundingClientRect().height ?? 0;
				const footerHeight = footerRef?.getBoundingClientRect().height ?? 0;

				const viewportTop = containerRect.top + headerHeight + VIEWPORT_OFFSET;
				const viewportBottom = containerRect.bottom - footerHeight - VIEWPORT_OFFSET;

				const rowRect = targetRow.getBoundingClientRect();
				const isFullyVisible = rowRect.top >= viewportTop && rowRect.bottom <= viewportBottom;

				if (!isFullyVisible) {
					if (rowRect.top < viewportTop) {
						container.scrollTop -= viewportTop - rowRect.top;
					} else if (rowRect.bottom > viewportBottom) {
						container.scrollTop += rowRect.bottom - viewportBottom;
					}
				}
			}

			editingCell = null;
			focusedCell = { rowIndex: safeRowIndex, columnId };

			const cellKey = getCellKey(safeRowIndex, columnId);
			const cellElement = cellMapRef.get(cellKey);

			if (cellElement) {
				scrollFocusedCellIntoView(safeRowIndex, columnId);
				cellElement.focus();
				releaseFocusGuard();
			} else if (retryCount > 0) {
				await new Promise((resolve) => requestAnimationFrame(resolve));
				await scrollAndFocus(retryCount - 1);
			} else {
				dataGridRef?.focus();
				releaseFocusGuard();
			}
		}

		await scrollAndFocus(SCROLL_SYNC_RETRY_COUNT);
	}

	// ========================================
	// Row Add Handler
	// ========================================

	async function focusAddedRow(
		result: Partial<CellPosition> | null | void,
		initialRowCount: number,
		defaultColumnId?: string
	) {
		syncTableFromData();

		const rows = table.getRowModel().rows;
		if (result?.rowId && !rows.some((row) => row.id === result.rowId)) {
			toast.info('Row added but is hidden by the current filter');
			return;
		}

		onSelectionClear();

		const targetRowIndex = resolveDisplayRowIndex(result, result?.rowIndex ?? initialRowCount);
		const targetColumnId = result?.columnId ?? defaultColumnId ?? getFirstNavigableColumnId();
		if (!targetColumnId) return;

		await scrollToRow({
			rowIndex: targetRowIndex,
			rowId: result?.rowId,
			columnId: targetColumnId
		});
	}

	async function handleRowAdd(event?: MouseEvent) {
		if (readOnly || !onRowAddProp) return;

		const initialRowCount = getData().length;

		let result: Partial<CellPosition> | null | void;
		try {
			result = await onRowAddProp(event);
		} catch (error) {
			console.error('[useDataGrid] onRowAdd failed', error);
			toast.error('Failed to add row');
			return;
		}

		if (result === null || event?.defaultPrevented) return;

		await focusAddedRow(result, initialRowCount);
	}

	// ========================================
	// Data Update Handler
	// ========================================

	function handleDataUpdate(updates: UpdateCell | UpdateCell[]) {
		if (readOnly) return;

		const updateArray = Array.isArray(updates) ? updates : [updates];
		if (updateArray.length === 0) return;

		const rows = table.getRowModel().rows;
		const currentData = getData();
		const nextData = onDataChange ? [...currentData] : null;

		function getSourceRowIndex(rowData: TData): number {
			const directIndex = currentData.indexOf(rowData);
			if (directIndex !== -1) {
				return directIndex;
			}

			if (!getRowId) {
				return -1;
			}

			const rowId = getRowId(rowData, -1);
			return currentData.findIndex((item, index) => getRowId(item, index) === rowId);
		}

		// Update cellValueMap for immediate UI feedback (fine-grained reactivity)
		// This is the fast path - only the specific cells that changed will re-render
		for (const update of updateArray) {
			const row = rows[update.rowIndex];
			if (!row) continue;

			setCellValue(row.id, update.columnId, update.value);

			if (nextData) {
				const sourceRowIndex = getSourceRowIndex(row.original as TData);
				const targetIndex = sourceRowIndex !== -1 ? sourceRowIndex : update.rowIndex;

				const nextRow = nextData[targetIndex];
				if (!nextRow) continue;

				nextData[targetIndex] = {
					...(nextRow as Record<string, unknown>),
					[update.columnId]: update.value
				} as TData;
			} else {
				// Without an external onDataChange callback, preserve the existing fast path
				// and mutate the row directly so the proxied data stays in sync.
				const original = row.original as Record<string, unknown>;
				original[update.columnId] = update.value;
			}
		}

		if (nextData) {
			onDataChange?.(nextData);
		}
	}

	// ========================================
	// Create TanStack Table
	// ========================================

	// Initialize column sizing state from column definitions (only if not provided in initialState)
	$effect.pre(() => {
		if (Object.keys(columnSizing).length === 0) {
			const sizing: Record<string, number> = {};
			for (const col of columns) {
				if (col.size) {
					sizing[col.id as string] = col.size;
				}
			}
			if (Object.keys(sizing).length > 0) {
				columnSizing = sizing;
			}
		}
	});

	// Create a reactive meta object using getters so that components always get fresh values
	// This is critical - without getters, the meta values are captured at creation time and never update
	const meta = {
		get dataGridRef() {
			return dataGridRef;
		},
		get cellMapRef() {
			return cellMapRef;
		},
		get focusedCell() {
			return focusedCell;
		},
		get editingCell() {
			return editingCell;
		},
		get selectionState() {
			return selectionState;
		},
		get searchOpen() {
			return searchOpen;
		},
		get readOnly() {
			return readOnly;
		},
		get rowHeight() {
			return rowHeight;
		},
		get contextMenu() {
			return contextMenu;
		},
		get pasteDialog() {
			return pasteDialog;
		},
		getIsCellSelected,
		// Expose cellValueMap directly for fine-grained cell-level reactivity
		// Cells access map.get(key) inside $derived for proper Svelte tracking
		get cellValueMap() {
			return getCellValueMap();
		},
		// Expose SvelteSet directly for fine-grained cell selection reactivity
		// Cells can call selectedCellsSet.has(key) in $derived for proper Svelte tracking
		selectedCellsSet,
		// Version counter to trigger cell re-renders when selection changes
		get selectionVersion() {
			return selectionVersion;
		},
		// Expose SvelteSet directly for fine-grained reactivity
		// Cells can call searchMatchSet.has(key) directly in template
		searchMatchSet,
		get activeSearchMatch() {
			return searchMatches[matchIndex] ?? null;
		},
		// Keep functions for backwards compatibility
		getIsSearchMatch,
		getIsActiveSearchMatch,
		onRowHeightChange: handleRowHeightChange,
		getVisualRowIndex,
		onColumnClick,
		onCellClick,
		onCellDoubleClick: (ri: number, colId: string, event?: MouseEvent) => {
			if (event?.defaultPrevented) return;
			startEditing(ri, colId);
		},
		onCellMouseDown,
		onCellMouseEnter,
		onCellMouseUp,
		onCellContextMenu,
		onCellEditingStart: startEditing,
		onCellEditingStop: stopEditing,
		onDataUpdate: handleDataUpdate,
		onRowsDelete: onRowsDeleteProp ? deleteRowsByIndices : undefined,
		onCellsCopy: copySelectedCells,
		onCellsCut: cutSelectedCells,
		onCellsPaste,
		onFilesUpload,
		onFilesDelete,
		onRowSelect: handleRowSelect,
		onContextMenuOpenChange: (open: boolean) => {
			contextMenu = { ...contextMenu, open };
		},
		onPasteDialogOpenChange: (open: boolean) => {
			pasteDialog = open
				? { ...pasteDialog, open }
				: { open: false, rowsNeeded: 0, clipboardText: '' };
		},
		onPasteWithExpansion: () => onCellsPaste(true),
		onPasteWithoutExpansion: () => onCellsPaste(false),
		onSelectionClear
	};

	let notifyTableUpdate: (() => void) | undefined;

	// Create the base table options
	const baseTableOptions: TableOptionsResolved<TData> = {
		data: getData(),
		columns,
		...(getRowId ? { getRowId } : {}),
		get state() {
			return {
				sorting,
				columnFilters,
				rowSelection,
				columnPinning,
				columnVisibility,
				columnSizing,
				columnSizingInfo
			};
		},
		onColumnSizingChange: (updater) => {
			columnSizing = typeof updater === 'function' ? updater(columnSizing) : updater;
		},
		onColumnSizingInfoChange: (updater) => {
			columnSizingInfo = typeof updater === 'function' ? updater(columnSizingInfo) : updater;
		},
		onColumnPinningChange: (updater) => {
			columnPinning = typeof updater === 'function' ? updater(columnPinning) : updater;
		},
		onColumnVisibilityChange: (updater) => {
			columnVisibility = typeof updater === 'function' ? updater(columnVisibility) : updater;
			// No version counter needed - visibilityKey is derived from columnVisibility
			// and will automatically update when visibility changes
		},
		onSortingChange: (updater) => {
			sorting = typeof updater === 'function' ? updater(sorting) : updater;
			onSortingChangeProp?.(sorting);
			notifyTableUpdate?.();
		},
		onColumnFiltersChange: (updater) => {
			columnFilters = typeof updater === 'function' ? updater(columnFilters) : updater;
			onColumnFiltersChangeProp?.(columnFilters);
			notifyTableUpdate?.();
		},
		onRowSelectionChange: (updater) => {
			const newRowSelection = typeof updater === 'function' ? updater(rowSelection) : updater;
			rowSelection = newRowSelection;
			onRowSelectionChangeProp?.(newRowSelection);

			// Keep cell selection aligned with selected rows so the full row is highlighted.
			const rows = table.getRowModel().rows;
			const selectedRows = Object.keys(newRowSelection).filter((key) => newRowSelection[key]);
			const newSelectedCells = new Set<string>();
			const allColumnIds = table.getAllColumns().map((col) => col.id);

			for (const rowId of selectedRows) {
				const rowIdx = rows.findIndex((r) => r.id === rowId);
				if (rowIdx === -1) continue;

				for (const columnId of allColumnIds) {
					newSelectedCells.add(getCellKey(rowIdx, columnId));
				}
			}

			syncSelectedCellsSet(newSelectedCells);
			selectionState = {
				selectedCells: newSelectedCells,
				selectionRange: null,
				isSelecting: false
			};

			// Clear focused/editing cell when selecting rows
			focusedCell = null;
			editingCell = null;
		},
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		columnResizeMode: 'onChange',
		columnResizeDirection: getDir(),
		enableColumnResizing: true,
		defaultColumn: {
			minSize: MIN_COLUMN_SIZE,
			maxSize: MAX_COLUMN_SIZE,
			size: DEFAULT_COLUMN_SIZE
		},
		enableRowSelection: true,
		enableColumnFilters: true,
		enableFilters: true,
		renderFallbackValue: null,
		onStateChange: () => {},
		mergeOptions: (
			defaultOptions: TableOptions<TData>,
			newOptions: Partial<TableOptions<TData>>
		) => {
			return { ...defaultOptions, ...newOptions };
		},
		meta
	};

	const table = createTable(baseTableOptions);

	// Create a subscriber to notify effects when table data changes
	const subscribeToTable = createSubscriber((update) => {
		notifyTableUpdate = update;
		return () => {};
	});

	// Track previous state to detect changes that require cache clearing
	let prevSorting: SortingState = [];
	let prevColumnFilters: ColumnFiltersState = [];
	let prevDataLength = 0;
	let prevDataRef: TData[] | null = null;
	let prevColumnVisibility: VisibilityState = {};

	// This is the key to reactivity: update table options in $effect.pre
	// whenever any of the state values change
	$effect.pre(() => {
		// Read all reactive state to create dependencies
		const currentState = {
			sorting,
			columnFilters,
			rowSelection,
			columnPinning,
			columnVisibility,
			columnSizing,
			columnSizingInfo
		};
		void getDir();
		const currentData = getData();
		// Subscribe to parent data length so onRowAdd updates re-sync the table
		void currentData.length;

		const dataLengthChanged = currentData.length !== prevDataLength;
		const dataReferenceChanged = currentData !== prevDataRef;
		const visibilityChanged = !isVisibilityStateEqual(columnVisibility, prevColumnVisibility);

		if (dataLengthChanged || dataReferenceChanged || visibilityChanged) {
			clearCellValueCache();
			prevDataLength = currentData.length;
			prevDataRef = currentData;
			prevColumnVisibility = { ...columnVisibility };
		}
		const sortingChanged = !isSortingStateEqual(sorting, prevSorting);
		const filtersChanged = !isColumnFiltersStateEqual(columnFilters, prevColumnFilters);
		if (sortingChanged) prevSorting = [...sorting];
		if (filtersChanged) prevColumnFilters = [...columnFilters];

		// Update table with current state
		table.setOptions((prev) => ({
			...prev,
			data: currentData,
			columnResizeDirection: getDir(),
			state: {
				...prev.state,
				...currentState
			},
			meta
		}));

		// Notify any subscribers that table data has changed
		// This triggers re-runs of effects/derived that called subscribeToTable()
		notifyTableUpdate?.();

		if (sortingChanged || filtersChanged) {
			syncSelectionToRowModel();
		}
	});

	// ========================================
	// Compute columnSizeVars (now that table exists)
	// ========================================

	// Compute column sizes based on columnSizing and columnSizingInfo state
	function getColumnSizeVars(): Record<string, number> {
		// Read both columnSizing and columnSizingInfo to create reactive dependencies
		// columnSizingInfo updates during resize drag, columnSizing updates on release
		const _ = columnSizing;
		const __ = columnSizingInfo;

		const vars: Record<string, number> = {};
		try {
			const headers = table.getFlatHeaders();
			for (const header of headers) {
				const size = header.getSize();
				vars[`--header-${header.id}-size`] = size;
				vars[`--col-${header.column.id}-size`] = size;
			}
		} catch {
			// Table not ready yet
		}
		return vars;
	}

	// ========================================
	// Create Virtualizer
	// ========================================

	let virtualizer: Virtualizer<HTMLDivElement, Element> | null = null;

	// Virtualizer onChange handler - called when scroll position or size changes
	function handleVirtualizerChange(instance: Virtualizer<HTMLDivElement, Element>) {
		virtualItems = instance.getVirtualItems();
		totalSize = instance.getTotalSize();
		isScrolling = instance.isScrolling;
	}

	function disposeVirtualizer() {
		virtualizer = null;
		virtualItems = [];
		totalSize = 0;
		isScrolling = false;
	}

	function createVirtualizerOptions(ref: HTMLDivElement, rowCount: number) {
		const isFirefox =
			typeof navigator !== 'undefined' && navigator.userAgent.indexOf('Firefox') !== -1;

		return {
			count: rowCount,
			getScrollElement: () => dataGridRef ?? ref,
			estimateSize: () => getRowHeightValue(rowHeight),
			overscan,
			observeElementRect: virtualCore.observeElementRect,
			observeElementOffset: virtualCore.observeElementOffset,
			scrollToFn: virtualCore.elementScroll,
			onChange: handleVirtualizerChange,
			measureElement: isFirefox
				? undefined
				: (element: Element) => element.getBoundingClientRect().height
		};
	}

	// Create or rebind virtualizer when the scroll container mounts (e.g. demo tab switch).
	$effect(() => {
		const ref = dataGridRef;
		if (!ref) {
			disposeVirtualizer();
			return;
		}

		const rowCount = untrack(() => table.getRowModel().rows.length);

		if (virtualizer) {
			virtualizer.setOptions(createVirtualizerOptions(ref, rowCount));
			virtualizer._willUpdate();
			handleVirtualizerChange(virtualizer);
			return;
		}

		virtualizer = new virtualCore.Virtualizer<HTMLDivElement, Element>(
			createVirtualizerOptions(ref, rowCount)
		);
		virtualizer._willUpdate();
		handleVirtualizerChange(virtualizer);
	});

	// Separate effect to update virtualizer count when filtered rows change
	// Track columnFilters, sorting, and data to trigger updates
	$effect(() => {
		// Read these to create dependencies - when filters/sorting/data change, row count changes
		const _ = columnFilters;
		const __ = sorting;
		const ___ = getData().length;

		// Get the filtered/sorted row count from the table
		const rowCount = table.getRowModel().rows.length;

		untrack(() => {
			const ref = dataGridRef;
			if (virtualizer && ref) {
				const prevCount = virtualizer.options.count;

				virtualizer.setOptions(createVirtualizerOptions(ref, rowCount));

				virtualizer._willUpdate();

				// If rows were deleted and we're scrolled past the new content,
				// scroll to the last row to avoid gaps
				if (rowCount < prevCount && rowCount > 0) {
					const scrollEl = ref;
					const newTotalSize = virtualizer.getTotalSize();
					if (scrollEl.scrollTop > newTotalSize - scrollEl.clientHeight) {
						// Scroll to show the last rows
						virtualizer.scrollToIndex(rowCount - 1, { align: 'end' });
					}
				}

				// Update virtual items immediately
				handleVirtualizerChange(virtualizer);
			}
		});
	});

	// Force virtualItems update when columnVisibility changes
	$effect(() => {
		const visibilitySnapshot = JSON.stringify(columnVisibility);
		if (virtualizer) {
			// Force virtualizer to recalculate
			virtualizer._willUpdate();
			virtualizer.measure();
			// Get fresh items
			const items = virtualizer.getVirtualItems();
			virtualItems = [...items];
		}
	});

	// Setup keyboard handler on data grid element
	$effect(() => {
		const container = dataGridRef;
		if (!container) return;

		return on(container, 'keydown', handleKeyDown);
	});

	// Match the original grid: suppress native text selection/context menus while drag-selecting cells.
	$effect(() => {
		if (!selectionState.isSelecting) return;
		if (typeof document === 'undefined') return;

		function onSelectStart(event: Event) {
			event.preventDefault();
		}

		function onContextMenu(event: Event) {
			event.preventDefault();
		}

		const previousUserSelect = document.body.style.userSelect;
		document.addEventListener('selectstart', onSelectStart);
		document.addEventListener('contextmenu', onContextMenu);
		document.body.style.userSelect = 'none';

		return () => {
			document.removeEventListener('selectstart', onSelectStart);
			document.removeEventListener('contextmenu', onContextMenu);
			document.body.style.userSelect = previousUserSelect;
		};
	});

	// Blur focused cell when clicking outside; keep keyboard target when cell unmounts (virtualization)
	$effect(() => {
		const container = dataGridRef;
		if (!container) return;

		const gridContainer = container;
		const currentFocusedCell = focusedCell;
		const currentEditingCell = editingCell;
		const hasSelections =
			selectionState.selectedCells.size > 0 || Object.keys(rowSelection).length > 0;

		function onMouseDown(event: MouseEvent) {
			if (event.button === 2) return;
			if (focusGuard && !hasSelections) return;
			if (!currentFocusedCell && !currentEditingCell && !hasSelections) return;

			const target = event.target;
			if (!(target instanceof Node)) return;
			if (gridContainer.contains(target)) return;
			if (getIsInPopover(target)) return;

			try {
				const elements = document.elementsFromPoint(event.clientX, event.clientY);
				if (elements.some((element) => getIsInPopover(element))) return;
			} catch {
				// If point lookup is unavailable for a synthetic event, fall back to target checks.
			}

			blurCell();
			if (hasSelections) {
				onSelectionClear();
			}
		}

		function onFocusOut(event: FocusEvent) {
			if (focusGuard) return;
			if (!currentFocusedCell || currentEditingCell) return;

			const relatedTarget = event.relatedTarget;

			if (relatedTarget && gridContainer.contains(relatedTarget as Node)) return;
			if (getIsInPopover(relatedTarget)) return;

			// Focus left the grid (toolbar, page chrome, another widget)
			if (relatedTarget && !gridContainer.contains(relatedTarget as Node)) {
				blurCell();
				return;
			}

			// Focus lost because the cell unmounted — keep model, focus grid for keyboard nav
			const { rowIndex, columnId } = currentFocusedCell;
			const cellKey = getCellKey(rowIndex, columnId);

			requestAnimationFrame(() => {
				if (focusGuard || !focusedCell) return;

				const cellElement = cellMapRef.get(cellKey);
				if (cellElement && document.body.contains(cellElement)) {
					return;
				}

				gridContainer.focus({ preventScroll: true });
			});
		}

		document.addEventListener('mousedown', onMouseDown);
		const removeFocusOut = on(gridContainer, 'focusout', onFocusOut);

		return () => {
			document.removeEventListener('mousedown', onMouseDown);
			removeFocusOut();
		};
	});

	// Global keyboard handler for search shortcut (Cmd+F / Ctrl+F)
	$effect(() => {
		if (!enableSearch) return;

		function onGlobalKeyDown(event: KeyboardEvent) {
			const target = event.target;
			if (!(target instanceof HTMLElement)) return;

			const { key, ctrlKey, metaKey, shiftKey } = event;
			const isCtrlPressed = ctrlKey || metaKey;

			// Handle Cmd+F / Ctrl+F for search
			if (isCtrlPressed && !shiftKey && key === 'f') {
				const isInInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';
				const isInDataGrid = dataGridRef?.contains(target) ?? false;
				const isInSearchInput = target.closest('[role="search"]') !== null;

				if (isInDataGrid || isInSearchInput || !isInInput) {
					event.preventDefault();
					event.stopPropagation();
					const nextSearchOpen = !searchOpen;
					handleSearchOpenChange(nextSearchOpen);

					if (nextSearchOpen && !isInDataGrid && !isInSearchInput && dataGridRef) {
						requestAnimationFrame(() => {
							dataGridRef?.focus();
						});
					}
				}
			}
		}

		return on(window, 'keydown', onGlobalKeyDown, { capture: true });
	});

	// Auto-focus on mount
	$effect(() => {
		if (autoFocus && dataGridRef) {
			queueMicrotask(() => {
				const firstColumnId = getFirstNavigableColumnId();
				if (firstColumnId) {
					if (typeof autoFocus === 'object') {
						const { rowIndex, columnId } = autoFocus;
						if (columnId) {
							dataGridRef?.focus();
							focusCell(rowIndex ?? 0, columnId);
						}
						return;
					}

					dataGridRef?.focus();
					focusCell(0, firstColumnId);
				}
			});
		}
	});

	// ========================================
	// Create Search State (if enabled)
	// ========================================

	// Note: searchState is returned as a getter in the return object
	// This allows the consuming component to get fresh values each render

	// ========================================
	// Create Virtualizer Return Object
	// ========================================

	// Use getters to ensure reactivity is preserved when accessing from consuming components
	const rowVirtualizer: VirtualizerReturn = {
		// Reactive getters - these allow Svelte to track dependencies
		get virtualItems() {
			return virtualItems;
		},
		get totalSize() {
			return totalSize;
		},
		get isScrolling() {
			return isScrolling;
		},
		// Methods
		scrollToIndex: (index, options) => virtualizer?.scrollToIndex(index, options),
		measureElement: (element) => virtualizer?.measureElement(element),
		// Legacy function-based accessors (kept for compatibility)
		getVirtualItems: () => virtualItems,
		getTotalSize: () => totalSize
	};

	// ========================================
	// Return
	// ========================================

	// Create a reactive table wrapper that exposes state-dependent getters
	// This is key to making the table reactive in Svelte 5
	// We use subscribeToTable() to register effects as subscribers, so they
	// re-run when notifyTableUpdate() is called after data changes
	const reactiveTable = {
		// Expose all original table methods and properties
		...table,
		// Override methods that depend on state to create reactive dependencies
		getRowModel: () => {
			subscribeToTable();
			return table.getRowModel();
		},
		getHeaderGroups: () => {
			subscribeToTable();
			return table.getHeaderGroups();
		},
		getAllColumns: () => {
			subscribeToTable();
			return table.getAllColumns();
		},
		getVisibleLeafColumns: () => {
			subscribeToTable();
			return table.getVisibleLeafColumns();
		},
		getState: () => {
			subscribeToTable();
			return table.getState();
		},
		getColumn: (columnId: string) => {
			subscribeToTable();
			return table.getColumn(columnId);
		},
		// Forward all other methods to the original table
		setColumnFilters: table.setColumnFilters.bind(table),
		setSorting: table.setSorting.bind(table),
		setColumnPinning: table.setColumnPinning.bind(table),
		setColumnVisibility: table.setColumnVisibility.bind(table),
		setRowSelection: table.setRowSelection.bind(table),
		setColumnSizing: table.setColumnSizing.bind(table),
		setOptions: table.setOptions.bind(table),
		getFlatHeaders: () => {
			subscribeToTable();
			return table.getFlatHeaders();
		},
		getTotalSize: () => {
			subscribeToTable();
			return table.getTotalSize();
		},
		getLeftLeafColumns: () => {
			subscribeToTable();
			return table.getLeftLeafColumns();
		},
		getRightLeafColumns: () => {
			subscribeToTable();
			return table.getRightLeafColumns();
		},
		getCenterLeafColumns: () => {
			subscribeToTable();
			return table.getCenterLeafColumns();
		},
		getIsAllRowsSelected: () => {
			subscribeToTable();
			return table.getIsAllRowsSelected();
		},
		getIsSomeRowsSelected: () => {
			subscribeToTable();
			return table.getIsSomeRowsSelected();
		},
		getIsAllPageRowsSelected: () => {
			subscribeToTable();
			return table.getIsAllPageRowsSelected();
		},
		getIsSomePageRowsSelected: () => {
			subscribeToTable();
			return table.getIsSomePageRowsSelected();
		},
		toggleAllRowsSelected: table.toggleAllRowsSelected.bind(table),
		toggleAllPageRowsSelected: table.toggleAllPageRowsSelected.bind(table),
		// Keep table reference for any other property access
		_getDefaultColumnDef: table._getDefaultColumnDef.bind(table),
		get options() {
			subscribeToTable();
			return table.options;
		},
		initialState: table.initialState
	} as unknown as Table<TData>;

	// Search callbacks - these are stable references
	function handleSearchOpenChange(open: boolean) {
		searchOpen = open;
		if (!open) {
			const currentMatch = matchIndex >= 0 ? searchMatches[matchIndex] : undefined;
			searchQuery = '';
			searchMatches = [];
			searchMatchSet.clear();
			matchIndex = -1;

			if (currentMatch) {
				focusedCell = {
					rowIndex: currentMatch.rowIndex,
					columnId: currentMatch.columnId
				};
			}

			if (dataGridRef && document.activeElement !== dataGridRef) {
				dataGridRef.focus();
			}
		}
	}

	function handleSearchQueryChange(query: string) {
		searchQuery = query;
	}

	function handleRowHeightChange(updater: Updater<RowHeightValue>) {
		const nextRowHeight = typeof updater === 'function' ? updater(rowHeight) : updater;
		rowHeight = nextRowHeight;
		onRowHeightChangeProp?.(nextRowHeight);
	}

	return {
		get dataGridRef() {
			return dataGridRef;
		},
		get headerRef() {
			return headerRef;
		},
			rowMapRef,
			get footerRef() {
				return footerRef;
			},
			table: reactiveTable,
			tableMeta: meta,
			rowVirtualizer,
			get virtualTotalSize() {
				return totalSize;
			},
			get virtualItems() {
				return virtualItems;
			},
			measureElement: (element: Element | null) => rowVirtualizer.measureElement(element),
			columns,
			// Selection state - pass the SvelteSet and a reactive object for version
			selectedCellsSet,
		// Wrap selectionVersion in object with getter so components can track it reactively
		selectionState: {
			get version() {
				return selectionVersion;
			}
		},
		getSelectionVersion: () => selectionVersion,
		getRowSelection: () => rowSelection,
		// Search state with getters for reactive values
		searchState: enableSearch
			? {
					get searchMatches() {
						return searchMatches;
					},
					get matchIndex() {
						return matchIndex;
					},
					get searchOpen() {
						return searchOpen;
					},
					get searchQuery() {
						return searchQuery;
					},
					onSearchOpenChange: handleSearchOpenChange,
						onSearchQueryChange: handleSearchQueryChange,
						onSearch: performSearch,
						onNavigateToNextMatch: navigateToNextMatch,
						onNavigateToPrevMatch: navigateToPrevMatch
					}
				: undefined,
			get searchMatchesByRow() {
				return getSearchMatchesByRow();
			},
			get activeSearchMatch() {
				if (matchIndex < 0 || searchMatches.length === 0) return null;
				return searchMatches[matchIndex] ?? null;
			},
			get columnSizeVars() {
				return getColumnSizeVars();
			},
			get cellSelectionMap() {
				return getCellSelectionMap();
			},
			get focusedCell() {
				return focusedCell;
			},
			get editingCell() {
				return editingCell;
			},
			get rowHeight() {
				return rowHeight;
			},
			get contextMenu() {
				return contextMenu;
			},
			get pasteDialog() {
				return pasteDialog;
			},
			get dir() {
				return getDir();
			},
		onRowAdd: onRowAddProp ? handleRowAdd : undefined,
		get adjustLayout() {
			return adjustLayout;
		},
		setDataGridRef: (el: HTMLDivElement | null) => {
			dataGridRef = el;
		},
		setHeaderRef: (el: HTMLDivElement | null) => {
			headerRef = el;
		},
		setFooterRef: (el: HTMLDivElement | null) => {
			footerRef = el;
		}
	};
}
