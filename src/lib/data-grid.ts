import type { Column, Row, Table, RowData } from '@tanstack/table-core';
import type { CellOpts, Direction } from '$lib/types/data-grid.js';
import { VIEWPORT_OFFSET } from '$lib/config/data-grid.js';

/** Index in the current row model (filtered/sorted), not TanStack's preserved core `row.index`. */
export function getRowModelPosition<TData>(table: Table<TData>, row: Row<TData>): number {
	const rows = table.getRowModel().rows;
	const position = rows.findIndex((r) => r.id === row.id);
	return position === -1 ? row.index : position;
}

export function getColumnBorderVisibility<TData>(params: {
	column: Column<TData, unknown>;
	nextColumn?: Column<TData, unknown>;
	isLastColumn: boolean;
}): {
	showEndBorder: boolean;
	showStartBorder: boolean;
} {
	const { column, nextColumn, isLastColumn } = params;

	const isPinned = column.getIsPinned();
	const isFirstRightPinnedColumn = isPinned === 'right' && column.getIsFirstColumn('right');
	const isLastRightPinnedColumn = isPinned === 'right' && column.getIsLastColumn('right');

	const nextIsPinned = nextColumn?.getIsPinned();
	const isBeforeRightPinned = nextIsPinned === 'right' && nextColumn?.getIsFirstColumn('right');

	const showEndBorder = !isBeforeRightPinned && (isLastColumn || !isLastRightPinnedColumn);
	const showStartBorder = isFirstRightPinnedColumn;

	return {
		showEndBorder,
		showStartBorder
	};
}

export function getColumnPinningStyle<TData>(params: {
	column: Column<TData, unknown>;
	withBorder?: boolean;
	dir?: Direction;
}): Record<string, string | number | undefined> {
	const { column, dir = 'ltr', withBorder = false } = params;

	try {
		const isPinned = column.getIsPinned();
		const isLastLeftPinnedColumn = isPinned === 'left' && column.getIsLastColumn('left');
		const isFirstRightPinnedColumn = isPinned === 'right' && column.getIsFirstColumn('right');

		const isRtl = dir === 'rtl';

		const leftPosition = isPinned === 'left' ? `${column.getStart('left')}px` : undefined;
		const rightPosition = isPinned === 'right' ? `${column.getAfter('right')}px` : undefined;

		return {
			boxShadow: withBorder
				? isLastLeftPinnedColumn
					? isRtl
						? '4px 0 4px -4px var(--border) inset'
						: '-4px 0 4px -4px var(--border) inset'
					: isFirstRightPinnedColumn
						? isRtl
							? '-4px 0 4px -4px var(--border) inset'
							: '4px 0 4px -4px var(--border) inset'
						: undefined
				: undefined,
			left: isRtl ? rightPosition : leftPosition,
			right: isRtl ? leftPosition : rightPosition,
			opacity: isPinned ? 0.97 : 1,
			position: isPinned ? 'sticky' : 'relative',
			background: isPinned ? 'var(--background)' : 'var(--background)',
			zIndex: isPinned ? 1 : undefined
		};
	} catch {
		return {
			position: 'relative',
			background: 'var(--background)'
		};
	}
}

export function toPinningStyleString(styles: Record<string, string | number | undefined>): string {
	return Object.entries(styles)
		.filter(([, value]) => value !== undefined)
		.map(([key, value]) => `${key}: ${value}`)
		.join('; ');
}

function countTabs(line: string): number {
	let count = 0;
	for (const char of line) {
		if (char === '\t') count++;
	}
	return count;
}

