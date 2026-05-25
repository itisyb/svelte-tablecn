import { dataTableConfig } from '$lib/config/data-table.js';
import type {
	ExtendedColumnFilter,
	ExtendedColumnSort,
	FilterVariant
} from '$lib/types/data-table.js';

export interface StateParser<T> {
	parse: (value: string) => T | null;
	serialize: (value: T) => string;
	eq: (left: T, right: T) => boolean;
}

export type FilterItemSchema = {
	id: string;
	value: string | string[];
	variant: FilterVariant;
	operator: (typeof dataTableConfig.operators)[number];
	filterId: string;
};

function getValidKeys(columnIds?: string[] | Set<string>): Set<string> | null {
	if (!columnIds) return null;
	return columnIds instanceof Set ? columnIds : new Set(columnIds);
}

function isSortingItem<TData>(
	item: unknown,
	validKeys: Set<string> | null
): item is ExtendedColumnSort<TData> {
	if (typeof item !== 'object' || item === null) return false;

	const candidate = item as { id?: unknown; desc?: unknown };
	return (
		typeof candidate.id === 'string' &&
		typeof candidate.desc === 'boolean' &&
		(!validKeys || validKeys.has(candidate.id))
	);
}

function isFilterItem<TData>(
	item: unknown,
	validKeys: Set<string> | null,
	validVariants: Set<string>,
	validOperators: Set<string>
): item is ExtendedColumnFilter<TData> {
	if (typeof item !== 'object' || item === null) return false;

	const candidate = item as {
		id?: unknown;
		value?: unknown;
		filterId?: unknown;
		variant?: unknown;
		operator?: unknown;
	};
	return (
		typeof candidate.id === 'string' &&
		(!validKeys || validKeys.has(candidate.id)) &&
		(typeof candidate.value === 'string' ||
			(Array.isArray(candidate.value) &&
				candidate.value.every((entry: unknown) => typeof entry === 'string'))) &&
		typeof candidate.filterId === 'string' &&
		typeof candidate.variant === 'string' &&
		validVariants.has(candidate.variant) &&
		typeof candidate.operator === 'string' &&
		validOperators.has(candidate.operator)
	);
}

export function getSortingStateParser<TData>(
	columnIds?: string[] | Set<string>
): StateParser<ExtendedColumnSort<TData>[]> {
	const validKeys = getValidKeys(columnIds);

	return {
		parse: (value) => {
			try {
				const parsed = JSON.parse(value);
				if (!Array.isArray(parsed)) return null;

				const sorting = parsed as unknown[];
				if (!sorting.every((item) => isSortingItem<TData>(item, validKeys))) return null;

				return sorting;
			} catch {
				return null;
			}
		},
		serialize: (value) => JSON.stringify(value),
		eq: (left, right) =>
			left.length === right.length &&
			left.every((item, index) => item.id === right[index]?.id && item.desc === right[index]?.desc)
	};
}

export function getFiltersStateParser<TData>(
	columnIds?: string[] | Set<string>
): StateParser<ExtendedColumnFilter<TData>[]> {
	const validKeys = getValidKeys(columnIds);
	const validVariants = new Set<string>(dataTableConfig.filterVariants);
	const validOperators = new Set<string>(dataTableConfig.operators);

	return {
		parse: (value) => {
			try {
				const parsed = JSON.parse(value);
				if (!Array.isArray(parsed)) return null;

				const filters = parsed as unknown[];
				if (
					!filters.every((item) =>
						isFilterItem<TData>(item, validKeys, validVariants, validOperators)
					)
				) {
					return null;
				}

				return filters;
			} catch {
				return null;
			}
		},
		serialize: (value) => JSON.stringify(value),
		eq: (left, right) =>
			left.length === right.length &&
			left.every((filter, index) => {
				const rightFilter = right[index];
				if (!rightFilter) return false;

				const leftValue = Array.isArray(filter.value) ? filter.value.join('\u0000') : filter.value;
				const rightValue = Array.isArray(rightFilter.value)
					? rightFilter.value.join('\u0000')
					: rightFilter.value;

				return (
					filter.id === rightFilter.id &&
					leftValue === rightValue &&
					filter.variant === rightFilter.variant &&
					filter.operator === rightFilter.operator
				);
			})
	};
}
