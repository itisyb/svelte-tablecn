// Data Grid Types for TableCN-Svelte
// Exact port of TableCN React types for Svelte 5

import type {
	ColumnDef,
	Table,
	Row,
	Cell,
	Column,
	RowData
} from '@tanstack/table-core';
import type { SvelteSet, SvelteMap } from 'svelte/reactivity';
import type { Snippet, Component } from 'svelte';

// ============================================
// Base Types
// ============================================

export interface Option {
	label: string;
	value: string;
}

export type RowHeightValue = 'short' | 'medium' | 'tall' | 'extra-tall';

export interface CellSelectOption {
	label: string;
	value: string;
	icon?: Component;
	count?: number;
}

// ============================================
// Cell Types
// ============================================

export type CellOpts =
	| { variant: 'short-text' }
	| { variant: 'long-text' }
	| { variant: 'number'; min?: number; max?: number; step?: number }
	| { variant: 'select'; options: CellSelectOption[] }
	| { variant: 'multi-select'; options: CellSelectOption[] }
	| { variant: 'checkbox' }
	| { variant: 'date' }
	| { variant: 'url' }
	| { variant: 'row-select' }
	| {
			variant: 'file';
			maxFileSize?: number;
			maxFiles?: number;
			accept?: string;
			multiple?: boolean;
	  };

export interface UpdateCell {
	rowIndex: number;
	columnId: string;
	value: unknown;
}

// ============================================
// Position & Selection Types
// ============================================

export interface CellPosition {
	rowIndex: number;
	columnId: string;
}

export interface CellRange {
	start: CellPosition;
	end: CellPosition;
}

export interface SelectionState {
	selectedCells: Set<string>;
	selectionRange: CellRange | null;
	isSelecting: boolean;
}

// ============================================
// Context Menu Types
// ============================================

export interface ContextMenuState {
	open: boolean;
	x: number;
	y: number;
}

// ============================================
// Paste Dialog Types
// ============================================

export interface PasteDialogState {
	open: boolean;
	rowsNeeded: number;
	clipboardText: string;
}

// ============================================
// Navigation Types
// ============================================

export type NavigationDirection =
	| 'up'
	| 'down'
	| 'left'
	| 'right'
	| 'home'
	| 'end'
	| 'ctrl+home'
	| 'ctrl+end'
	| 'pageup'
	| 'pagedown';

// ============================================
// Search Types
// ============================================

// Type alias for search match - same as CellPosition
export type SearchMatch = CellPosition;

// Data-only search state (used by stores)
export interface SearchStateData {
	searchOpen: boolean;
	searchQuery: string;
	searchMatches: SearchMatch[];
	matchIndex: number;
}

// Full search state with callbacks (used by components)
export interface SearchState extends SearchStateData {
	onSearchOpenChange: (open: boolean) => void;
	onSearchQueryChange: (query: string) => void;
	onSearch: (query: string) => void;
	onNavigateToNextMatch: () => void;
	onNavigateToPrevMatch: () => void;
}

// ============================================
// Cell Variant Props
// ============================================

export interface CellVariantProps<TData> {
	cell: Cell<TData, unknown>;
	table: Table<TData>;
	rowIndex: number;
	columnId: string;
	isEditing: boolean;
	isFocused: boolean;
	isSelected: boolean;
	readOnly?: boolean;
	/** Centralized cell value with fine-grained reactivity from SvelteMap */
	cellValue: unknown;
}

// ============================================
// File Cell Types
// ============================================

export interface FileCellData {
	id: string;
	name: string;
	size: number;
	type: string;
	url?: string;
}

// ============================================
// Filter Types
// ============================================

export type TextFilterOperator =
	| 'contains'
	| 'notContains'
	| 'equals'
	| 'notEquals'
	| 'startsWith'
	| 'endsWith'
	| 'isEmpty'
	| 'isNotEmpty';