export function parseTsv(text: string, fallbackColumnCount: number): string[][] {
	if (text.startsWith('"') || text.includes('\t"')) {
		const rows: string[][] = [];
		let currentRow: string[] = [];
		let currentField = '';
		let inQuotes = false;
		let i = 0;

		while (i < text.length) {
			const char = text[i];
			const nextChar = text[i + 1];

			if (inQuotes) {
				if (char === '"' && nextChar === '"') {
					currentField += '"';
					i += 2;
				} else if (char === '"') {
					inQuotes = false;
					i++;
				} else {
					currentField += char;
					i++;
				}
			} else if (char === '"' && currentField === '') {
				inQuotes = true;
				i++;
			} else if (char === '\t') {
				currentRow.push(currentField);
				currentField = '';
				i++;
			} else if (char === '\r' && nextChar === '\n') {
				currentRow.push(currentField);
				if (currentRow.length > 1 || currentRow.some((field) => field.length > 0)) {
					rows.push(currentRow);
				}
				currentRow = [];
				currentField = '';
				i += 2;
			} else if (char === '\n') {
				currentRow.push(currentField);
				if (currentRow.length > 1 || currentRow.some((field) => field.length > 0)) {
					rows.push(currentRow);
				}
				currentRow = [];
				currentField = '';
				i++;
			} else {
				currentField += char;
				i++;
			}
		}

		currentRow.push(currentField);
		if (currentRow.length > 1 || currentRow.some((field) => field.length > 0)) {
			rows.push(currentRow);
		}

		return rows;
	}

	const lines = text.split('\n');
	let maxTabCount = 0;
	for (const line of lines) {
		const tabCount = countTabs(line);
		if (tabCount > maxTabCount) maxTabCount = tabCount;
	}

	const columnCount = maxTabCount > 0 ? maxTabCount + 1 : fallbackColumnCount;
	if (columnCount <= 0) return [];

	const expectedTabCount = columnCount - 1;
	const rows: string[][] = [];
	let buffer = '';
	let bufferTabCount = 0;

	for (const line of lines) {
		const tabCount = countTabs(line);

		if (tabCount === expectedTabCount) {
			if (buffer && bufferTabCount === expectedTabCount) rows.push(buffer.split('\t'));
			buffer = '';
			bufferTabCount = 0;
			rows.push(line.split('\t'));
		} else {
			buffer = buffer ? `${buffer}\n${line}` : line;
			bufferTabCount += tabCount;
			if (bufferTabCount === expectedTabCount) {
				rows.push(buffer.split('\t'));
				buffer = '';
				bufferTabCount = 0;
			}
		}
	}

	if (buffer && bufferTabCount === expectedTabCount) rows.push(buffer.split('\t'));

	return rows.length > 0
		? rows
		: lines.filter((line) => line.length > 0).map((line) => line.split('\t'));
}

export function getIsInPopover(element: unknown): boolean {
	if (!(element instanceof Element)) return false;

	return (
		element.closest('[data-grid-cell-editor]') !== null ||
		element.closest('[data-grid-popover]') !== null ||
		element.closest("[data-slot='dropdown-menu-content']") !== null ||
		element.closest("[data-slot='popover-content']") !== null
	);
}

export function getEmptyCellValue(variant: CellOpts['variant'] | undefined): unknown {
	if (variant === 'multi-select' || variant === 'file') return [];
	if (variant === 'number' || variant === 'date') return null;
	if (variant === 'checkbox') return false;
	return '';
}

export function getScrollDirection(
	direction: string
): 'left' | 'right' | 'home' | 'end' | undefined {
	if (
		direction === 'left' ||
		direction === 'right' ||
		direction === 'home' ||
		direction === 'end'
	) {
		return direction;
	}
	if (direction === 'pageleft') return 'left';
	if (direction === 'pageright') return 'right';
	return undefined;
}

export function scrollCellIntoView<TData extends RowData>(params: {
	container: HTMLDivElement;
	targetCell: HTMLDivElement;
	table: Table<TData>;
	viewportOffset?: number;
	direction?: 'left' | 'right' | 'home' | 'end';
	isRtl?: boolean;
}): void {
	const {
		container,
		targetCell,
		table,
		direction,
		viewportOffset = VIEWPORT_OFFSET,
		isRtl = false
	} = params;

	const containerRect = container.getBoundingClientRect();
	const cellRect = targetCell.getBoundingClientRect();

	// Only treat as RTL when explicitly requested. Do not infer from scrollLeft:
	// after toggling RTL→LTR, scrollLeft can stay negative and breaks LTR scrolling.
	const isActuallyRtl = isRtl;

	const leftPinnedColumns = table.getLeftVisibleLeafColumns();
	const rightPinnedColumns = table.getRightVisibleLeafColumns();

	const leftPinnedWidth = leftPinnedColumns.reduce((sum, c) => sum + c.getSize(), 0);
	const rightPinnedWidth = rightPinnedColumns.reduce((sum, c) => sum + c.getSize(), 0);

	const viewportLeft = isActuallyRtl
		? containerRect.left + rightPinnedWidth + viewportOffset
		: containerRect.left + leftPinnedWidth + viewportOffset;
	const viewportRight = isActuallyRtl
		? containerRect.right - leftPinnedWidth - viewportOffset
		: containerRect.right - rightPinnedWidth - viewportOffset;

	const isFullyVisible = cellRect.left >= viewportLeft && cellRect.right <= viewportRight;

	if (isFullyVisible) return;

	const isClippedLeft = cellRect.left < viewportLeft;
	const isClippedRight = cellRect.right > viewportRight;

	let scrollDelta = 0;

	if (!direction) {
		if (isClippedRight) {
			scrollDelta = cellRect.right - viewportRight;
		} else if (isClippedLeft) {
			scrollDelta = -(viewportLeft - cellRect.left);
		}
	} else {
		const shouldScrollRight = isActuallyRtl
			? direction === 'right' || direction === 'home'
			: direction === 'right' || direction === 'end';

		if (shouldScrollRight) {
			scrollDelta = cellRect.right - viewportRight;
		} else {
			scrollDelta = -(viewportLeft - cellRect.left);
		}
	}

	container.scrollLeft += scrollDelta;
}
