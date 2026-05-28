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

function parseFilterDate(value: unknown): Date | undefined {
	if (value === undefined || value === null || value === '') {
		return undefined;
	}

	const date =
		typeof value === 'number' || (typeof value === 'string' && /^\d+$/.test(value))
			? new Date(Number(value))
			: new Date(value as string | Date);

	return Number.isNaN(date.getTime()) ? undefined : date;
}

function matchesFilter<TData>(
	row: TData,
	filter: ExtendedColumnFilter<TData>,
	getCellValue: (row: TData, columnId: string) => unknown
): boolean {
	if (filter.operator === 'isBetween') {
		const values = Array.isArray(filter.value) ? filter.value : [filter.value];
		const cellValue = getCellValue(row, filter.id);

		if (filter.variant === 'number' || filter.variant === 'range') {
			const firstValue = coerceRangeNumber(values[0]);
			const secondValue = coerceRangeNumber(values[1]);

			if (firstValue === undefined && secondValue === undefined) {
				return true;
			}

			const cellNumber =
				typeof cellValue === 'number'
					? cellValue
					: typeof cellValue === 'string' && cellValue.trim() !== ''
						? Number(cellValue)
						: Number.NaN;

			if (Number.isNaN(cellNumber)) {
				return false;
			}

			if (firstValue !== undefined && secondValue === undefined) {
				return cellNumber === firstValue;
			}

			if (firstValue === undefined && secondValue !== undefined) {
				return cellNumber === secondValue;
			}

			return cellNumber >= firstValue! && cellNumber <= secondValue!;
		}

		if (filter.variant === 'date' || filter.variant === 'dateRange') {
			const cellDate = new Date(cellValue as string | number | Date);
			if (Number.isNaN(cellDate.getTime())) {
				return false;
			}

			const startValue = parseFilterDate(values[0]);
			const endValue = parseFilterDate(values[1]);

			if (!startValue && !endValue) {
				return true;
			}

			if (startValue && Number.isNaN(startValue.getTime())) {
				return false;
			}

			if (endValue && Number.isNaN(endValue.getTime())) {
				return false;
			}

			startValue?.setHours(0, 0, 0, 0);
			endValue?.setHours(23, 59, 59, 999);

			return (!startValue || cellDate >= startValue) && (!endValue || cellDate <= endValue);
		}
	}

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
