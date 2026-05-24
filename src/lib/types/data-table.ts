// Data Table Types for TableCN-Svelte
// These types define the core data structures for the server-side data table

import type {
	ColumnDef,
	Table,
	SortingState,
	ColumnFiltersState,
	VisibilityState,
	PaginationState,
	RowSelectionState,
	RowData,
	Updater
} from '@tanstack/table-core';
import type { Component } from 'svelte';
import { isCompleteRangeFilterValue } from '$lib/data-table-range-utils.js';

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

export interface DataTableOption {
	label: string;
	value: string;
	icon?: Component<{ class?: string }>;
	count?: number;
}

export interface QueryKeys {
	page: string;
	perPage: string;
	sort: string;
	filters: string;
	joinOperator: string;
}

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
	{ label: 'Between', value: 'isBetween' },
	{ label: 'Is empty', value: 'isEmpty' },
	{ label: 'Is not empty', value: 'isNotEmpty' }
];

export const DATE_OPERATORS: FilterOperatorDef[] = [
	{ label: 'Equals', value: 'equals' },
	{ label: 'Does not equal', value: 'notEquals' },
	{ label: 'Before', value: 'before' },
	{ label: 'After', value: 'after' },
	{ label: 'On or before', value: 'onOrBefore' },
	{ label: 'On or after', value: 'onOrAfter' },
	{ label: 'Between', value: 'isBetween' },
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
	value: string | string[];
	variant: FilterVariant;
	operator: FilterOperator;
	filterId: string;
}

export interface ExtendedColumnSort<TData> {
	id: keyof TData & string;
	desc: boolean;
}

// ============================================
// Column Meta Extension for Data Table
// ============================================

declare module '@tanstack/table-core' {
	interface TableMeta<TData extends RowData> {
		queryKeys?: QueryKeys;
		joinOperator?: JoinOperator;
		setJoinOperator?: (value: JoinOperator) => void;
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	interface ColumnMeta<TData, TValue> {
		// Data Table specific
		label?: string;
		icon?: Component<{ class?: string }>;
		placeholder?: string;
		variant?: FilterVariant;
		options?: DataTableOption[];
		range?: [number, number];
		unit?: string;
	}
}

// ============================================
// Data Table Props
// ============================================

export interface UseDataTableOptions<TData> {
	data: TData[] | (() => TData[]);
	columns: ColumnDef<TData, unknown>[] | (() => ColumnDef<TData, unknown>[]);
	pageCount?: number;
	getRowId?: (row: TData, index: number) => string;
	queryKeys?: Partial<QueryKeys>;
	history?: 'push' | 'replace';
	debounceMs?: number;
	throttleMs?: number;
	clearOnDefault?: boolean;
	enableAdvancedFilter?: boolean | (() => boolean);
	scroll?: boolean;
	shallow?: boolean;
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
	joinOperator: JoinOperator;
	// Setters
	setSorting: (sorting: SortingState) => void;
	setColumnFilters: (updater: Updater<ColumnFiltersState>) => void;
	setColumnVisibility: (visibility: VisibilityState) => void;
	setRowSelection: (selection: RowSelectionState) => void;
	setPagination: (pagination: PaginationState) => void;
	setJoinOperator: (joinOperator: JoinOperator) => void;
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
			return 'equals';
		case 'range':
			return 'isBetween';
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
		// Empty / boolean operators don't need a value
		if (
			filter.operator === 'isEmpty' ||
			filter.operator === 'isNotEmpty' ||
			filter.operator === 'isTrue' ||
			filter.operator === 'isFalse'
		) {
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

		if (filter.operator === 'isBetween') {
			return isCompleteRangeFilterValue(filter.value);
		}

		return true;
	});
}
