import type { Column } from '@tanstack/table-core';

export type RangeValue = [number, number];

export function isValidRangeValue(value: unknown): value is RangeValue {
	return (
		Array.isArray(value) &&
		value.length === 2 &&
		typeof value[0] === 'number' &&
		typeof value[1] === 'number' &&
		!Number.isNaN(value[0]) &&
		!Number.isNaN(value[1])
	);
}

export function parseRangeFilterValue(value: unknown, fallback: RangeValue): RangeValue {
	if (isValidRangeValue(value)) {
		return value;
	}

	if (Array.isArray(value) && value.length >= 2) {
		const rawMin = value[0];
		const rawMax = value[1];
		if (rawMin === '' && rawMax === '') {
			return fallback;
		}

		const min =
			rawMin === '' || rawMin === undefined ? fallback[0] : Number(rawMin);
		const max =
			rawMax === '' || rawMax === undefined ? fallback[1] : Number(rawMax);

		if (!Number.isNaN(min) && !Number.isNaN(max)) {
			return [Math.min(min, max), Math.max(min, max)];
		}
	}

	return fallback;
}

export function getRangeStep(min: number, max: number): number {
	const rangeSize = max - min;
	if (rangeSize <= 20) return 1;
	if (rangeSize <= 100) return Math.ceil(rangeSize / 20);
	return Math.ceil(rangeSize / 50);
}

export function formatRangeValue(value: number): string {
	return value.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

export function isCompleteRangeFilterValue(value: unknown): boolean {
	if (!Array.isArray(value) || value.length < 2) {
		return false;
	}

	const min = coerceRangeNumber(value[0]);
	const max = coerceRangeNumber(value[1]);
	return min !== undefined && max !== undefined && min <= max;
}

export function coerceRangeNumber(value: unknown): number | undefined {
	if (typeof value === 'number' && !Number.isNaN(value)) {
		return value;
	}

	if (typeof value === 'string' && value.trim() !== '') {
		const parsed = Number(value);
		if (!Number.isNaN(parsed)) {
			return parsed;
		}
	}

	return undefined;
}

export function getColumnRangeBounds<TData>(
	column: Column<TData, unknown>,
	metaRange?: [number, number]
): { min: number; max: number; step: number } {
	let min = 0;
	let max = 100;

	if (metaRange && isValidRangeValue(metaRange)) {
		[min, max] = metaRange;
	} else {
		const faceted = column.getFacetedMinMaxValues?.();
		if (faceted && Array.isArray(faceted) && faceted.length === 2) {
			const facetMin = Number(faceted[0]);
			const facetMax = Number(faceted[1]);
			if (!Number.isNaN(facetMin) && !Number.isNaN(facetMax)) {
				min = facetMin;
				max = facetMax;
			}
		}
	}

	return { min, max, step: getRangeStep(min, max) };
}
