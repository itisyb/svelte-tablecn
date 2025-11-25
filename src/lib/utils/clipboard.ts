// Clipboard utilities for DataGrid copy/paste operations
import type { DataGridStore } from '$lib/stores/data-grid.svelte';
import { parseCellKey } from '$lib/types/data-grid';

export interface ClipboardData {
	text: string;
	rows: string[][];
}

/**
 * Parses clipboard text into a 2D array of cell values
 */
export function parseClipboardText(text: string): string[][] {
	// Split by newlines, then by tabs
	return text
		.trim()
		.split(/\r?\n/)
		.map((row) => row.split('\t'));
}

/**
 * Formats cell values into clipboard text (tab-separated)
 */
export function formatClipboardText(rows: string[][]): string {
	return rows.map((row) => row.join('\t')).join('\n');
}

/**
 * Gets the selected cell values from the store in a 2D array format
 */
export function getSelectedCellValues<TData>(
	store: DataGridStore<TData>,
	getCellValue: (rowIndex: number, columnId: string) => unknown
): { rows: string[][]; bounds: { minRow: number; maxRow: number; minCol: number; maxCol: number } } {
	const selectedKeys = store.selectedCellKeys;
	if (selectedKeys.length === 0) {
		return { rows: [], bounds: { minRow: 0, maxRow: 0, minCol: 0, maxCol: 0 } };
	}

	// Parse all selected cell positions
	const positions = selectedKeys
		.map((key) => parseCellKey(key))
		.filter((pos): pos is NonNullable<typeof pos> => pos !== null);

	if (positions.length === 0) {
		return { rows: [], bounds: { minRow: 0, maxRow: 0, minCol: 0, maxCol: 0 } };
	}

	// Find bounds
	const columnOrder = store.columnOrder;
	let minRow = Infinity,
		maxRow = -Infinity;
	let minCol = Infinity,
		maxCol = -Infinity;

	for (const pos of positions) {
		minRow = Math.min(minRow, pos.rowIndex);
		maxRow = Math.max(maxRow, pos.rowIndex);
		const colIndex = columnOrder.indexOf(pos.columnId);
		if (colIndex !== -1) {
			minCol = Math.min(minCol, colIndex);
			maxCol = Math.max(maxCol, colIndex);
		}
	}

	// Build 2D array of values
	const rows: string[][] = [];
	for (let row = minRow; row <= maxRow; row++) {
		const rowValues: string[] = [];
		for (let col = minCol; col <= maxCol; col++) {
			const columnId = columnOrder[col];
			const value = getCellValue(row, columnId);
			rowValues.push(formatCellValue(value));
		}
		rows.push(rowValues);
	}

	return { rows, bounds: { minRow, maxRow, minCol, maxCol } };
}

/**
 * Formats a cell value for clipboard
 */
export function formatCellValue(value: unknown): string {
	if (value === null || value === undefined) {
		return '';
	}
	if (typeof value === 'object') {
		if (Array.isArray(value)) {
			return value.map(formatCellValue).join(', ');
		}
		if (value instanceof Date) {
			return value.toISOString();
		}
		return JSON.stringify(value);
	}
	return String(value);
}

/**
 * Copies selected cells to clipboard
 */
export async function copyToClipboard<TData>(
	store: DataGridStore<TData>,
	getCellValue: (rowIndex: number, columnId: string) => unknown
): Promise<boolean> {
	const { rows } = getSelectedCellValues(store, getCellValue);
	if (rows.length === 0) {
		return false;
	}

	const text = formatClipboardText(rows);

	try {
		await navigator.clipboard.writeText(text);
		return true;
	} catch {
		// Fallback for older browsers
		const textarea = document.createElement('textarea');
		textarea.value = text;
		textarea.style.position = 'fixed';
		textarea.style.opacity = '0';
		document.body.appendChild(textarea);
		textarea.select();
		const success = document.execCommand('copy');
		document.body.removeChild(textarea);
		return success;
	}
}

/**
 * Reads text from clipboard
 */
export async function readFromClipboard(): Promise<string | null> {
	try {
		return await navigator.clipboard.readText();
	} catch {
		return null;
	}
}

/**
 * Calculates how many rows would be needed to paste data
 */
export function calculatePasteRequirements(
	store: DataGridStore<any>,
	clipboardRows: string[][]
): { rowsToAdd: number; startRow: number; startCol: number } {
	const focusedCell = store.focusedCell;
	if (!focusedCell) {
		return { rowsToAdd: 0, startRow: 0, startCol: 0 };
	}

	const startRow = focusedCell.rowIndex;
	const startCol = store.columnOrder.indexOf(focusedCell.columnId);
	const endRow = startRow + clipboardRows.length - 1;
	const currentRowCount = store.data.length;

	const rowsToAdd = Math.max(0, endRow - currentRowCount + 1);

	return { rowsToAdd, startRow, startCol };
}

/**
 * Creates paste operations for applying clipboard data to the grid
 */
export function createPasteOperations(
	store: DataGridStore<any>,
	clipboardRows: string[][],
	startRow: number,
	startCol: number
): Array<{ rowIndex: number; columnId: string; value: string }> {
	const operations: Array<{ rowIndex: number; columnId: string; value: string }> = [];
	const columnOrder = store.columnOrder;

	for (let rowOffset = 0; rowOffset < clipboardRows.length; rowOffset++) {
		const row = clipboardRows[rowOffset];
		for (let colOffset = 0; colOffset < row.length; colOffset++) {
			const colIndex = startCol + colOffset;
			if (colIndex >= columnOrder.length) continue;

			operations.push({
				rowIndex: startRow + rowOffset,
				columnId: columnOrder[colIndex],
				value: row[colOffset]
			});
		}
	}

	return operations;
}
