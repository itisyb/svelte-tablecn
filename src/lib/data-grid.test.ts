import type { Row } from '@tanstack/table-core';
import { describe, expect, it } from 'vitest';
import {
	getColumnPinningStyle,
	getRowIndicesForDeletion,
	parsePastedCellValue,
	parseTsv,
	serializeCellsToTsv
} from './data-grid.js';
import { getFilterFn, NUMBER_FILTER_OPERATORS } from './data-grid-filters.js';
import { getDataGridSelectColumn } from './components/data-grid/data-grid-select-column.js';
import { RenderComponentConfig } from './table/index.js';

describe('parseTsv', () => {
	it('parses simple multi-row TSV', () => {
		expect(parseTsv('Alice\tKickflip\t95\nBob\tOllie\t88', 3)).toEqual([
			['Alice', 'Kickflip', '95'],
			['Bob', 'Ollie', '88']
		]);
	});

	it('handles quoted multiline content', () => {
		const text = 'Alice\tKickflip\t95\nBob\t"Trick with\nmultiple\nlines"\t98';

		expect(parseTsv(text, 3)).toEqual([
			['Alice', 'Kickflip', '95'],
			['Bob', 'Trick with\nmultiple\nlines', '98']
		]);
	});

	it('handles escaped quotes', () => {
		expect(parseTsv('"She said ""hello"""\t42', 2)).toEqual([['She said "hello"', '42']]);
	});

	it('handles unquoted multiline content by tab count', () => {
		const text = 'Alice\tShort note\t95\nBob\tLine 1\nLine 2\nLine 3\t88\nCharlie\tSimple\t77';

		expect(parseTsv(text, 3)).toEqual([
			['Alice', 'Short note', '95'],
			['Bob', 'Line 1\nLine 2\nLine 3', '88'],
			['Charlie', 'Simple', '77']
		]);
	});

	it('falls back to single-column rows when no tabs are detected', () => {
		expect(parseTsv('line1\nline2\nline3', 1)).toEqual([['line1'], ['line2'], ['line3']]);
	});
});

describe('parsePastedCellValue', () => {
	it('preserves numeric-looking values for text cells', () => {
		expect(parsePastedCellValue('00123', { variant: 'short-text' })).toEqual({
			value: '00123',
			shouldSkip: false
		});
	});

	it('parses numbers only for number cells', () => {
		expect(parsePastedCellValue('42.5', { variant: 'number' })).toEqual({
			value: 42.5,
			shouldSkip: false
		});
		expect(parsePastedCellValue('nope', { variant: 'number' }).shouldSkip).toBe(true);
	});

	it('matches select labels and values case-insensitively', () => {
		const options = [
			{ label: 'Engineering', value: 'eng' },
			{ label: 'Marketing', value: 'mkt' }
		];

		expect(parsePastedCellValue('engineering', { variant: 'select', options })).toEqual({
			value: 'eng',
			shouldSkip: false
		});
	});

	it('skips invalid checkbox values', () => {
		expect(parsePastedCellValue('checked', { variant: 'checkbox' })).toEqual({
			value: true,
			shouldSkip: false
		});
		expect(parsePastedCellValue('maybe', { variant: 'checkbox' }).shouldSkip).toBe(true);
	});
});

describe('serializeCellsToTsv', () => {
	const rows = [
		{
			getValue: (columnId: string) =>
				({
					name: 'Tony Hawk',
					age: 55,
					skills: ['Kickflip', 'Vert']
				})[columnId]
		},
		{
			getValue: (columnId: string) =>
				({
					name: 'Lizzie Armanto',
					age: 31,
					skills: ['Park']
				})[columnId]
		}
	];

	const nonNavigableColumnIds = new Set(['select', 'actions']);
	const getCellVariant = (columnId: string) =>
		columnId === 'skills' ? 'multi-select' : columnId === 'age' ? 'number' : 'short-text';

	it('falls back to the focused cell when no cells are selected', () => {
		expect(
			serializeCellsToTsv({
				selectedCells: new Set(),
				focusedCell: { rowIndex: 0, columnId: 'name' },
				rows,
				getCellVariant,
				nonNavigableColumnIds
			})
		).toEqual({
			tsvData: 'Tony Hawk',
			selectedCells: ['0:name']
		});
	});

	it('serializes selected cells without inserting unselected columns', () => {
		expect(
			serializeCellsToTsv({
				selectedCells: new Set(['0:name', '0:skills', '1:name', '1:skills']),
				focusedCell: null,
				rows,
				getCellVariant,
				nonNavigableColumnIds
			})
		).toEqual({
			tsvData: 'Tony Hawk\t["Kickflip","Vert"]\nLizzie Armanto\t["Park"]',
			selectedCells: ['0:name', '0:skills', '1:name', '1:skills']
		});
	});
});

