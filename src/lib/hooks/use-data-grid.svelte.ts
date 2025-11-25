/**
 * useDataGrid - Svelte 5 port of TableCN's useDataGrid React hook
 *
 * This is the core hook that manages all data grid state including:
 * - Cell focus and editing
 * - Cell selection (single, multi, range)
 * - Keyboard navigation
 * - Copy/paste functionality
 * - Search
 * - Context menus
 * - Row virtualization
 */

import { untrack } from 'svelte';
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
	type SortingState,
	type ColumnFiltersState,
	type RowSelectionState,
	type TableState,
	type ColumnPinningState,
	type VisibilityState,
	type ColumnSizingState
} from '@tanstack/table-core';
import {
	Virtualizer,
	elementScroll,
	observeElementOffset,
	observeElementRect
} from '@tanstack/virtual-core';
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
	FileCellData
} from '$lib/types/data-grid.js';
import { getCellKey, parseCellKey, getRowHeightValue } from '$lib/types/data-grid.js';

// ============================================
// Types
// ============================================

export interface UseDataGridOptions<TData extends RowData> {
	columns: ColumnDef<TData, unknown>[];
	data: TData[];
	rowHeight?: RowHeightValue;
	autoFocus?: boolean | { rowIndex?: number; columnId?: string };
	enableColumnSelection?: boolean;
	enableSearch?: boolean;
	enablePaste?: boolean;
	readOnly?: boolean;
	overscan?: number;
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
	onRowAdd?: (event?: MouseEvent) => Partial<CellPosition> | void | Promise<Partial<CellPosition> | void>;
	onRowsAdd?: (count: number) => void | Promise<void>;
	onRowsDelete?: (rows: TData[], rowIndices: number[]) => void | Promise<void>;
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

	// Virtualizer
	rowVirtualizer: VirtualizerReturn;

	// Search state (if enabled)
	searchState?: SearchState;

	// Column size CSS variables
	columnSizeVars: Record<string, number>;

	// Row add handler
	onRowAdd?: (event?: MouseEvent) => Promise<void>;

	// Setters for refs (for bind:this)
	setDataGridRef: (el: HTMLDivElement | null) => void;
	setHeaderRef: (el: HTMLDivElement | null) => void;
	setFooterRef: (el: HTMLDivElement | null) => void;
}

interface VirtualizerReturn {
	/** Use getter for reactive access in consuming components */
	readonly virtualItems: VirtualItem[];
	/** Use getter for reactive access in consuming components */
	readonly totalSize: number;
	scrollToIndex: (index: number, options?: { align?: 'start' | 'center' | 'end' | 'auto' }) => void;
	measureElement: (element: Element | null) => void;
	readonly isScrolling: boolean;
	/** Legacy method - prefer using virtualItems getter directly */
	getVirtualItems: () => VirtualItem[];
	/** Legacy method - prefer using totalSize getter directly */
	getTotalSize: () => number;
}

interface VirtualItem {
	index: number;
	key: string | number | bigint;
	start: number;
	end: number;
	size: number;
	lane: number;
}

// ============================================
// Non-navigable columns (skip during keyboard nav)
// ============================================

const NON_NAVIGABLE_COLUMNS = new Set(['select', 'actions']);

// ============================================
// Main Hook
// ============================================

