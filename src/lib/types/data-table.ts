// Data Table Types for TableCN-Svelte
// These types define the core data structures for the server-side data table

import type {
	ColumnDef,
	Table,
	SortingState,
	ColumnFiltersState,
	VisibilityState,
	PaginationState,
	RowSelectionState
} from '@tanstack/table-core';

// Re-export filter operator types from data-grid to avoid duplication
import type { FilterOperator as FilterOperatorType } from './data-grid.js';
export type {
	TextFilterOperator,
	NumberFilterOperator,
	DateFilterOperator,
	SelectFilterOperator,
	BooleanFilterOperator,
	FilterOperator
} from './data-grid.js';

// Local type alias for use in this file
type FilterOperator = FilterOperatorType;

export type FilterVariant =
	| 'text'
	| 'number'
	| 'range'
	| 'date'
	| 'dateRange'
	| 'boolean'
	| 'select'
	| 'multiSelect';

export type JoinOperator = 'and' | 'or';

// ============================================
// Filter Operator Definitions
// ============================================

export interface FilterOperatorDef {
	label: string;
	value: FilterOperator;
}

export const TEXT_OPERATORS: FilterOperatorDef[] = [
	{ label: 'Contains', value: 'contains' },
	{ label: 'Does not contain', value: 'notContains' },
	{ label: 'Equals', value: 'equals' },
	{ label: 'Does not equal', value: 'notEquals' },
	{ label: 'Starts with', value: 'startsWith' },
	{ label: 'Ends with', value: 'endsWith' },
	{ label: 'Is empty', value: 'isEmpty' },
	{ label: 'Is not empty', value: 'isNotEmpty' }
];

export const NUMBER_OPERATORS: FilterOperatorDef[] = [
	{ label: 'Equals', value: 'equals' },
	{ label: 'Does not equal', value: 'notEquals' },
	{ label: 'Less than', value: 'lessThan' },
	{ label: 'Less than or equal', value: 'lessThanOrEqual' },
	{ label: 'Greater than', value: 'greaterThan' },
	{ label: 'Greater than or equal', value: 'greaterThanOrEqual' },
	{ label: 'Between', value: 'between' },
	{ label: 'Is empty', value: 'isEmpty' },
	{ label: 'Is not empty', value: 'isNotEmpty' }
];

export const DATE_OPERATORS: FilterOperatorDef[] = [
	{ label: 'Equals', value: 'equals' },
	{ label: 'Does not equal', value: 'notEquals' },
	{ label: 'Before', value: 'before' },
	{ label: 'After', value: 'after' },
	{ label: 'Between', value: 'between' },
	{ label: 'Is empty', value: 'isEmpty' },
	{ label: 'Is not empty', value: 'isNotEmpty' }
];

export const SELECT_OPERATORS: FilterOperatorDef[] = [
	{ label: 'Is', value: 'is' },
	{ label: 'Is not', value: 'isNot' },
	{ label: 'Is any of', value: 'isAnyOf' },
	{ label: 'Is none of', value: 'isNoneOf' },
	{ label: 'Is empty', value: 'isEmpty' },
	{ label: 'Is not empty', value: 'isNotEmpty' }
];

export const BOOLEAN_OPERATORS: FilterOperatorDef[] = [
	{ label: 'Is true', value: 'isTrue' },
	{ label: 'Is false', value: 'isFalse' }
];

// ============================================
// Extended Column Types
// ============================================

export interface ExtendedColumnFilter<TData> {
	id: keyof TData & string;
	value: unknown;
	operator: FilterOperator;
}

export interface ExtendedColumnSort<TData> {
	id: keyof TData & string;
	desc: boolean;
}

// ============================================
// Column Meta Extension for Data Table
// ============================================

declare module '@tanstack/table-core' {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	interface ColumnMeta<TData, TValue> {
		// Data Table specific
		label?: string;
		placeholder?: string;
		variant?: FilterVariant;
		options?: { label: string; value: string }[];
		range?: [number, number];
		unit?: string;
	}
}

// ============================================
// Data Table Props
// ============================================

export interface UseDataTableOptions<TData> {
	data: TData[];
	columns: ColumnDef<TData, unknown>[];
	pageCount?: number;
	initialState?: {
		sorting?: SortingState;
		columnFilters?: ColumnFiltersState;
		columnVisibility?: VisibilityState;
		pagination?: PaginationState;
		rowSelection?: RowSelectionState;
	};
	enableRowSelection?: boolean;
	enableMultiSort?: boolean;
	manualPagination?: boolean;
	manualSorting?: boolean;
	manualFiltering?: boolean;
}

export interface UseDataTableReturn<TData> {
	table: Table<TData>;
	// State
	sorting: SortingState;
	columnFilters: ColumnFiltersState;
	columnVisibility: VisibilityState;
	rowSelection: RowSelectionState;
	pagination: PaginationState;
	// Setters
	setSorting: (sorting: SortingState) => void;
	setColumnFilters: (filters: ColumnFiltersState) => void;
	setColumnVisibility: (visibility: VisibilityState) => void;
	setRowSelection: (selection: RowSelectionState) => void;
	setPagination: (pagination: PaginationState) => void;
}

// ============================================
// Utility Functions
// ============================================

/**
 * Gets the filter operators for a given filter variant
 */
export function getFilterOperators(variant: FilterVariant): FilterOperatorDef[] {
	switch (variant) {
		case 'text':
			return TEXT_OPERATORS;
		case 'number':
		case 'range':
			return NUMBER_OPERATORS;
		case 'date':
		case 'dateRange':
			return DATE_OPERATORS;
		case 'select':
		case 'multiSelect':
			return SELECT_OPERATORS;
		case 'boolean':
			return BOOLEAN_OPERATORS;
		default:
			return TEXT_OPERATORS;
	}
}

/**
 * Gets the default filter operator for a given filter variant
 */
export function getDefaultFilterOperator(variant: FilterVariant): FilterOperator {
	switch (variant) {
		case 'text':
			return 'contains';
		case 'number':
		case 'range':
			return 'equals';
		case 'date':
		case 'dateRange':
			return 'equals';
		case 'select':
		case 'multiSelect':
			return 'is';
		case 'boolean':
			return 'isTrue';
		default:
			return 'contains';
	}
}

/**
 * Validates and returns valid filters (removes empty/invalid ones)
 */
export function getValidFilters<TData>(
	filters: ExtendedColumnFilter<TData>[]
): ExtendedColumnFilter<TData>[] {
	return filters.filter((filter) => {
		// Empty operators don't need a value
		if (filter.operator === 'isEmpty' || filter.operator === 'isNotEmpty') {
			return true;
		}

		// Check if value is present and not empty
		if (filter.value === undefined || filter.value === null) {
			return false;
		}

		if (typeof filter.value === 'string' && filter.value.trim() === '') {
			return false;
		}

		if (Array.isArray(filter.value) && filter.value.length === 0) {
			return false;
		}

		return true;
	});
}