export type NumberFilterOperator =
	| 'equals'
	| 'notEquals'
	| 'lessThan'
	| 'lessThanOrEqual'
	| 'greaterThan'
	| 'greaterThanOrEqual'
	| 'between'
	| 'isEmpty'
	| 'isNotEmpty';

export type DateFilterOperator =
	| 'equals'
	| 'notEquals'
	| 'before'
	| 'after'
	| 'onOrBefore'
	| 'onOrAfter'
	| 'between'
	| 'isEmpty'
	| 'isNotEmpty';

export type SelectFilterOperator =
	| 'is'
	| 'isNot'
	| 'isAnyOf'
	| 'isNoneOf'
	| 'isEmpty'
	| 'isNotEmpty';

export type BooleanFilterOperator = 'isTrue' | 'isFalse';

export type FilterOperator =
	| TextFilterOperator
	| NumberFilterOperator
	| DateFilterOperator
	| SelectFilterOperator
	| BooleanFilterOperator;

export interface FilterValue {
	operator: FilterOperator;
	value?: string | number | string[];
	value2?: string | number;
}

// ============================================
// TanStack Table Meta Extension
// ============================================

declare module '@tanstack/table-core' {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	interface ColumnMeta<TData extends RowData, TValue> {
		label?: string;
		cell?: CellOpts;
	}

	interface TableMeta<TData extends RowData> {
		dataGridRef?: HTMLElement | null;
		cellMapRef?: Map<string, HTMLDivElement>;
		focusedCell?: CellPosition | null;
		editingCell?: CellPosition | null;
		selectionState?: SelectionState;
		searchOpen?: boolean;
		readOnly?: boolean;
		getIsCellSelected?: (rowIndex: number, columnId: string) => boolean;
		// SvelteMap for fine-grained cell value reactivity - cells access map.get(key) in $derived
		cellValueMap?: SvelteMap<string, unknown>;
		// SvelteSet for fine-grained cell selection reactivity
		selectedCellsSet?: SvelteSet<string>;
		// Version counter to force cell re-renders when selection changes
		selectionVersion?: number;
		getIsSearchMatch?: (rowIndex: number, columnId: string) => boolean;
		getIsActiveSearchMatch?: (rowIndex: number, columnId: string) => boolean;
		// SvelteSet for fine-grained reactive search match lookups
		searchMatchSet?: SvelteSet<string>;
		activeSearchMatch?: CellPosition | null;
		rowHeight?: RowHeightValue;
		onRowHeightChange?: (value: RowHeightValue) => void;
		onRowSelect?: (rowIndex: number, checked: boolean, shiftKey: boolean) => void;
		onDataUpdate?: (params: UpdateCell | UpdateCell[]) => void;
		onRowsDelete?: (rowIndices: number[]) => void | Promise<void>;
		onColumnClick?: (columnId: string) => void;
		onCellClick?: (rowIndex: number, columnId: string, event?: MouseEvent) => void;
		onCellDoubleClick?: (rowIndex: number, columnId: string) => void;
		onCellMouseDown?: (rowIndex: number, columnId: string, event: MouseEvent) => void;
		onCellMouseEnter?: (rowIndex: number, columnId: string, event: MouseEvent) => void;
		onCellMouseUp?: () => void;
		onCellContextMenu?: (rowIndex: number, columnId: string, event: MouseEvent) => void;
		onCellEditingStart?: (rowIndex: number, columnId: string) => void;
		onCellEditingStop?: (opts?: {
			direction?: NavigationDirection;
			moveToNextRow?: boolean;
		}) => void;
		onCellsCopy?: () => void;
		onCellsCut?: () => void;
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
		contextMenu?: ContextMenuState;
		onContextMenuOpenChange?: (open: boolean) => void;
		pasteDialog?: PasteDialogState;
		onPasteDialogOpenChange?: (open: boolean) => void;
		onPasteWithExpansion?: () => void;
		onPasteWithoutExpansion?: () => void;
	}
}

