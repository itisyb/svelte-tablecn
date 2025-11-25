// Data Grid Store - Class-based reactive store using Svelte 5 runes
// File extension MUST be .svelte.ts to use runes in classes

import type { SortingState, ColumnFiltersState, RowSelectionState } from '@tanstack/table-core';
import type {
	CellPosition,
	CellRange,
	RowHeightValue,
	ContextMenuState,
	PasteDialogState,
	SearchStateData,
	SearchMatch
} from '$lib/types/data-grid';
import { getCellKey } from '$lib/types/data-grid';

class DataGridStore<TData = unknown> {
	// ============================================
	// Private Reactive State (using $state rune)
	// ============================================

	private _data = $state<TData[]>([]);
	private _sorting = $state<SortingState>([]);
	private _columnFilters = $state<ColumnFiltersState>([]);
	private _rowSelection = $state<RowSelectionState>({});
	private _columnVisibility = $state<Record<string, boolean>>({});

	private _focusedCell = $state<CellPosition | null>(null);
	private _editingCell = $state<CellPosition | null>(null);

	private _selectedCells = $state<Record<string, boolean>>({});
	private _selectionRange = $state<CellRange | null>(null);
	private _isSelecting = $state(false);
	private _cutCells = $state<Record<string, boolean>>({});

	private _rowHeight = $state<RowHeightValue>('medium');
	private _readOnly = $state(false);

	private _contextMenu = $state<ContextMenuState>({
		open: false,
		x: 0,
		y: 0
	});

	private _pasteDialog = $state<PasteDialogState>({
		open: false,
		rowsNeeded: 0,
		clipboardText: ''
	});

	private _searchState = $state<SearchStateData>({
		searchOpen: false,
		searchQuery: '',
		searchMatches: [],
		matchIndex: 0
	});

	private _cellMap = $state<Record<string, HTMLDivElement>>({});
	private _dataGridRef = $state<HTMLElement | null>(null);

	// Column order for navigation
	private _columnOrder = $state<string[]>([]);

	// ============================================
	// Public Getters (for reactive reads)
	// ============================================

	get data() {
		return this._data;
	}
	get sorting() {
		return this._sorting;
	}
	get columnFilters() {
		return this._columnFilters;
	}
	get rowSelection() {
		return this._rowSelection;
	}
	get columnVisibility() {
		return this._columnVisibility;
	}
	get focusedCell() {
		return this._focusedCell;
	}
	get editingCell() {
		return this._editingCell;
	}
	get selectedCells() {
		return this._selectedCells;
	}
	get selectionRange() {
		return this._selectionRange;
	}
	get isSelecting() {
		return this._isSelecting;
	}
	get cutCells() {
		return this._cutCells;
	}
	get rowHeight() {
		return this._rowHeight;
	}
	get readOnly() {
		return this._readOnly;
	}
	get contextMenu() {
		return this._contextMenu;
	}
	get pasteDialog() {
		return this._pasteDialog;
	}
	get searchState() {
		return this._searchState;
	}
	get cellMap() {
		return this._cellMap;
	}
	get dataGridRef() {
		return this._dataGridRef;
	}
	get columnOrder() {
		return this._columnOrder;
	}

	// ============================================
	// Computed/Derived Getters
	// ============================================

	get selectedCellCount(): number {
		return Object.keys(this._selectedCells).filter((k) => this._selectedCells[k]).length;
	}

	get isEditing(): boolean {
		return this._editingCell !== null;
	}

	get hasFocus(): boolean {
		return this._focusedCell !== null;
	}

	get currentSearchMatch(): SearchMatch | null {
		const { searchMatches, matchIndex } = this._searchState;
		return searchMatches[matchIndex] ?? null;
	}

	get selectedCellKeys(): string[] {
		return Object.keys(this._selectedCells).filter((k) => this._selectedCells[k]);
	}

	get hasSelection(): boolean {
		return this.selectedCellCount > 0;
	}

	get hasCutCells(): boolean {
		return Object.keys(this._cutCells).filter((k) => this._cutCells[k]).length > 0;
	}

	// ============================================
	// Data Methods
	// ============================================

	setData(data: TData[]) {
		this._data = data;
	}

	setColumnOrder(order: string[]) {
		this._columnOrder = order;
	}

	// ============================================
	// Focus Methods
	// ============================================

	setFocusedCell(position: CellPosition | null) {
		this._focusedCell = position;
	}

