// Data Table Types for TableCN-Svelte
// These types define the core data structures for the server-side data table

import type {
	ColumnDef,
	Row,
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
import {
	dataTableConfig,
	DATA_TABLE_BOOLEAN_OPERATORS,
	DATA_TABLE_DATE_OPERATORS,
	DATA_TABLE_MULTI_SELECT_OPERATORS,
	DATA_TABLE_NUMERIC_OPERATORS,
	DATA_TABLE_SELECT_OPERATORS,
	DATA_TABLE_TEXT_OPERATORS
} from '$lib/config/data-table.js';

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

export type FilterVariant = (typeof dataTableConfig)['filterVariants'][number];

export type JoinOperator = (typeof dataTableConfig)['joinOperators'][number];

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

export const TEXT_OPERATORS = DATA_TABLE_TEXT_OPERATORS;
export const NUMBER_OPERATORS = DATA_TABLE_NUMERIC_OPERATORS;
export const DATE_OPERATORS = DATA_TABLE_DATE_OPERATORS;
export const SELECT_OPERATORS = DATA_TABLE_SELECT_OPERATORS;
export const MULTI_SELECT_OPERATORS = DATA_TABLE_MULTI_SELECT_OPERATORS;
export const BOOLEAN_OPERATORS = DATA_TABLE_BOOLEAN_OPERATORS;

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

export interface DataTableRowAction<TData> {
	row: Row<TData>;
	variant: 'update' | 'delete';
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
export function getFilterOperators(variant: FilterVariant): ReadonlyArray<FilterOperatorDef> {
	const operatorMap = {
		text: dataTableConfig.textOperators,
		number: dataTableConfig.numericOperators,
		range: dataTableConfig.numericOperators,
		date: dataTableConfig.dateOperators,
		dateRange: dataTableConfig.dateOperators,
		boolean: dataTableConfig.booleanOperators,
		select: dataTableConfig.selectOperators,
		multiSelect: dataTableConfig.multiSelectOperators
	} satisfies Record<FilterVariant, ReadonlyArray<FilterOperatorDef>>;

	return operatorMap[variant] ?? dataTableConfig.textOperators;
}

/**
 * Gets the default filter operator for a given filter variant
 */
export function getDefaultFilterOperator(variant: FilterVariant): FilterOperator {
	return getFilterOperators(variant)[0]?.value ?? (variant === 'text' ? 'contains' : 'equals');
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
