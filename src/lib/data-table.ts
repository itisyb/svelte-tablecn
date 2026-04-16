import type { Column } from '@tanstack/table-core';

export function getColumnPinningStyle<TData>(params: {
	column?: Column<TData, unknown>;
}): Record<string, string | number | undefined> {
	const { column } = params;

	if (!column) {
		return {};
	}

	try {
		const isPinned = column.getIsPinned();
		const isLastLeftPinnedColumn = isPinned === 'left' && column.getIsLastColumn('left');
		const isFirstRightPinnedColumn = isPinned === 'right' && column.getIsFirstColumn('right');

		return {
			boxShadow: isLastLeftPinnedColumn
				? '-4px 0 4px -4px var(--border) inset'
				: isFirstRightPinnedColumn
					? '4px 0 4px -4px var(--border) inset'
					: undefined,
			left: isPinned === 'left' ? `${column.getStart('left')}px` : undefined,
			right: isPinned === 'right' ? `${column.getAfter('right')}px` : undefined,
			opacity: isPinned ? 0.97 : 1,
			position: isPinned ? 'sticky' : 'relative',
			background: 'var(--background)',
			zIndex: isPinned ? 1 : undefined
		};
	} catch {
		return {};
	}
}