// ============================================
// Row Height Constants
// ============================================

export const ROW_HEIGHT_VALUES: Record<RowHeightValue, number> = {
	short: 36,
	medium: 56,
	tall: 76,
	'extra-tall': 96
};

export const ROW_LINE_COUNTS: Record<RowHeightValue, number> = {
	short: 1,
	medium: 2,
	tall: 3,
	'extra-tall': 4
};

// ============================================
// Component Props Types
// ============================================

export interface DataGridProps<TData> {
	data: TData[];
	columns: ColumnDef<TData, unknown>[];
	readOnly?: boolean;
	height?: number;
	rowHeight?: RowHeightValue;
	autoFocus?: boolean | { rowIndex?: number; columnId?: string };
	enableColumnSelection?: boolean;
	enableSearch?: boolean;
	enablePaste?: boolean;
	overscan?: number;
	class?: string;

	// Callbacks
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

	// Snippets for customization
	header?: Snippet<[{ column: Column<TData, unknown> }]>;
	cell?: Snippet<[{ cell: Cell<TData, unknown>; row: Row<TData> }]>;
	empty?: Snippet;
	footer?: Snippet;
}

// ============================================
// Utility Functions
// ============================================

/**
 * Creates a unique cell key from row index and column id
 */
export function getCellKey(rowIndex: number, columnId: string): string {
	return `${rowIndex}:${columnId}`;
}

/**
 * Parses a cell key back into row index and column id
 */
export function parseCellKey(cellKey: string): CellPosition {
	const parts = cellKey.split(':');
	const rowIndexStr = parts[0];
	const columnId = parts[1];
	if (rowIndexStr && columnId) {
		const rowIndex = parseInt(rowIndexStr, 10);
		if (!Number.isNaN(rowIndex)) {
			return { rowIndex, columnId };
		}
	}
	return { rowIndex: 0, columnId: '' };
}

/**
 * Gets the pixel height for a row height value
 */
export function getRowHeightValue(rowHeight: RowHeightValue): number {
	return ROW_HEIGHT_VALUES[rowHeight];
}

/**
 * Gets the line count for a row height value
 */
export function getLineCount(rowHeight: RowHeightValue): number {
	return ROW_LINE_COUNTS[rowHeight];
}

/**
 * Gets common pinning styles for a column (port of TableCN's getCommonPinningStyles)
 */
export function getCommonPinningStyles<TData>(params: {
	column?: Column<TData, unknown>;
	withBorder?: boolean;
}): Record<string, string | number | undefined> {
	const { column, withBorder = false } = params;

	// Return default styles if column is undefined
	if (!column) {
		return {
			position: 'relative',
			background: 'var(--background)',
			zIndex: undefined
		};
	}

	// Wrap in try-catch to handle SSR edge cases where TanStack internal state may not be ready
	try {
		const isPinned = column.getIsPinned();
		const isLastLeftPinnedColumn = isPinned === 'left' && column.getIsLastColumn('left');
		const isFirstRightPinnedColumn = isPinned === 'right' && column.getIsFirstColumn('right');

		return {
			boxShadow: withBorder
				? isLastLeftPinnedColumn
					? '-4px 0 4px -4px var(--border) inset'
					: isFirstRightPinnedColumn
						? '4px 0 4px -4px var(--border) inset'
						: undefined
				: undefined,
			left: isPinned === 'left' ? `${column.getStart('left')}px` : undefined,
			right: isPinned === 'right' ? `${column.getAfter('right')}px` : undefined,
			opacity: isPinned ? 0.97 : 1,
			position: isPinned ? 'sticky' : 'relative',
			background: isPinned ? 'var(--background)' : 'var(--background)',
			width: column.getSize(),
			zIndex: isPinned ? 1 : undefined
		};
	} catch {
		// Return default styles if column methods fail (e.g., during SSR)
		return {
			position: 'relative',
			background: 'var(--background)',
			zIndex: undefined
		};
	}
}
