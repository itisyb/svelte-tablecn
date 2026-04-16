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

export function getSortingStateParser<TData>(
	columnIds?: string[] | Set<string>
): StateParser<ExtendedColumnSort<TData>[]> {
	const validKeys = getValidKeys(columnIds);

	return {
		parse: (value) => {
			try {
				const parsed = JSON.parse(value);
				if (!Array.isArray(parsed)) return null;

				const sorting = parsed.filter(
					(item): item is ExtendedColumnSort<TData> =>
						typeof item === 'object' &&
						item !== null &&
						typeof item.id === 'string' &&
						typeof item.desc === 'boolean' &&
						(!validKeys || validKeys.has(item.id))
				);

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

				const filters = parsed.filter(
					(item): item is ExtendedColumnFilter<TData> =>
						typeof item === 'object' &&
						item !== null &&
						typeof item.id === 'string' &&
						(!validKeys || validKeys.has(item.id)) &&
						(item.value === undefined ||
							typeof item.value === 'string' ||
							(Array.isArray(item.value) &&
								item.value.every((entry: unknown) => typeof entry === 'string'))) &&
						typeof item.filterId === 'string' &&
						typeof item.variant === 'string' &&
						validVariants.has(item.variant) &&
						typeof item.operator === 'string' &&
						validOperators.has(item.operator)
				);

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
					filter.operator === rightFilter.operator &&
					filter.filterId === rightFilter.filterId
				);
			})
	};
}
