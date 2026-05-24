import type { Column } from '@tanstack/table-core';
import { getColumnPinningStyle as getGridColumnPinningStyle } from '$lib/data-grid.js';

export function getColumnPinningStyle<TData>(params: {
	column?: Column<TData, unknown>;
	withBorder?: boolean;
}): Record<string, string | number | undefined> {
	const { column, withBorder = false } = params;
	if (!column) return {};
	return getGridColumnPinningStyle({ column, withBorder, dir: 'ltr' });
}
