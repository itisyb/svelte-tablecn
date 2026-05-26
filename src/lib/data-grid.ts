import type { Column, Row, Table, RowData } from '@tanstack/table-core';
import type { Component } from 'svelte';
import BaselineIcon from '@lucide/svelte/icons/baseline';
import CalendarIcon from '@lucide/svelte/icons/calendar';
import CheckSquareIcon from '@lucide/svelte/icons/check-square';
import FileIcon from '@lucide/svelte/icons/file';
import FileArchive from '@lucide/svelte/icons/file-archive';
import FileAudio from '@lucide/svelte/icons/file-audio';
import FileImage from '@lucide/svelte/icons/file-image';
import FileSpreadsheet from '@lucide/svelte/icons/file-spreadsheet';
import FileText from '@lucide/svelte/icons/file-text';
import FileVideo from '@lucide/svelte/icons/file-video';
import HashIcon from '@lucide/svelte/icons/hash';
import LinkIcon from '@lucide/svelte/icons/link';
import ListChecksIcon from '@lucide/svelte/icons/list-checks';
import ListIcon from '@lucide/svelte/icons/list';
import Presentation from '@lucide/svelte/icons/presentation';
import TextInitialIcon from '@lucide/svelte/icons/text';
import {
	getCellKey,
	getCellValueKey,
	getLineCount,
	getRowHeightValue,
	parseCellKey,
	ROW_HEIGHT_VALUES,
	ROW_LINE_COUNTS,
	type CellOpts,
	type CellPosition,
	type CellSelectOption,
	type Direction,
	type FileCellData
} from '$lib/types/data-grid.js';
import { VIEWPORT_OFFSET } from '$lib/config/data-grid.js';

export {
	getCellKey,
	getCellValueKey,
	getLineCount,
	getRowHeightValue,
	parseCellKey,
	ROW_HEIGHT_VALUES,
	ROW_LINE_COUNTS
};

const DOMAIN_REGEX = /^[\w.-]+\.[a-z]{2,}(\/\S*)?$/i;
const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}.*)?$/;
const TRUTHY_BOOLEANS = new Set(['true', '1', 'yes', 'checked']);
const VALID_BOOLEANS = new Set(['true', 'false', '1', '0', 'yes', 'no', 'checked', 'unchecked']);

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
			width: column.getSize(),
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

export function formatCellValueForCopy(value: unknown, cellVariant?: string): string {
	if (value === null || value === undefined) return '';
	if (cellVariant === 'file' || cellVariant === 'multi-select') return JSON.stringify(value);
	if (value instanceof Date) return value.toISOString();
	return String(value);
}

export function serializeCellsToTsv(params: {
	selectedCells: Iterable<string>;
	focusedCell: CellPosition | null;
	rows: { getValue: (columnId: string) => unknown }[];
	getCellVariant: (columnId: string) => string | undefined;
	nonNavigableColumnIds: ReadonlySet<string>;
}): { tsvData: string; selectedCells: string[] } | null {
	const selectedCells = Array.from(params.selectedCells);
	const cells =
		selectedCells.length > 0
			? selectedCells
			: params.focusedCell
				? [getCellKey(params.focusedCell.rowIndex, params.focusedCell.columnId)]
				: [];

	if (cells.length === 0) return null;

	const selectedColumnIds: string[] = [];
	const seenColumnIds = new Set<string>();
	const rowIndices = new Set<number>();
	const cellData = new Map<string, string>();
	const navigableCells: string[] = [];

	for (const cellKey of cells) {
		const { rowIndex, columnId } = parseCellKey(cellKey);
		if (!columnId || params.nonNavigableColumnIds.has(columnId)) continue;

		navigableCells.push(cellKey);

		if (!seenColumnIds.has(columnId)) {
			seenColumnIds.add(columnId);
			selectedColumnIds.push(columnId);
		}

		rowIndices.add(rowIndex);

		const row = params.rows[rowIndex];
		if (row) {
			const value = row.getValue(columnId);
			const cellVariant = params.getCellVariant(columnId);
			cellData.set(cellKey, formatCellValueForCopy(value, cellVariant));
		}
	}

	const sortedRowIndices = Array.from(rowIndices).sort((a, b) => a - b);
	const tsvData = sortedRowIndices
		.map((rowIndex) =>
			selectedColumnIds
				.map((columnId) => cellData.get(getCellKey(rowIndex, columnId)) ?? '')
				.join('\t')
		)
		.join('\n');

	return { tsvData, selectedCells: navigableCells };
}

