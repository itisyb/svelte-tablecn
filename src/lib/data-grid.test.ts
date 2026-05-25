import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, normalize } from 'node:path';
import type { Row } from '@tanstack/table-core';
import { describe, expect, it } from 'vitest';
import {
	formatDateForDisplay,
	formatDateToString,
	formatFileSize,
	getColumnVariant,
	getColumnPinningStyle,
	getFileIcon,
	getIsInPopover,
	getRowIndicesForDeletion,
	getUrlHref,
	parseLocalDate,
	parsePastedCellValue,
	parseTsv,
	serializeCellsToTsv
} from './data-grid.js';
import { getFilterFn, NUMBER_FILTER_OPERATORS } from './data-grid-filters.js';
import { filterRows } from './filter-rows.js';
import { formatDate } from './format.js';
import { generateId } from './id.js';
import { getFiltersStateParser, getSortingStateParser } from './parsers.js';
import { useCallbackRef } from './hooks/use-callback-ref.js';
import {
	getColumnPinningStyle as getDataTableColumnPinningStyle,
	getDefaultFilterOperator as getDataTableDefaultFilterOperator,
	getFilterOperators as getDataTableFilterOperators,
	getValidFilters as getDataTableValidFilters
} from './data-table.js';
import { getDataGridSelectColumn } from './components/data-grid/data-grid-select-column.js';
import { RenderComponentConfig } from './table/index.js';
import {
	DataGrid as ComponentDataGrid,
	DataGridActionBar as ComponentDataGridActionBar,
	DataGridFilterMenu as ComponentDataGridFilterMenu,
	DataGridKeyboardShortcuts as ComponentDataGridKeyboardShortcuts,
	DataGridRowHeightMenu as ComponentDataGridRowHeightMenu,
	DataGridSkeleton as ComponentDataGridSkeleton,
	DataGridSkeletonGrid as ComponentDataGridSkeletonGrid,
	DataGridSkeletonToolbar as ComponentDataGridSkeletonToolbar,
	DataGridSortMenu as ComponentDataGridSortMenu,
	DataGridViewMenu as ComponentDataGridViewMenu,
	FileCell as ComponentFileCell,
	RowSelectCell as ComponentRowSelectCell,
	RowSelectHeader as ComponentRowSelectHeader,
	getDataGridSelectColumn as getComponentDataGridSelectColumn,
	useDataGrid as useComponentDataGrid,
	useDataGridUndoRedo as useComponentDataGridUndoRedo
} from './components/data-grid/index.js';
import {
	BOOLEAN_FILTER_OPERATORS as ROOT_BOOLEAN_FILTER_OPERATORS,
	DataGrid as RootDataGrid,
	DataGridActionBar as RootDataGridActionBar,
	DataGridFilterMenu as RootDataGridFilterMenu,
	DataGridKeyboardShortcuts as RootDataGridKeyboardShortcuts,
	DataGridRowHeightMenu as RootDataGridRowHeightMenu,
	DataGridSkeleton as RootDataGridSkeleton,
	DataGridSkeletonGrid as RootDataGridSkeletonGrid,
	DataGridSkeletonToolbar as RootDataGridSkeletonToolbar,
	DataGridSortMenu as RootDataGridSortMenu,
	DataGridViewMenu as RootDataGridViewMenu,
	DATE_FILTER_OPERATORS as ROOT_DATE_FILTER_OPERATORS,
	FileCell as RootFileCell,
	NUMBER_FILTER_OPERATORS as ROOT_NUMBER_FILTER_OPERATORS,
	OVERSCAN as ROOT_OVERSCAN,
	RowSelectCell as RootRowSelectCell,
	RowSelectHeader as RootRowSelectHeader,
	SELECT_FILTER_OPERATORS as ROOT_SELECT_FILTER_OPERATORS,
	TEXT_FILTER_OPERATORS as ROOT_TEXT_FILTER_OPERATORS,
	formatDateForDisplay as rootFormatDateForDisplay,
	formatDateToString as rootFormatDateToString,
	formatFileSize as rootFormatFileSize,
	getColumnVariant as getRootColumnVariant,
	getDefaultOperator as getRootDefaultOperator,
	getFileIcon as getRootFileIcon,
	getFilterFn as getRootFilterFn,
	getOperatorsForVariant as getRootOperatorsForVariant,
	getUrlHref as getRootUrlHref,
	getDataGridSelectColumn as getRootDataGridSelectColumn,
	parseLocalDate as rootParseLocalDate,
	useDataGrid as useRootDataGrid,
	useDataGridUndoRedo as useRootDataGridUndoRedo
} from './index.js';
import { OVERSCAN } from './config/data-grid.js';