	moveFocus(direction: 'up' | 'down' | 'left' | 'right' | 'home' | 'end') {
		if (!this._focusedCell) return;

		const { rowIndex, columnId } = this._focusedCell;
		const colIndex = this._columnOrder.indexOf(columnId);

		switch (direction) {
			case 'up':
				if (rowIndex > 0) {
					this._focusedCell = { rowIndex: rowIndex - 1, columnId };
				}
				break;
			case 'down':
				if (rowIndex < this._data.length - 1) {
					this._focusedCell = { rowIndex: rowIndex + 1, columnId };
				}
				break;
			case 'left':
				if (colIndex > 0) {
					this._focusedCell = { rowIndex, columnId: this._columnOrder[colIndex - 1] };
				}
				break;
			case 'right':
				if (colIndex < this._columnOrder.length - 1) {
					this._focusedCell = { rowIndex, columnId: this._columnOrder[colIndex + 1] };
				}
				break;
			case 'home':
				this._focusedCell = { rowIndex, columnId: this._columnOrder[0] };
				break;
			case 'end':
				this._focusedCell = { rowIndex, columnId: this._columnOrder[this._columnOrder.length - 1] };
				break;
		}
	}

	moveToFirstCell() {
		if (this._data.length > 0 && this._columnOrder.length > 0) {
			this._focusedCell = { rowIndex: 0, columnId: this._columnOrder[0] };
		}
	}

	moveToLastCell() {
		if (this._data.length > 0 && this._columnOrder.length > 0) {
			this._focusedCell = {
				rowIndex: this._data.length - 1,
				columnId: this._columnOrder[this._columnOrder.length - 1]
			};
		}
	}

	// ============================================
	// Editing Methods
	// ============================================

	startEditing(position: CellPosition) {
		if (this._readOnly) return;
		this._editingCell = position;
		this._focusedCell = position;
	}

	stopEditing() {
		this._editingCell = null;
	}

	// ============================================
	// Selection Methods
	// ============================================

	selectCell(cellKey: string, addToSelection = false) {
		if (!addToSelection) {
			this._selectedCells = {};
		}
		this._selectedCells = { ...this._selectedCells, [cellKey]: true };
	}

	deselectCell(cellKey: string) {
		const newCells = { ...this._selectedCells };
		delete newCells[cellKey];
		this._selectedCells = newCells;
	}

	toggleCellSelection(cellKey: string) {
		if (this._selectedCells[cellKey]) {
			this.deselectCell(cellKey);
		} else {
			this._selectedCells = { ...this._selectedCells, [cellKey]: true };
		}
	}

	selectRange(start: CellPosition, end: CellPosition) {
		this._selectionRange = { start, end };
		const newSelection: Record<string, boolean> = {};

		const minRow = Math.min(start.rowIndex, end.rowIndex);
		const maxRow = Math.max(start.rowIndex, end.rowIndex);

		const startColIndex = this._columnOrder.indexOf(start.columnId);
		const endColIndex = this._columnOrder.indexOf(end.columnId);
		const minCol = Math.min(startColIndex, endColIndex);
		const maxCol = Math.max(startColIndex, endColIndex);

		for (let row = minRow; row <= maxRow; row++) {
			for (let col = minCol; col <= maxCol; col++) {
				const cellKey = getCellKey(row, this._columnOrder[col]);
				newSelection[cellKey] = true;
			}
		}

		this._selectedCells = newSelection;
	}

	selectColumn(columnId: string) {
		const newSelection: Record<string, boolean> = {};
		for (let row = 0; row < this._data.length; row++) {
			const cellKey = getCellKey(row, columnId);
			newSelection[cellKey] = true;
		}
		this._selectedCells = newSelection;
	}

	selectAll() {
		const newSelection: Record<string, boolean> = {};
		for (let row = 0; row < this._data.length; row++) {
			for (const columnId of this._columnOrder) {
				const cellKey = getCellKey(row, columnId);
				newSelection[cellKey] = true;
			}
		}
		this._selectedCells = newSelection;
	}

	clearSelection() {
		this._selectedCells = {};
		this._selectionRange = null;
	}

	setIsSelecting(isSelecting: boolean) {
		this._isSelecting = isSelecting;
	}

	isCellSelected(cellKey: string): boolean {
		return this._selectedCells[cellKey] === true;
	}

	// ============================================
	// Copy/Cut/Paste Methods
	// ============================================

	markCellsAsCut() {
		this._cutCells = { ...this._selectedCells };
	}

	clearCut() {
		this._cutCells = {};
	}

	isCellCut(cellKey: string): boolean {
		return this._cutCells[cellKey] === true;
	}

	// ============================================
	// Context Menu Methods
	// ============================================

	openContextMenu(x: number, y: number) {
		this._contextMenu = { open: true, x, y };
	}

	closeContextMenu() {
		this._contextMenu = { ...this._contextMenu, open: false };
	}