describe('getRowIndicesForDeletion', () => {
	const rows = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];

	it('prefers selected rows over selected cells and focus', () => {
		expect(
			getRowIndicesForDeletion({
				rowSelection: { b: true },
				selectedCells: new Set(['0:name']),
				focusedCell: { rowIndex: 2, columnId: 'name' },
				rows
			})
		).toEqual([1]);
	});

	it('falls back to selected cell rows', () => {
		expect(
			getRowIndicesForDeletion({
				rowSelection: {},
				selectedCells: new Set(['0:name', '2:score']),
				focusedCell: { rowIndex: 1, columnId: 'name' },
				rows
			})
		).toEqual([0, 2]);
	});

	it('falls back to the focused row when nothing is selected', () => {
		expect(
			getRowIndicesForDeletion({
				rowSelection: {},
				selectedCells: new Set(),
				focusedCell: { rowIndex: 1, columnId: 'name' },
				rows
			})
		).toEqual([1]);
	});
});

describe('getDataGridSelectColumn', () => {
	it('provides a TanStack cell renderer like upstream', () => {
		const column = getDataGridSelectColumn<{ id: string }>({ enableRowMarkers: true });

		expect(typeof column.cell).toBe('function');
		if (typeof column.cell !== 'function') return;

		const result = column.cell({
			row: { id: 'a', index: 4 },
			table: {}
		} as never);

		expect(result).toBeInstanceOf(RenderComponentConfig);
		expect((result as RenderComponentConfig<typeof result.component>).props).toMatchObject({
			row: { id: 'a', index: 4 },
			table: {},
			rowIndex: 4,
			enableRowMarkers: true,
			readOnly: false,
			hitboxSize: 'default',
			debug: false
		});
	});
});

describe('getColumnPinningStyle', () => {
	it('includes the column size like upstream', () => {
		const column = {
			getIsPinned: () => false,
			getIsLastColumn: () => false,
			getIsFirstColumn: () => false,
			getStart: () => 0,
			getAfter: () => 0,
			getSize: () => 180
		} as never;

		expect(getColumnPinningStyle({ column })).toMatchObject({
			position: 'relative',
			background: 'var(--background)',
			opacity: 1,
			width: 180
		});
	});
});

describe('data grid filters', () => {
	const filterFn = getFilterFn<{ score: number; startedAt: string }>();
	const row = {
		getValue: (columnId: string) =>
			({
				score: 42,
				startedAt: '2023-06-15T00:00:00.000Z'
			})[columnId]
	} as Pick<Row<{ score: number; startedAt: string }>, 'getValue'> as Row<{
		score: number;
		startedAt: string;
	}>;

	it('uses the upstream isBetween operator for number filters', () => {
		expect(NUMBER_FILTER_OPERATORS.some((operator) => operator.value === 'isBetween')).toBe(true);
		expect(
			filterFn(row, 'score', { operator: 'isBetween', value: 40, endValue: 50 }, () => {})
		).toBe(true);
		expect(
			filterFn(row, 'score', { operator: 'isBetween', value: 1, endValue: 10 }, () => {})
		).toBe(false);
	});

	it('uses endValue for date between filters', () => {
		expect(
			filterFn(
				row,
				'startedAt',
				{
					operator: 'isBetween',
					value: '2023-01-01T00:00:00.000Z',
					endValue: '2023-12-31T00:00:00.000Z'
				},
				() => {}
			)
		).toBe(true);
	});
});