describe('shared upstream utilities', () => {
	it('formats dates with the original en-US long date defaults', () => {
		expect(formatDate('2024-02-29T00:00:00Z')).toBe('February 29, 2024');
		expect(formatDate('2024-02-29T00:00:00Z', { month: 'short', day: 'numeric' })).toBe(
			'Feb 29, 2024'
		);
		expect(formatDate(undefined)).toBe('');
		expect(formatDate('not-a-date')).toBe('');
	});

	it('generates IDs with the original options shape and default length', () => {
		expect(generateId()).toHaveLength(12);
		expect(generateId({ length: 8 })).toHaveLength(8);
		expect(generateId('unknown-prefix', { length: 6 })).toHaveLength(6);
		expect(generateId({ length: 40 })).toMatch(/^[0-9A-Za-z]+$/);
	});

	it('wraps callback refs like the original Radix-derived helper', () => {
		const callback = (value: string) => `received:${value}`;
		const callbackRef = useCallbackRef(callback);
		const emptyCallbackRef = useCallbackRef<typeof callback>(undefined);

		expect(callbackRef).not.toBe(callback);
		expect(callbackRef('Ada')).toBe('received:Ada');
		expect(() => emptyCallbackRef('Ada')).not.toThrow();
		expect(emptyCallbackRef('Ada')).toBeUndefined();
	});
});

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

	it('returns Date values for pasted date cells like the original grid', () => {
		const result = parsePastedCellValue('2024-01-02', { variant: 'date' });

		expect(result.shouldSkip).toBe(false);
		expect(result.value).toBeInstanceOf(Date);
		expect((result.value as Date).getFullYear()).toBe(2024);
		expect((result.value as Date).getMonth()).toBe(0);
		expect((result.value as Date).getDate()).toBe(2);
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

describe('data-grid formatting helpers', () => {
	it('exports upstream URL, date, and file helpers', () => {
		expect(getUrlHref('example.com/path')).toBe('http://example.com/path');
		expect(getUrlHref('https://example.com/path')).toBe('https://example.com/path');
		expect(getUrlHref('javascript:alert(1)')).toBe('');

		const date = parseLocalDate('2024-02-29');
		expect(date).toBeInstanceOf(Date);
		expect(formatDateToString(date as Date)).toBe('2024-02-29');
		expect(parseLocalDate('2024-02-30')).toBeNull();
		expect(formatDateForDisplay('invalid-date')).toBe('invalid-date');

		expect(formatFileSize(0)).toBe('0 B');
		expect(formatFileSize(1536)).toBe('1.5 KB');
		expect(getFileIcon('image/png')).toBeTypeOf('function');
		expect(getColumnVariant('multi-select')).toMatchObject({ label: 'Multi-select' });
		expect(getColumnVariant(undefined)).toBeNull();
	});
});

describe('data-grid config', () => {
	it('keeps the virtual row overscan default aligned with upstream', () => {
		expect(OVERSCAN).toBe(6);
		expect(ROOT_OVERSCAN).toBe(OVERSCAN);
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

describe('package root data-grid component exports', () => {
	it('exposes the shipped data-grid surface from the package root', () => {
		expect(RootDataGrid).toBe(ComponentDataGrid);
		expect(RootDataGridActionBar).toBe(ComponentDataGridActionBar);
		expect(RootDataGridFilterMenu).toBe(ComponentDataGridFilterMenu);
		expect(RootDataGridKeyboardShortcuts).toBe(ComponentDataGridKeyboardShortcuts);
		expect(RootDataGridRowHeightMenu).toBe(ComponentDataGridRowHeightMenu);
		expect(RootDataGridSkeleton).toBe(ComponentDataGridSkeleton);
		expect(RootDataGridSkeletonGrid).toBe(ComponentDataGridSkeletonGrid);
		expect(RootDataGridSkeletonToolbar).toBe(ComponentDataGridSkeletonToolbar);
		expect(RootDataGridSortMenu).toBe(ComponentDataGridSortMenu);
		expect(RootDataGridViewMenu).toBe(ComponentDataGridViewMenu);
		expect(RootFileCell).toBe(ComponentFileCell);
		expect(RootRowSelectCell).toBe(ComponentRowSelectCell);
		expect(RootRowSelectHeader).toBe(ComponentRowSelectHeader);
		expect(getRootDataGridSelectColumn).toBe(getComponentDataGridSelectColumn);
		expect(useRootDataGrid).toBe(useComponentDataGrid);
		expect(useRootDataGridUndoRedo).toBe(useComponentDataGridUndoRedo);
	});
});

describe('data-grid registry item', () => {
	it('ships the exported action bar component and local primitive', () => {
		const registry = JSON.parse(readFileSync('registry.json', 'utf8')) as {
			items: Array<{
				name: string;
				files?: Array<{ target: string }>;
			}>;
		};
		const dataGrid = registry.items.find((item) => item.name === 'data-grid');
		const targets = new Set(dataGrid?.files?.map((file) => file.target));

		expect(targets.has('data-grid/data-grid-action-bar.svelte')).toBe(true);
		expect(targets.has('data-grid.ts')).toBe(true);
		expect(targets.has('action-bar/index.ts')).toBe(true);
		expect(targets.has('action-bar/action-bar.svelte')).toBe(true);
		expect(targets.has('action-bar/action-bar-item.svelte')).toBe(true);
	});

	it('ships standalone registry slices for the public data-grid helpers', () => {
		const registry = JSON.parse(readFileSync('registry.json', 'utf8')) as {
			items: Array<{ name: string }>;
		};
		const itemNames = new Set(registry.items.map((item) => item.name));

		expect(itemNames.has('data-grid-select-column')).toBe(true);
		expect(itemNames.has('data-grid-sort-menu')).toBe(true);
		expect(itemNames.has('data-grid-row-height-menu')).toBe(true);
		expect(itemNames.has('data-grid-view-menu')).toBe(true);
		expect(itemNames.has('data-grid-keyboard-shortcuts')).toBe(true);
		expect(itemNames.has('data-grid-filter-menu')).toBe(true);
		expect(itemNames.has('data-grid-skeleton')).toBe(true);
		expect(itemNames.has('use-data-grid-undo-redo')).toBe(true);
	});
});

describe('data-table registry items', () => {
	function getRegistryTargets(name: string) {
		const registry = JSON.parse(readFileSync('registry.json', 'utf8')) as {
			items: Array<{
				name: string;
				files?: Array<{ path: string; target: string }>;
			}>;
		};
		const item = registry.items.find((registryItem) => registryItem.name === name);
		return new Set(item?.files?.map((file) => file.target));
	}

	it('ships local helper modules used by the full data-table block', () => {
		const targets = getRegistryTargets('data-table');

		expect(targets.has('data-table-range-utils.ts')).toBe(true);
		expect(targets.has('filter-rows.ts')).toBe(true);
		expect(targets.has('data-grid-filters.ts')).toBe(true);
		expect(targets.has('types/data-grid.ts')).toBe(true);
	});

	it('ships local helper modules used by standalone filter blocks', () => {
		for (const name of ['data-table-filter-list', 'data-table-filter-menu']) {
			const targets = getRegistryTargets(name);

			expect(targets.has('data-table-range-utils.ts')).toBe(true);
			expect(targets.has('types/data-grid.ts')).toBe(true);
			expect(targets.has('data-table/data-table-view-options.svelte')).toBe(true);
		}
	});

	it('ships local files referenced by registry item imports', () => {
		const registry = JSON.parse(readFileSync('registry.json', 'utf8')) as {
			items: Array<{
				name: string;
				files?: Array<{ path: string; target: string }>;
			}>;
		};
		const sourceToTarget = new Map<string, string>();
		for (const item of registry.items) {
			for (const file of item.files ?? []) {
				sourceToTarget.set(normalize(file.path), file.target);
			}
		}

		function resolveSource(from: string, specifier: string) {
			const base = specifier.startsWith('$lib/')
				? normalize(specifier.replace(/^\$lib\//, 'src/lib/'))
				: specifier.startsWith('.')
					? normalize(join(dirname(from), specifier))
					: undefined;

			if (!base) return undefined;

			const sourceBase = base.endsWith('.js') ? base.slice(0, -3) : base;
			return [
				base,
				sourceBase,
				`${sourceBase}.ts`,
				`${sourceBase}.svelte`,
				`${sourceBase}.svelte.ts`,
				`${sourceBase}/index.ts`
			].find((candidate) => existsSync(candidate));
		}

		const missing: string[] = [];
		const importPattern = /(?:import|export)\s+(?:type\s+)?(?:[\s\S]*?from\s+)?['"]([^'"]+)['"]/g;

		for (const item of registry.items) {
			const targets = new Set(item.files?.map((file) => file.target));
			for (const file of item.files ?? []) {
				if (!existsSync(file.path)) continue;

				const content = readFileSync(file.path, 'utf8');
				for (const match of content.matchAll(importPattern)) {
					const specifier = match[1];
					if (
						!specifier ||
						specifier === '$lib/utils.js' ||
						specifier === '$lib/utils' ||
						specifier.startsWith('$lib/components/ui/') ||
						specifier.startsWith('$lib/table')
					) {
						continue;
					}

					const source = resolveSource(file.path, specifier);
					const target = source ? sourceToTarget.get(normalize(source)) : undefined;
					if (target && !targets.has(target)) {
						missing.push(`${item.name}: ${file.target} imports ${specifier} without ${target}`);
					}
				}
			}
		}

		expect(missing).toEqual([]);
	});

	it('declares registry dependencies for imported UI primitives it does not bundle', () => {
		const registry = JSON.parse(readFileSync('registry.json', 'utf8')) as {
			items: Array<{
				name: string;
				registryDependencies?: string[];
				files?: Array<{ path: string }>;
			}>;
		};
		const importPattern = /\$lib\/components\/ui\/([^/'"]+)/g;
		const missing: string[] = [];

		for (const item of registry.items) {
			const dependencies = new Set(item.registryDependencies ?? []);
			const bundledUiFolders = new Set(
				item.files
					?.map((file) => file.path.match(/^src\/lib\/components\/ui\/([^/]+)/)?.[1])
					.filter((folder): folder is string => Boolean(folder))
			);

			for (const file of item.files ?? []) {
				if (!existsSync(file.path)) continue;

				const content = readFileSync(file.path, 'utf8');
				for (const match of content.matchAll(importPattern)) {
					const primitive = match[1];
					if (!primitive || bundledUiFolders.has(primitive) || dependencies.has(primitive)) {
						continue;
					}

					missing.push(`${item.name}: ${file.path} imports ${primitive}`);
				}
			}
		}

		expect(missing).toEqual([]);
	});

	it('declares package dependencies imported by shipped files', () => {
		const registry = JSON.parse(readFileSync('registry.json', 'utf8')) as {
			items: Array<{
				name: string;
				dependencies?: string[];
				files?: Array<{ path: string }>;
			}>;
		};
		const packageImportPattern =
			/(?:import|export)\s+(?:type\s+)?(?:[\s\S]*?from\s+)?['"]([^'"]+)['"]/g;
		const missing: string[] = [];

		function getPackageName(specifier: string) {
			if (
				specifier.startsWith('.') ||
				specifier.startsWith('$lib/') ||
				specifier.startsWith('$UTILS$') ||
				specifier.startsWith('$app/') ||
				specifier === 'svelte' ||
				specifier.startsWith('svelte/')
			) {
				return undefined;
			}

			return specifier.startsWith('@')
				? specifier.split('/').slice(0, 2).join('/')
				: specifier.split('/')[0];
		}

		for (const item of registry.items) {
			const dependencies = new Set(item.dependencies ?? []);
			for (const file of item.files ?? []) {
				if (!existsSync(file.path)) continue;

				const content = readFileSync(file.path, 'utf8');
				for (const match of content.matchAll(packageImportPattern)) {
					const packageName = match[1] ? getPackageName(match[1]) : undefined;
					if (!packageName || dependencies.has(packageName)) continue;

					missing.push(`${item.name}: ${file.path} imports ${packageName}`);
				}
			}
		}

		expect(missing).toEqual([]);
	});
});

describe('package root data-grid filter exports', () => {
	it('exposes the full data-grid filter utility surface', () => {
		expect(getRootFilterFn).toBe(getFilterFn);
		expect(ROOT_TEXT_FILTER_OPERATORS[0]?.value).toBe('contains');
		expect(ROOT_NUMBER_FILTER_OPERATORS).toBe(NUMBER_FILTER_OPERATORS);
		expect(ROOT_DATE_FILTER_OPERATORS[0]?.value).toBe('equals');
		expect(ROOT_SELECT_FILTER_OPERATORS[0]?.value).toBe('is');
		expect(ROOT_BOOLEAN_FILTER_OPERATORS[0]?.value).toBe('isTrue');
		expect(getRootDefaultOperator('multi-select')).toBe('is');
		expect(getRootOperatorsForVariant('number')).toBe(NUMBER_FILTER_OPERATORS);
	});

	it('exposes upstream data-grid formatting helpers from the package root', () => {
		expect(getRootUrlHref).toBe(getUrlHref);
		expect(rootParseLocalDate).toBe(parseLocalDate);
		expect(rootFormatDateToString).toBe(formatDateToString);
		expect(rootFormatDateForDisplay).toBe(formatDateForDisplay);
		expect(rootFormatFileSize).toBe(formatFileSize);
		expect(getRootFileIcon).toBe(getFileIcon);
		expect(getRootColumnVariant).toBe(getColumnVariant);
	});
});

describe('data-table state parsers', () => {
	it('rejects a sorting query when any sort references an unknown column like upstream', () => {
		const parser = getSortingStateParser<{ name: string; age: number }>(new Set(['name']));

		expect(
			parser.parse(
				JSON.stringify([
					{ id: 'name', desc: false },
					{ id: 'age', desc: true }
				])
			)
		).toBeNull();
	});

	it('rejects a filters query when any filter is malformed like upstream', () => {
		const parser = getFiltersStateParser<{ name: string; age: number }>(new Set(['name', 'age']));

		expect(
			parser.parse(
				JSON.stringify([
					{
						id: 'name',
						value: 'alice',
						variant: 'text',
						operator: 'contains',
						filterId: 'name-filter'
					},
					{
						id: 'age',
						variant: 'number',
						operator: 'equals',
						filterId: 'age-filter'
					}
				])
			)
		).toBeNull();
	});

	it('compares filters without generated filter ids like upstream', () => {
		const parser = getFiltersStateParser<{ name: string }>(new Set(['name']));

		expect(
			parser.eq(
				[
					{
						id: 'name',
						value: 'alice',
						variant: 'text',
						operator: 'contains',
						filterId: 'first-id'
					}
				],
				[
					{
						id: 'name',
						value: 'alice',
						variant: 'text',
						operator: 'contains',
						filterId: 'second-id'
					}
				]
			)
		).toBe(true);
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

	it('passes data-table pinned border styles through like upstream', () => {
		const leftColumn = {
			getIsPinned: () => 'left',
			getIsLastColumn: (side: string) => side === 'left',
			getIsFirstColumn: () => false,
			getStart: () => 24,
			getAfter: () => 0,
			getSize: () => 120
		} as never;
		const rightColumn = {
			getIsPinned: () => 'right',
			getIsLastColumn: () => false,
			getIsFirstColumn: (side: string) => side === 'right',
			getStart: () => 0,
			getAfter: () => 16,
			getSize: () => 140
		} as never;

		expect(getDataTableColumnPinningStyle({ column: leftColumn, withBorder: true })).toMatchObject({
			boxShadow: '-4px 0 4px -4px var(--border) inset',
			left: '24px',
			position: 'sticky',
			zIndex: 1
		});
		expect(getDataTableColumnPinningStyle({ column: rightColumn, withBorder: true })).toMatchObject({
			boxShadow: '4px 0 4px -4px var(--border) inset',
			right: '16px',
			position: 'sticky',
			zIndex: 1
		});
	});

	it('exposes data-table filter helpers from the data-table module like upstream', () => {
		expect(getDataTableFilterOperators('number').some((item) => item.value === 'isBetween')).toBe(
			true
		);
		expect(getDataTableFilterOperators('number').find((item) => item.value === 'equals')).toEqual(
			{ label: 'Is', value: 'equals' }
		);
		expect(
			getDataTableFilterOperators('number').find((item) => item.value === 'lessThanOrEqual')
		).toEqual({ label: 'Is less than or equal to', value: 'lessThanOrEqual' });
		expect(
			getDataTableFilterOperators('date').some((item) => item.value === 'onOrBefore')
		).toBe(true);
		expect(
			getDataTableFilterOperators('date').find((item) => item.value === 'onOrBefore')
		).toEqual({ label: 'Is on or before', value: 'onOrBefore' });
		expect(getDataTableFilterOperators('date').some((item) => item.value === 'onOrAfter')).toBe(
			true
		);
		expect(
			getDataTableFilterOperators('boolean').find((item) => item.value === 'isFalse')
		).toEqual({ label: 'Is not', value: 'isFalse' });
		expect(getDataTableFilterOperators('select')).not.toContainEqual({
			label: 'Has any of',
			value: 'isAnyOf'
		});
		expect(getDataTableFilterOperators('multiSelect')).toEqual([
			{ label: 'Has any of', value: 'isAnyOf' },
			{ label: 'Has none of', value: 'isNoneOf' },
			{ label: 'Is empty', value: 'isEmpty' },
			{ label: 'Is not empty', value: 'isNotEmpty' }
		]);
		expect(getDataTableDefaultFilterOperator('range')).toBe('equals');
		expect(getDataTableDefaultFilterOperator('multiSelect')).toBe('isAnyOf');
		expect(
			getDataTableValidFilters([
				{
					id: 'name',
					value: '',
					variant: 'text',
					operator: 'contains',
					filterId: 'empty'
				},
				{
					id: 'active',
					value: '',
					variant: 'boolean',
					operator: 'isTrue',
					filterId: 'boolean'
				}
			])
		).toEqual([
			{
				id: 'active',
				value: '',
				variant: 'boolean',
				operator: 'isTrue',
				filterId: 'boolean'
			}
		]);
	});

	it('parses and applies upstream date boundary operators for data-table filters', () => {
		const parser = getFiltersStateParser<{ startedAt: string }>(new Set(['startedAt']));
		const filters = parser.parse(
			JSON.stringify([
				{
					id: 'startedAt',
					value: '2023-06-15T00:00:00.000Z',
					variant: 'date',
					operator: 'onOrBefore',
					filterId: 'started-at-filter'
				}
			])
		);

		expect(filters).not.toBeNull();
		expect(
			filterRows(
				[
					{ startedAt: '2023-06-14T00:00:00.000Z' },
					{ startedAt: '2023-06-15T00:00:00.000Z' },
					{ startedAt: '2023-06-16T00:00:00.000Z' }
				],
				filters ?? [],
				'and'
			)
		).toEqual([
			{ startedAt: '2023-06-14T00:00:00.000Z' },
			{ startedAt: '2023-06-15T00:00:00.000Z' }
		]);
	});
});

describe('getIsInPopover', () => {
	it('recognizes Svelte select and dialog overlay content', () => {
		const PreviousElement = globalThis.Element;
		class TestElement {
			constructor(private readonly matchingSelector: string) {}

			closest(selector: string) {
				return selector.includes(this.matchingSelector) ? this : null;
			}
		}

		try {
			globalThis.Element = TestElement as unknown as typeof Element;

			expect(getIsInPopover(new TestElement('select-content'))).toBe(true);
			expect(getIsInPopover(new TestElement('dialog-content'))).toBe(true);
		} finally {
			globalThis.Element = PreviousElement;
		}
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

	it('does not coerce numeric strings for equality filters like upstream', () => {
		expect(filterFn(row, 'score', { operator: 'equals', value: '042' }, () => {})).toBe(false);
		expect(filterFn(row, 'score', { operator: 'notEquals', value: '042' }, () => {})).toBe(
			true
		);
	});

	it('falls back when numeric comparison values are not numbers like upstream', () => {
		expect(filterFn(row, 'score', { operator: 'greaterThan', value: '100' }, () => {})).toBe(
			true
		);
		expect(
			filterFn(row, 'score', { operator: 'isBetween', value: '1', endValue: '10' }, () => {})
		).toBe(true);
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