export function getRowIndicesForDeletion(params: {
	rowSelection: Record<string, boolean>;
	selectedCells: Iterable<string>;
	focusedCell: CellPosition | null;
	rows: { id: string }[];
}): number[] {
	const rowIndices = new Set<number>();

	for (const [rowIndex, row] of params.rows.entries()) {
		if (params.rowSelection[row.id]) {
			rowIndices.add(rowIndex);
		}
	}

	const selectedCells = Array.from(params.selectedCells);
	if (rowIndices.size === 0 && selectedCells.length > 0) {
		for (const cellKey of selectedCells) {
			rowIndices.add(parseCellKey(cellKey).rowIndex);
		}
	} else if (rowIndices.size === 0 && params.focusedCell) {
		rowIndices.add(params.focusedCell.rowIndex);
	}

	return Array.from(rowIndices);
}

export function getIsFileCellData(item: unknown): item is FileCellData {
	return (
		!!item &&
		typeof item === 'object' &&
		'id' in item &&
		'name' in item &&
		'size' in item &&
		'type' in item
	);
}

export function matchSelectOption(
	value: string,
	options: Pick<CellSelectOption, 'label' | 'value'>[]
): string | undefined {
	return options.find(
		(option) =>
			option.value === value ||
			option.value.toLowerCase() === value.toLowerCase() ||
			option.label.toLowerCase() === value.toLowerCase()
	)?.value;
}

function parsePastedDate(value: string): Date | null {
	if (ISO_DATE_REGEX.test(value)) {
		const [datePart] = value.split('T');
		const [year, month, day] = datePart.split('-').map(Number);
		const localDate = new Date(year, month - 1, day);
		if (
			localDate.getFullYear() === year &&
			localDate.getMonth() === month - 1 &&
			localDate.getDate() === day
		) {
			return localDate;
		}
		return null;
	}

	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return null;
	return date;
}

export function parsePastedCellValue(
	pastedValue: string,
	cellOpts?: CellOpts
): { value: unknown; shouldSkip: boolean } {
	const cellVariant = cellOpts?.variant;
	let processedValue: unknown = pastedValue;

	switch (cellVariant) {
		case 'number': {
			if (!pastedValue) return { value: null, shouldSkip: false };
			const num = Number.parseFloat(pastedValue);
			return Number.isNaN(num)
				? { value: undefined, shouldSkip: true }
				: { value: num, shouldSkip: false };
		}

		case 'checkbox': {
			if (!pastedValue) return { value: false, shouldSkip: false };
			const lower = pastedValue.toLowerCase();
			return VALID_BOOLEANS.has(lower)
				? { value: TRUTHY_BOOLEANS.has(lower), shouldSkip: false }
				: { value: undefined, shouldSkip: true };
		}

		case 'date': {
			if (!pastedValue) return { value: null, shouldSkip: false };
			const date = parsePastedDate(pastedValue);
			return date === null
				? { value: undefined, shouldSkip: true }
				: { value: date, shouldSkip: false };
		}

		case 'select': {
			if (!pastedValue) return { value: '', shouldSkip: false };
			const matched = matchSelectOption(pastedValue, cellOpts.options);
			return matched
				? { value: matched, shouldSkip: false }
				: { value: undefined, shouldSkip: true };
		}

		case 'multi-select': {
			let values: string[] = [];
			try {
				const parsed = JSON.parse(pastedValue);
				if (Array.isArray(parsed)) {
					values = parsed.filter((value): value is string => typeof value === 'string');
				}
			} catch {
				values = pastedValue ? pastedValue.split(',').map((value) => value.trim()) : [];
			}

			const validated = values
				.map((value) => matchSelectOption(value, cellOpts.options))
				.filter(Boolean) as string[];

			if (values.length > 0 && validated.length === 0) {
				return { value: undefined, shouldSkip: true };
			}

			return { value: validated, shouldSkip: false };
		}

		case 'file': {
			if (!pastedValue) return { value: [], shouldSkip: false };
			try {
				const parsed = JSON.parse(pastedValue);
				if (!Array.isArray(parsed)) return { value: undefined, shouldSkip: true };

				const validFiles = parsed.filter(getIsFileCellData);
				if (parsed.length > 0 && validFiles.length === 0) {
					return { value: undefined, shouldSkip: true };
				}

				return { value: validFiles, shouldSkip: false };
			} catch {
				return { value: undefined, shouldSkip: true };
			}
		}

		case 'url': {
			if (!pastedValue) return { value: '', shouldSkip: false };
			const firstChar = pastedValue[0];
			if (firstChar === '[' || firstChar === '{') return { value: undefined, shouldSkip: true };

			try {
				new URL(pastedValue);
				return { value: pastedValue, shouldSkip: false };
			} catch {
				return DOMAIN_REGEX.test(pastedValue)
					? { value: pastedValue, shouldSkip: false }
					: { value: undefined, shouldSkip: true };
			}
		}

		default: {
			if (!pastedValue) return { value: '', shouldSkip: false };

			if (ISO_DATE_REGEX.test(pastedValue)) {
				const date = parsePastedDate(pastedValue);
				if (date !== null) return { value: date.toLocaleDateString(), shouldSkip: false };
			}

			const firstChar = pastedValue[0];
			if (firstChar === '[' || firstChar === '{' || firstChar === 't' || firstChar === 'f') {
				try {
					const parsed = JSON.parse(pastedValue);

					if (Array.isArray(parsed)) {
						if (parsed.length > 0 && parsed.every(getIsFileCellData)) {
							processedValue = parsed.map((file) => file.name).join(', ');
						} else if (parsed.every((value) => typeof value === 'string')) {
							processedValue = (parsed as string[]).join(', ');
						}
					} else if (typeof parsed === 'boolean') {
						processedValue = parsed ? 'Checked' : 'Unchecked';
					}
				} catch {
					const lower = pastedValue.toLowerCase();
					if (lower === 'true' || lower === 'false') {
						processedValue = lower === 'true' ? 'Checked' : 'Unchecked';
					}
				}
			}
		}
	}

	return { value: processedValue, shouldSkip: false };
}

