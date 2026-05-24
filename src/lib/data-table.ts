import type { Column } from '@tanstack/table-core';
export {
	getDefaultFilterOperator,
	getFilterOperators,
	getValidFilters
} from '$lib/types/data-table.js';

export function getColumnPinningStyle<TData>(params: {
	column?: Column<TData, unknown>;
	withBorder?: boolean;
}): Record<string, string | number | undefined> {
	const { column, withBorder = false } = params;
	if (!column) return {};

	const isPinned = column.getIsPinned();
	const isLastLeftPinnedColumn = isPinned === 'left' && column.getIsLastColumn('left');
	const isFirstRightPinnedColumn = isPinned === 'right' && column.getIsFirstColumn('right');

	return {
		boxShadow: withBorder
			? isLastLeftPinnedColumn
				? '-4px 0 4px -4px var(--border) inset'
				: isFirstRightPinnedColumn
					? '4px 0 4px -4px var(--border) inset'
					: undefined
			: undefined,
		left: isPinned === 'left' ? `${column.getStart('left')}px` : undefined,
		right: isPinned === 'right' ? `${column.getAfter('right')}px` : undefined,
		opacity: isPinned ? 0.97 : 1,
		position: isPinned ? 'sticky' : 'relative',
		background: 'var(--background)',
		width: column.getSize(),
		zIndex: isPinned ? 1 : undefined
	};
}
