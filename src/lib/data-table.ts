import type { Column } from '@tanstack/table-core';
import { getColumnPinningStyle as getGridColumnPinningStyle } from '$lib/data-grid.js';

export function getColumnPinningStyle<TData>(params: {
	column?: Column<TData, unknown>;
}): Record<string, string | number | undefined> {
	const { column } = params;
	if (!column) return {};
	return getGridColumnPinningStyle({ column, dir: 'ltr' });
}