export function getIsInPopover(element: unknown): boolean {
	if (!(element instanceof Element)) return false;

	return (
		element.closest('[data-grid-cell-editor]') !== null ||
		element.closest('[data-grid-popover]') !== null ||
		element.closest("[data-slot='select-content']") !== null ||
		element.closest("[data-slot='dropdown-menu-content']") !== null ||
		element.closest("[data-slot='popover-content']") !== null ||
		element.closest("[data-slot='dialog-content']") !== null
	);
}

export function getEmptyCellValue(variant: CellOpts['variant'] | undefined): unknown {
	if (variant === 'multi-select' || variant === 'file') return [];
	if (variant === 'number' || variant === 'date') return null;
	if (variant === 'checkbox') return false;
	return '';
}

export function getColumnVariant(variant?: CellOpts['variant']): {
	icon: Component<{ class?: string }>;
	label: string;
} | null {
	switch (variant) {
		case 'short-text':
			return { icon: BaselineIcon, label: 'Short text' };
		case 'long-text':
			return { icon: TextInitialIcon, label: 'Long text' };
		case 'number':
			return { icon: HashIcon, label: 'Number' };
		case 'url':
			return { icon: LinkIcon, label: 'URL' };
		case 'checkbox':
			return { icon: CheckSquareIcon, label: 'Checkbox' };
		case 'select':
			return { icon: ListIcon, label: 'Select' };
		case 'multi-select':
			return { icon: ListChecksIcon, label: 'Multi-select' };
		case 'date':
			return { icon: CalendarIcon, label: 'Date' };
		case 'file':
			return { icon: FileIcon, label: 'File' };
		default:
			return null;
	}
}

export function getUrlHref(urlString: string): string {
	if (!urlString || urlString.trim() === '') return '';

	const trimmed = urlString.trim();

	if (/^(javascript|data|vbscript|file):/i.test(trimmed)) {
		return '';
	}

	if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
		return trimmed;
	}

	return `http://${trimmed}`;
}

export function parseLocalDate(dateValue: unknown): Date | null {
	if (!dateValue) return null;
	if (dateValue instanceof Date) return dateValue;
	if (typeof dateValue !== 'string') return null;

	const [year, month, day] = dateValue.split('-').map(Number);
	if (!year || !month || !day) return null;

	const date = new Date(year, month - 1, day);
	if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
		return null;
	}

	return date;
}

export function formatDateToString(date: Date): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');

	return `${year}-${month}-${day}`;
}

export function formatDateForDisplay(dateValue: unknown): string {
	if (!dateValue) return '';

	const date = parseLocalDate(dateValue);
	if (!date) return typeof dateValue === 'string' ? dateValue : '';

	return date.toLocaleDateString();
}

export function formatFileSize(bytes: number): string {
	if (bytes <= 0 || !Number.isFinite(bytes)) return '0 B';
	const k = 1024;
	const sizes = ['B', 'KB', 'MB', 'GB'];
	const i = Math.min(sizes.length - 1, Math.floor(Math.log(bytes) / Math.log(k)));
	return `${Number.parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`;
}

export function getFileIcon(type: string): Component {
	if (type.startsWith('image/')) return FileImage;
	if (type.startsWith('video/')) return FileVideo;
	if (type.startsWith('audio/')) return FileAudio;
	if (type.includes('pdf')) return FileText;
	if (type.includes('zip') || type.includes('rar')) return FileArchive;
	if (type.includes('word') || type.includes('document') || type.includes('doc')) return FileText;
	if (type.includes('sheet') || type.includes('excel') || type.includes('xls')) return FileSpreadsheet;
	if (type.includes('presentation') || type.includes('powerpoint') || type.includes('ppt')) {
		return Presentation;
	}
	return FileIcon;
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