export function useDataGrid<TData extends RowData>(
	options: UseDataGridOptions<TData>
): UseDataGridReturn<TData> {
	const {
		columns,
		data,
		rowHeight: initialRowHeight = 'short',
		autoFocus = false,
		enableColumnSelection = false,
		enableSearch = true,
		enablePaste = true,
		readOnly = false,
		overscan = 3,
		getRowId,
		initialState,
		onDataChange,
		onRowAdd: onRowAddProp,
		onRowsAdd,
		onRowsDelete: onRowsDeleteProp,
		onPaste,
		onFilesUpload,
		onFilesDelete
	} = options;

	// ========================================
	// Reactive State using Svelte 5 runes
	// ========================================

	// Refs
	let dataGridRef = $state<HTMLDivElement | null>(null);
	let headerRef = $state<HTMLDivElement | null>(null);
	let footerRef = $state<HTMLDivElement | null>(null);
	let rowMapRef = $state(new Map<number, HTMLDivElement>());
	let cellMapRef = $state(new Map<string, HTMLDivElement>());

	// Table state - use initialState if provided
	let sorting = $state<SortingState>(initialState?.sorting ?? []);
	let columnFilters = $state<ColumnFiltersState>(initialState?.columnFilters ?? []);
	let rowSelection = $state<RowSelectionState>(initialState?.rowSelection ?? {});
	let columnPinning = $state<ColumnPinningState>(initialState?.columnPinning ?? {});
	let columnVisibility = $state<VisibilityState>(initialState?.columnVisibility ?? {});
	let columnSizing = $state<ColumnSizingState>(initialState?.columnSizing ?? {});
	let rowHeight = $state<RowHeightValue>(initialRowHeight);

	// Cell state
	let focusedCell = $state<CellPosition | null>(null);
	let editingCell = $state<CellPosition | null>(null);
	let selectionState = $state<SelectionState>({
		selectedCells: new Set(),
		selectionRange: null,
		isSelecting: false
	});
	let cutCells = $state<Set<string>>(new Set());

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
	let matchIndex = $state(0);

	// Track last clicked row for shift-click selection
	let lastClickedRowIndex = $state<number | null>(null);

	// Virtualizer state
	let virtualItems = $state<VirtualItem[]>([]);
	let totalSize = $state(0);
	let isScrolling = $state(false);

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

	function getNextNavigableColumnId(currentColumnId: string, direction: 'left' | 'right'): string | null {
		const cols = getNavigableColumns();
		const currentIndex = cols.findIndex((col) => col.id === currentColumnId);
		if (currentIndex === -1) return null;

		const nextIndex = direction === 'right' ? currentIndex + 1 : currentIndex - 1;
		return cols[nextIndex]?.id ?? null;
	}

	function getIsCellSelected(rowIndex: number, columnId: string): boolean {
		return selectionState.selectedCells.has(getCellKey(rowIndex, columnId));
	}

	function getIsSearchMatch(rowIndex: number, columnId: string): boolean {
		return searchMatches.some(
			(match) => match.rowIndex === rowIndex && match.columnId === columnId
		);
	}

	function getIsActiveSearchMatch(rowIndex: number, columnId: string): boolean {
		const activeMatch = searchMatches[matchIndex];
		return activeMatch?.rowIndex === rowIndex && activeMatch?.columnId === columnId;
	}

	// ========================================
	// Cell Focus & Navigation
	// ========================================

	function focusCell(rowIndex: number, columnId: string) {
		focusedCell = { rowIndex, columnId };

		// Scroll cell into view
		const cellKey = getCellKey(rowIndex, columnId);
		const cellElement = cellMapRef.get(cellKey);
		if (cellElement) {
			cellElement.scrollIntoView({ block: 'nearest', inline: 'nearest' });
		}

		// Clear selection when focusing new cell (unless holding shift)
		if (!selectionState.isSelecting) {
			selectionState = {
				selectedCells: new Set([cellKey]),
				selectionRange: null,
				isSelecting: false
			};
		}
	}

	function blurCell() {
		focusedCell = null;
		editingCell = null;
	}

	function navigateCell(direction: NavigationDirection) {
		if (!focusedCell) return;

		const rows = table.getRowModel().rows;
		const { rowIndex, columnId } = focusedCell;

		let newRowIndex = rowIndex;
		let newColumnId: string | null = columnId;

		switch (direction) {
			case 'up':
				newRowIndex = Math.max(0, rowIndex - 1);
				break;
			case 'down':
				newRowIndex = Math.min(rows.length - 1, rowIndex + 1);
				break;
			case 'left':
				newColumnId = getNextNavigableColumnId(columnId, 'left');
				break;
			case 'right':
				newColumnId = getNextNavigableColumnId(columnId, 'right');
				break;
			case 'home':
				newColumnId = getFirstNavigableColumnId();
				break;
			case 'end':
				newColumnId = getLastNavigableColumnId();
				break;
			case 'ctrl+home':
				newRowIndex = 0;
				newColumnId = getFirstNavigableColumnId();
				break;
			case 'ctrl+end':
				newRowIndex = rows.length - 1;
				newColumnId = getLastNavigableColumnId();
				break;
			case 'pageup':
				newRowIndex = Math.max(0, rowIndex - 10);
				break;
			case 'pagedown':
				newRowIndex = Math.min(rows.length - 1, rowIndex + 10);
				break;
		}

		if (newColumnId && (newRowIndex !== rowIndex || newColumnId !== columnId)) {
			focusCell(newRowIndex, newColumnId);
		}
	}

	// ========================================
	// Cell Editing
	// ========================================

	function startEditing(rowIndex: number, columnId: string) {
		if (readOnly) return;
		editingCell = { rowIndex, columnId };
	}

	function stopEditing(opts?: { direction?: NavigationDirection; moveToNextRow?: boolean }) {
		editingCell = null;

		if (opts?.direction) {
			navigateCell(opts.direction);
		} else if (opts?.moveToNextRow && focusedCell) {
			navigateCell('down');
		}
	}

	// ========================================
	// Cell Selection
	// ========================================

	function selectCell(rowIndex: number, columnId: string, event?: MouseEvent) {
		const cellKey = getCellKey(rowIndex, columnId);

		if (event?.ctrlKey || event?.metaKey) {
			// Toggle selection
			const newSelected = new Set(selectionState.selectedCells);
			if (newSelected.has(cellKey)) {
				newSelected.delete(cellKey);
			} else {
				newSelected.add(cellKey);
			}
			selectionState = {
				...selectionState,
				selectedCells: newSelected
			};
		} else if (event?.shiftKey && focusedCell) {
			// Range selection
			selectRange(focusedCell, { rowIndex, columnId });
		} else {
			// Single selection
			selectionState = {
				selectedCells: new Set([cellKey]),
				selectionRange: null,
				isSelecting: false
			};
		}

		focusCell(rowIndex, columnId);
	}

	function selectRange(start: CellPosition, end: CellPosition) {
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

		selectionState = {
			selectedCells: newSelected,
			selectionRange: { start, end },
			isSelecting: false
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

		selectionState = {
			selectedCells: newSelected,
			selectionRange: null,
			isSelecting: false
		};
	}

	function clearSelection() {
		selectionState = {
			selectedCells: new Set(),
			selectionRange: null,
			isSelecting: false
		};
		blurCell();
	}

	// ========================================
	// Mouse Selection (Drag)
	// ========================================

	function onCellMouseDown(rowIndex: number, columnId: string, event: MouseEvent) {
		if (event.button !== 0) return; // Only left click

		selectionState = { ...selectionState, isSelecting: true };
		selectCell(rowIndex, columnId, event);
	}

	function onCellMouseEnter(rowIndex: number, columnId: string, event: MouseEvent) {
		if (!selectionState.isSelecting || !focusedCell) return;

		selectRange(focusedCell, { rowIndex, columnId });
	}

	function onCellMouseUp() {
		selectionState = { ...selectionState, isSelecting: false };
	}

	// ========================================
	// Clipboard Operations
	// ========================================

	function copySelectedCells() {
		if (selectionState.selectedCells.size === 0) return;

		const rows = table.getRowModel().rows;
		const cols = getNavigableColumns();

		// Get bounds of selection
		let minRow = Infinity,
			maxRow = -Infinity;
		let minCol = Infinity,
			maxCol = -Infinity;

		for (const cellKey of selectionState.selectedCells) {
			const { rowIndex, columnId } = parseCellKey(cellKey);
			const colIndex = cols.findIndex((c) => c.id === columnId);
			if (colIndex >= 0) {
				minRow = Math.min(minRow, rowIndex);
				maxRow = Math.max(maxRow, rowIndex);
				minCol = Math.min(minCol, colIndex);
				maxCol = Math.max(maxCol, colIndex);
			}
		}

		// Build TSV string
		const lines: string[] = [];
		for (let row = minRow; row <= maxRow; row++) {
			const rowData = rows[row];
			if (!rowData) continue;

			const cells: string[] = [];
			for (let col = minCol; col <= maxCol; col++) {
				const colId = cols[col]?.id;
				if (!colId) continue;

				const cellKey = getCellKey(row, colId);
				if (selectionState.selectedCells.has(cellKey)) {
					const value = rowData.getValue(colId);
					cells.push(formatCellValueForCopy(value));
				} else {
					cells.push('');
				}
			}
			lines.push(cells.join('\t'));
		}

		const text = lines.join('\n');
		navigator.clipboard.writeText(text);
	}

	function cutSelectedCells() {
		if (readOnly) return;

		copySelectedCells();
		cutCells = new Set(selectionState.selectedCells);
	}

	async function pasteFromClipboard() {
		if (readOnly || !enablePaste) return;

		try {
			const text = await navigator.clipboard.readText();
			if (!text.trim()) return;

			const rows = table.getRowModel().rows;
			const cols = getNavigableColumns();

			// Parse clipboard as TSV
			const lines = text.split('\n').map((line) => line.split('\t'));

			// Determine paste target
			const startPos = focusedCell || { rowIndex: 0, columnId: cols[0]?.id || '' };
			const startColIndex = cols.findIndex((c) => c.id === startPos.columnId);

			// Check if we need more rows
			const rowsNeeded = startPos.rowIndex + lines.length - rows.length;

			if (rowsNeeded > 0 && onRowsAdd) {
				pasteDialog = {
					open: true,
					rowsNeeded,
					clipboardText: text
				};
				return;
			}

			// Perform paste
			performPaste(text, startPos, startColIndex);
		} catch {
			// Clipboard access denied
		}
	}

	function performPaste(text: string, startPos: CellPosition, startColIndex: number) {
		const rows = table.getRowModel().rows;
		const cols = getNavigableColumns();
		const lines = text.split('\n').map((line) => line.split('\t'));

		const updates: UpdateCell[] = [];

		for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
			const line = lines[lineIdx];
			if (!line) continue;

			const rowIndex = startPos.rowIndex + lineIdx;
			if (rowIndex >= rows.length) break;

			for (let cellIdx = 0; cellIdx < line.length; cellIdx++) {
				const colIndex = startColIndex + cellIdx;
				const col = cols[colIndex];
				if (!col) break;

				const value = parseCellValueForPaste(line[cellIdx] || '', col.id);
				updates.push({ rowIndex, columnId: col.id, value });
			}
		}

		if (updates.length > 0) {
			onPaste?.(updates);

			// Clear cut cells if we had any
			if (cutCells.size > 0) {
				const clearUpdates: UpdateCell[] = [];
				for (const cellKey of cutCells) {
					const { rowIndex, columnId } = parseCellKey(cellKey);
					clearUpdates.push({ rowIndex, columnId, value: null });
				}
				onPaste?.(clearUpdates);
				cutCells = new Set();
			}
		}
	}

	function formatCellValueForCopy(value: unknown): string {
		if (value === null || value === undefined) return '';
		if (Array.isArray(value)) return JSON.stringify(value);
		return String(value);
	}

	function parseCellValueForPaste(text: string, _columnId: string): unknown {
		// Try to parse as JSON (for arrays)
		if (text.startsWith('[') || text.startsWith('{')) {
			try {
				return JSON.parse(text);
			} catch {
				// Not valid JSON
			}
		}

		// Try to parse as number
		const num = Number(text);
		if (!isNaN(num) && text.trim() !== '') {
			return num;
		}

		// Try to parse as boolean
		if (text.toLowerCase() === 'true') return true;
		if (text.toLowerCase() === 'false') return false;

		return text;
	}

	// ========================================
	// Delete/Clear Operations
	// ========================================

	function clearSelectedCells() {
		if (readOnly) return;

		const updates: UpdateCell[] = [];
		for (const cellKey of selectionState.selectedCells) {
			const { rowIndex, columnId } = parseCellKey(cellKey);
			updates.push({ rowIndex, columnId, value: null });
		}

		if (updates.length > 0) {
			onPaste?.(updates);
		}
	}

	function deleteSelectedRows() {
		if (readOnly || !onRowsDeleteProp) return;

		const rows = table.getRowModel().rows;
		const selectedRowIndices = new Set<number>();

		for (const cellKey of selectionState.selectedCells) {
			const { rowIndex } = parseCellKey(cellKey);
			selectedRowIndices.add(rowIndex);
		}

		const rowIndices = Array.from(selectedRowIndices).sort((a, b) => b - a);
		const rowsToDelete = rowIndices.map((idx) => rows[idx]?.original).filter(Boolean) as TData[];

		if (rowsToDelete.length > 0) {
			onRowsDeleteProp(rowsToDelete, rowIndices);
			clearSelection();
		}
	}

	// ========================================
	// Search
	// ========================================

	function performSearch(query: string) {
		if (!query.trim()) {
			searchMatches = [];
			matchIndex = 0;
			return;
		}

		const rows = table.getRowModel().rows;
		const cols = getNavigableColumns();
		const matches: CellPosition[] = [];
		const lowerQuery = query.toLowerCase();

		for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
			const row = rows[rowIndex];
			if (!row) continue;

			for (const col of cols) {
				const value = row.getValue(col.id);
				const strValue = String(value ?? '').toLowerCase();
				if (strValue.includes(lowerQuery)) {
					matches.push({ rowIndex, columnId: col.id });
				}
			}
		}

		searchMatches = matches;
		matchIndex = 0;

		// Focus first match
		if (matches.length > 0 && matches[0]) {
			focusCell(matches[0].rowIndex, matches[0].columnId);
		}
	}

	function navigateToNextMatch() {
		if (searchMatches.length === 0) return;

		const newIndex = (matchIndex + 1) % searchMatches.length;
		matchIndex = newIndex;

		const match = searchMatches[newIndex];
		if (match) {
			focusCell(match.rowIndex, match.columnId);
		}
	}

	function navigateToPrevMatch() {
		if (searchMatches.length === 0) return;

		const newIndex = (matchIndex - 1 + searchMatches.length) % searchMatches.length;
		matchIndex = newIndex;

		const match = searchMatches[newIndex];
		if (match) {
			focusCell(match.rowIndex, match.columnId);
		}
	}

	// ========================================
	// Context Menu
	// ========================================

	function onCellContextMenu(rowIndex: number, columnId: string, event: MouseEvent) {
		event.preventDefault();

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
			searchOpen = !searchOpen;
			return;
		}

		// Copy
		if ((event.ctrlKey || event.metaKey) && event.key === 'c') {
			event.preventDefault();
			copySelectedCells();
			return;
		}

		// Cut
		if ((event.ctrlKey || event.metaKey) && event.key === 'x') {
			event.preventDefault();
			cutSelectedCells();
			return;
		}

		// Paste
		if ((event.ctrlKey || event.metaKey) && event.key === 'v') {
			event.preventDefault();
			pasteFromClipboard();
			return;
		}

		// Select all
		if ((event.ctrlKey || event.metaKey) && event.key === 'a') {
			event.preventDefault();
			selectAll();
			return;
		}

		// Delete/Backspace
		if (event.key === 'Delete' || event.key === 'Backspace') {
			if (!editingCell) {
				event.preventDefault();
				clearSelectedCells();
				return;
			}
		}

		// Escape
		if (event.key === 'Escape') {
			event.preventDefault();
			if (editingCell) {
				stopEditing();
			} else if (searchOpen) {
				searchOpen = false;
			} else {
				clearSelection();
			}
			return;
		}

		// Don't handle navigation while editing
		if (editingCell) return;

		// Navigation
		const navigationMap: Record<string, NavigationDirection> = {
			ArrowUp: 'up',
			ArrowDown: 'down',
			ArrowLeft: 'left',
			ArrowRight: 'right',
			Home: event.ctrlKey || event.metaKey ? 'ctrl+home' : 'home',
			End: event.ctrlKey || event.metaKey ? 'ctrl+end' : 'end',
			PageUp: 'pageup',
			PageDown: 'pagedown'
		};

		const direction = navigationMap[event.key];
		if (direction) {
			event.preventDefault();

			if (event.shiftKey && focusedCell) {
				// Extend selection
				const newPos = getNavigationTarget(direction);
				if (newPos) {
					selectRange(focusedCell, newPos);
				}
			} else {
				navigateCell(direction);
			}
			return;
		}

		// Tab navigation
		if (event.key === 'Tab') {
			event.preventDefault();
			navigateCell(event.shiftKey ? 'left' : 'right');
			return;
		}

		// Enter to start editing or move down
		if (event.key === 'Enter' && focusedCell) {
			event.preventDefault();
			startEditing(focusedCell.rowIndex, focusedCell.columnId);
			return;
		}

		// F2 to start editing
		if (event.key === 'F2' && focusedCell) {
			event.preventDefault();
			startEditing(focusedCell.rowIndex, focusedCell.columnId);
			return;
		}

		// Typing starts editing
		if (
			focusedCell &&
			!readOnly &&
			event.key.length === 1 &&
			!event.ctrlKey &&
			!event.metaKey
		) {
			startEditing(focusedCell.rowIndex, focusedCell.columnId);
		}
	}

	function getNavigationTarget(direction: NavigationDirection): CellPosition | null {
		if (!focusedCell) return null;

		const rows = table.getRowModel().rows;
		const { rowIndex, columnId } = focusedCell;

		let newRowIndex = rowIndex;
		let newColumnId: string | null = columnId;

		switch (direction) {
			case 'up':
				newRowIndex = Math.max(0, rowIndex - 1);
				break;
			case 'down':
				newRowIndex = Math.min(rows.length - 1, rowIndex + 1);
				break;
			case 'left':
				newColumnId = getNextNavigableColumnId(columnId, 'left');
				break;
			case 'right':
				newColumnId = getNextNavigableColumnId(columnId, 'right');
				break;
			case 'home':
				newColumnId = getFirstNavigableColumnId();
				break;
			case 'end':
				newColumnId = getLastNavigableColumnId();
				break;
			case 'ctrl+home':
				newRowIndex = 0;
				newColumnId = getFirstNavigableColumnId();
				break;
			case 'ctrl+end':
				newRowIndex = rows.length - 1;
				newColumnId = getLastNavigableColumnId();
				break;
			case 'pageup':
				newRowIndex = Math.max(0, rowIndex - 10);
				break;
			case 'pagedown':
				newRowIndex = Math.min(rows.length - 1, rowIndex + 10);
				break;
		}

		if (newColumnId) {
			return { rowIndex: newRowIndex, columnId: newColumnId };
		}
		return null;
	}

	// ========================================
	// Row Add Handler
	// ========================================

	async function handleRowAdd(event?: MouseEvent) {
		if (!onRowAddProp) return;

		const result = await onRowAddProp(event);
		if (result) {
			const rows = table.getRowModel().rows;
			const newRowIndex = result.rowIndex ?? rows.length;
			const newColumnId = result.columnId ?? getFirstNavigableColumnId();

			if (newColumnId) {
				// Wait for table to update
				queueMicrotask(() => {
					focusCell(newRowIndex, newColumnId);
				});
			}
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

	const tableOptions: TableOptionsResolved<TData> = {
		data,
		columns,
		...(getRowId ? { getRowId } : {}),
		state: {
			sorting,
			columnFilters,
			rowSelection,
			columnPinning,
			columnVisibility,
			columnSizing
		},
		onColumnSizingChange: (updater) => {
			columnSizing = typeof updater === 'function' ? updater(columnSizing) : updater;
		},
		onColumnPinningChange: (updater) => {
			columnPinning = typeof updater === 'function' ? updater(columnPinning) : updater;
		},
		onColumnVisibilityChange: (updater) => {
			columnVisibility = typeof updater === 'function' ? updater(columnVisibility) : updater;
		},
		onSortingChange: (updater) => {
			sorting = typeof updater === 'function' ? updater(sorting) : updater;
		},
		onColumnFiltersChange: (updater) => {
			columnFilters = typeof updater === 'function' ? updater(columnFilters) : updater;
		},
		onRowSelectionChange: (updater) => {
			rowSelection = typeof updater === 'function' ? updater(rowSelection) : updater;
		},
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		columnResizeMode: 'onChange',
		enableRowSelection: true,
		renderFallbackValue: null,
		onStateChange: () => {},
		mergeOptions: (defaultOptions: TableOptions<TData>, newOptions: Partial<TableOptions<TData>>) => {
			return { ...defaultOptions, ...newOptions };
		},
		meta: {
			dataGridRef,
			cellMapRef,
			focusedCell,
			editingCell,
			selectionState,
			searchOpen,
			readOnly,
			rowHeight,
			contextMenu,
			pasteDialog,
			getIsCellSelected,
			getIsSearchMatch,
			getIsActiveSearchMatch,
			onRowHeightChange: (value) => {
				rowHeight = value;
			},
			onCellClick: selectCell,
			onCellDoubleClick: (rowIndex, columnId) => startEditing(rowIndex, columnId),
			onCellMouseDown,
			onCellMouseEnter,
			onCellMouseUp,
			onCellContextMenu,
			onCellEditingStart: startEditing,
			onCellEditingStop: stopEditing,
			onDataUpdate: (update) => {
				const updates = Array.isArray(update) ? update : [update];
				onPaste?.(updates);
			},
			onRowsDelete: (rowIndices) => {
				const rows = table.getRowModel().rows;
				const rowsToDelete = rowIndices.map((idx) => rows[idx]?.original).filter(Boolean) as TData[];
				onRowsDeleteProp?.(rowsToDelete, rowIndices);
			},
			onCellsCopy: copySelectedCells,
			onCellsCut: cutSelectedCells,
			onFilesUpload,
			onFilesDelete,
			onContextMenuOpenChange: (open) => {
				contextMenu = { ...contextMenu, open };
			},
			onPasteDialogOpenChange: (open) => {
				pasteDialog = { ...pasteDialog, open };
			},
			onPasteWithExpansion: async () => {
				if (onRowsAdd) {
					await onRowsAdd(pasteDialog.rowsNeeded);
					const cols = getNavigableColumns();
					const startPos = focusedCell || { rowIndex: 0, columnId: cols[0]?.id || '' };
					const startColIndex = cols.findIndex((c) => c.id === startPos.columnId);
					performPaste(pasteDialog.clipboardText, startPos, startColIndex);
				}
				pasteDialog = { ...pasteDialog, open: false };
			},
			onPasteWithoutExpansion: () => {
				const cols = getNavigableColumns();
				const startPos = focusedCell || { rowIndex: 0, columnId: cols[0]?.id || '' };
				const startColIndex = cols.findIndex((c) => c.id === startPos.columnId);
				performPaste(pasteDialog.clipboardText, startPos, startColIndex);
				pasteDialog = { ...pasteDialog, open: false };
			}
		}
	};

	const table = createTable(tableOptions);

	// ========================================
	// Compute columnSizeVars (now that table exists)
	// ========================================

	// Compute column sizes based on columnSizing state
	function getColumnSizeVars(): Record<string, number> {
		const vars: Record<string, number> = {};
		try {
			const headers = table.getFlatHeaders();
			for (const header of headers) {
				const size = columnSizing[header.column.id] ?? header.column.columnDef.size ?? 150;
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

	// Effect to create virtualizer when ref becomes available
	$effect(() => {
		const ref = dataGridRef;
		if (!ref) return;

		// Only create virtualizer once
		if (virtualizer) return;

		const rowCount = untrack(() => data.length);

		virtualizer = new Virtualizer<HTMLDivElement, Element>({
			count: rowCount,
			getScrollElement: () => ref,
			estimateSize: () => getRowHeightValue(rowHeight),
			overscan,
			observeElementRect,
			observeElementOffset,
			scrollToFn: elementScroll,
			onChange: handleVirtualizerChange
		});

		virtualizer._willUpdate();
		handleVirtualizerChange(virtualizer);
	});

	// Separate effect to update virtualizer count when data changes
	// Only track data.length - use untrack for everything else
	$effect(() => {
		const rowCount = data.length;

		untrack(() => {
			const ref = dataGridRef;
			if (virtualizer && ref) {
				virtualizer.setOptions({
					count: rowCount,
					getScrollElement: () => ref,
					estimateSize: () => getRowHeightValue(rowHeight),
					overscan,
					observeElementRect,
					observeElementOffset,
					scrollToFn: elementScroll,
					onChange: handleVirtualizerChange
				});
				virtualizer._willUpdate();
			}
		});
	});

	// Setup keyboard handler
	$effect(() => {
		if (dataGridRef) {
			dataGridRef.addEventListener('keydown', handleKeyDown);
			return () => {
				dataGridRef?.removeEventListener('keydown', handleKeyDown);
			};
		}
	});

	// Auto-focus on mount
	$effect(() => {
		if (autoFocus && dataGridRef) {
			queueMicrotask(() => {
				dataGridRef?.focus();

				const firstColumnId = getFirstNavigableColumnId();
				if (firstColumnId) {
					if (typeof autoFocus === 'object') {
						focusCell(autoFocus.rowIndex ?? 0, autoFocus.columnId ?? firstColumnId);
					} else {
						focusCell(0, firstColumnId);
					}
				}
			});
		}
	});

	// ========================================
	// Create Search State (if enabled)
	// ========================================

	const searchStateReturn: SearchState | undefined = enableSearch
		? {
				searchMatches,
				matchIndex,
				searchOpen,
				onSearchOpenChange: (open) => {
					searchOpen = open;
				},
				searchQuery,
				onSearchQueryChange: (query) => {
					searchQuery = query;
				},
				onSearch: performSearch,
				onNavigateToNextMatch: navigateToNextMatch,
				onNavigateToPrevMatch: navigateToPrevMatch
		  }
		: undefined;

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

	return {
		dataGridRef,
		headerRef,
		rowMapRef,
		footerRef,
		table,
		rowVirtualizer,
		searchState: searchStateReturn,
		get columnSizeVars() {
			return getColumnSizeVars();
		},
		onRowAdd: onRowAddProp ? handleRowAdd : undefined,
		setDataGridRef: (el) => {
			dataGridRef = el;
		},
		setHeaderRef: (el) => {
			headerRef = el;
		},
		setFooterRef: (el) => {
			footerRef = el;
		}
	};
}