	// ============================================
	// Paste Dialog Methods
	// ============================================

	openPasteDialog(rowsNeeded: number, clipboardText: string) {
		this._pasteDialog = { open: true, rowsNeeded, clipboardText };
	}

	closePasteDialog() {
		this._pasteDialog = { open: false, rowsNeeded: 0, clipboardText: '' };
	}

	// ============================================
	// Search Methods
	// ============================================

	openSearch() {
		this._searchState = { ...this._searchState, searchOpen: true };
	}

	closeSearch() {
		this._searchState = {
			searchOpen: false,
			searchQuery: '',
			searchMatches: [],
			matchIndex: 0
		};
	}

	setSearchQuery(query: string) {
		this._searchState = { ...this._searchState, searchQuery: query };
	}

	setSearchMatches(matches: SearchMatch[]) {
		this._searchState = { ...this._searchState, searchMatches: matches, matchIndex: 0 };
	}

	nextMatch() {
		const { searchMatches, matchIndex } = this._searchState;
		if (searchMatches.length > 0) {
			const newIndex = (matchIndex + 1) % searchMatches.length;
			this._searchState = { ...this._searchState, matchIndex: newIndex };

			// Focus the matched cell
			const match = searchMatches[newIndex];
			if (match) {
				this.setFocusedCell({ rowIndex: match.rowIndex, columnId: match.columnId });
			}
		}
	}

	previousMatch() {
		const { searchMatches, matchIndex } = this._searchState;
		if (searchMatches.length > 0) {
			const newIndex = matchIndex === 0 ? searchMatches.length - 1 : matchIndex - 1;
			this._searchState = { ...this._searchState, matchIndex: newIndex };

			// Focus the matched cell
			const match = searchMatches[newIndex];
			if (match) {
				this.setFocusedCell({ rowIndex: match.rowIndex, columnId: match.columnId });
			}
		}
	}

	// ============================================
	// Row Height Methods
	// ============================================

	setRowHeight(height: RowHeightValue) {
		this._rowHeight = height;
	}

	setReadOnly(readOnly: boolean) {
		this._readOnly = readOnly;
	}

	// ============================================
	// Table State Methods
	// ============================================

	setSorting(sorting: SortingState) {
		this._sorting = sorting;
	}

	setColumnFilters(filters: ColumnFiltersState) {
		this._columnFilters = filters;
	}

	setRowSelection(selection: RowSelectionState) {
		this._rowSelection = selection;
	}

	setColumnVisibility(visibility: Record<string, boolean>) {
		this._columnVisibility = visibility;
	}

	// ============================================
	// Element Reference Methods
	// ============================================

	registerCell(cellKey: string, element: HTMLDivElement) {
		this._cellMap = { ...this._cellMap, [cellKey]: element };
	}

	unregisterCell(cellKey: string) {
		const newMap = { ...this._cellMap };
		delete newMap[cellKey];
		this._cellMap = newMap;
	}

	getCellElement(cellKey: string): HTMLDivElement | undefined {
		return this._cellMap[cellKey];
	}

	setDataGridRef(ref: HTMLElement | null) {
		this._dataGridRef = ref;
	}

	// ============================================
	// Utility Methods
	// ============================================

	isCellFocused(rowIndex: number, columnId: string): boolean {
		return this._focusedCell?.rowIndex === rowIndex && this._focusedCell?.columnId === columnId;
	}

	isCellEditing(rowIndex: number, columnId: string): boolean {
		return this._editingCell?.rowIndex === rowIndex && this._editingCell?.columnId === columnId;
	}

	// ============================================
	// Reset Methods
	// ============================================

	reset() {
		this._focusedCell = null;
		this._editingCell = null;
		this._selectedCells = {};
		this._selectionRange = null;
		this._cutCells = {};
		this._contextMenu = { open: false, x: 0, y: 0 };
		this._pasteDialog = { open: false, rowsNeeded: 0, clipboardText: '' };
		this._searchState = {
			searchOpen: false,
			searchQuery: '',
			searchMatches: [],
			matchIndex: 0
		};
	}

	resetAll() {
		this.reset();
		this._data = [];
		this._sorting = [];
		this._columnFilters = [];
		this._rowSelection = {};
		this._columnVisibility = {};
		this._rowHeight = 'medium';
		this._readOnly = false;
		this._cellMap = {};
		this._dataGridRef = null;
		this._columnOrder = [];
	}
}

// Export singleton instance for global use
export const dataGridStore = new DataGridStore();

// Also export the class for creating scoped instances
export { DataGridStore };

// Factory function for creating typed store instances
export function createDataGridStore<TData>(): DataGridStore<TData> {
	return new DataGridStore<TData>();
}
