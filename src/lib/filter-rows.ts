// Client-side row filtering for advanced data-table filters.
// Mirrors the role of tablecn's filter-columns.ts (Drizzle/SQL) for in-memory data.

import type { Row } from '@tanstack/table-core';
import { getFilterFn } from '$lib/data-grid-filters.js';
import type { FilterValue } from '$lib/types/data-grid.js';
import type { ExtendedColumnFilter, JoinOperator } from '$lib/types/data-table.js';
import { getValidFilters } from '$lib/types/data-table.js';
import { coerceRangeNumber } from '$lib/data-table-range-utils.js';

function toFilterValue<TData>(filter: ExtendedColumnFilter<TData>): FilterValue {
	const values = Array.isArray(filter.value) ? filter.value : [filter.value];

	if (filter.operator === 'isBetween' && values.length >= 2) {
		const min = coerceRangeNumber(values[0]);
		const max = coerceRangeNumber(values[1]);
		return {
			operator: filter.operator,
			value: min ?? values[0],
			endValue: max ?? values[1]
		};
	}

	if (filter.operator === 'isAnyOf' || filter.operator === 'isNoneOf') {
		return {
			operator: filter.operator,
			value: values
		};
	}

	return {
		operator: filter.operator,
		value: values[0]
	};
}

function createRowAdapter<TData>(
	row: TData,
	getCellValue: (row: TData, columnId: string) => unknown
): Pick<Row<TData>, 'getValue'> {
	return {
		getValue: <TValue>(columnId: string) => getCellValue(row, columnId) as TValue
	};
}

function matchesFilter<TData>(
	row: TData,
	filter: ExtendedColumnFilter<TData>,
	getCellValue: (row: TData, columnId: string) => unknown
): boolean {
	const rowAdapter = createRowAdapter(row, getCellValue);
	const filterFn = getFilterFn<TData>();
	return filterFn(rowAdapter as Row<TData>, filter.id, toFilterValue(filter), () => {});
}

/**
 * Filters rows using advanced column filters and a join operator (and/or).
 * Use for client-side demos or as a reference when building server-side SQL filters.
 */
export function filterRows<TData>(
	rows: TData[],
	filters: ExtendedColumnFilter<TData>[],
	joinOperator: JoinOperator,
	getCellValue: (row: TData, columnId: string) => unknown = (row, columnId) =>
		(row as Record<string, unknown>)[columnId]
): TData[] {
	const validFilters = getValidFilters(filters);
	if (validFilters.length === 0) {
		return rows;
	}

	return rows.filter((row) => {
		const results = validFilters.map((filter) => matchesFilter(row, filter, getCellValue));
		return joinOperator === 'or' ? results.some(Boolean) : results.every(Boolean);
	});
}
