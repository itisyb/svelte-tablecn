import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, normalize } from 'node:path';
import type { Row } from '@tanstack/table-core';
import { describe, expect, it, vi } from 'vitest';
import {
	formatDateForDisplay,
	formatDateToString,
	formatFileSize,
	getCellKey as getDataGridCellKey,
	getColumnVariant,
	getColumnPinningStyle,
	getFileIcon,
	getLineCount as getDataGridLineCount,
	getIsInPopover,
	getRowIndicesForDeletion,
	getRowHeightValue as getDataGridRowHeightValue,
	getUrlHref,
	parseCellKey as parseDataGridCellKey,
	parseLocalDate,
	parsePastedCellValue,
	parseTsv,
	serializeCellsToTsv
} from './data-grid.js';
import { getFilterFn, NUMBER_FILTER_OPERATORS } from './data-grid-filters.js';
import { filterRows } from './filter-rows.js';
import { formatDate } from './format.js';
import { generateId } from './id.js';
import { fromSqlFilterOperator, toSqlFilterOperator } from './map-sql-filter-operators.js';
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
	DataTable as ComponentDataTable,
	DataTableAdvancedToolbar as ComponentDataTableAdvancedToolbar,
	DataTableColumnHeader as ComponentDataTableColumnHeader,
	DataTableDateFilter as ComponentDataTableDateFilter,
	DataTableFacetedFilter as ComponentDataTableFacetedFilter,
	DataTableFilterList as ComponentDataTableFilterList,
	DataTableFilterMenu as ComponentDataTableFilterMenu,
	DataTablePagination as ComponentDataTablePagination,
	DataTableRangeFilter as ComponentDataTableRangeFilter,
	DataTableSkeleton as ComponentDataTableSkeleton,
	DataTableSliderFilter as ComponentDataTableSliderFilter,
	DataTableSortList as ComponentDataTableSortList,
	DataTableToolbar as ComponentDataTableToolbar,
	DataTableViewOptions as ComponentDataTableViewOptions,
	useDataTable as useComponentDataTable
} from './components/data-table/index.js';
import {
	Sortable as ComponentSortable,
	SortableContent as ComponentSortableContent,
	SortableItem as ComponentSortableItem,
	SortableItemHandle as ComponentSortableItemHandle,
	SortableOverlay as ComponentSortableOverlay
} from './components/ui/sortable/index.js';
import {
	Drawer as ComponentDrawer,
	DrawerClose as ComponentDrawerClose,
	DrawerContent as ComponentDrawerContent,
	DrawerDescription as ComponentDrawerDescription,
	DrawerFooter as ComponentDrawerFooter,
	DrawerHeader as ComponentDrawerHeader,
	DrawerOverlay as ComponentDrawerOverlay,
	DrawerPortal as ComponentDrawerPortal,
	DrawerTitle as ComponentDrawerTitle,
	DrawerTrigger as ComponentDrawerTrigger
} from './components/ui/drawer/index.js';
import {
	Form as ComponentForm,
	FormControl as ComponentFormControl,
	FormDescription as ComponentFormDescription,
	FormField as ComponentFormField,
	FormItem as ComponentFormItem,
	FormLabel as ComponentFormLabel,
	FormMessage as ComponentFormMessage,
	getFormErrorMessage as getComponentFormErrorMessage,
	getFormFieldState as getComponentFormFieldState
} from './components/ui/form/index.js';
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
	DataTable as RootDataTable,
	DataTableAdvancedToolbar as RootDataTableAdvancedToolbar,
	DataTableColumnHeader as RootDataTableColumnHeader,
	DataTableDateFilter as RootDataTableDateFilter,
	DataTableFacetedFilter as RootDataTableFacetedFilter,
	DataTableFilterList as RootDataTableFilterList,
	DataTableFilterMenu as RootDataTableFilterMenu,
	DataTablePagination as RootDataTablePagination,
	DataTableRangeFilter as RootDataTableRangeFilter,
	DataTableSkeleton as RootDataTableSkeleton,
	DataTableSliderFilter as RootDataTableSliderFilter,
	DataTableSortList as RootDataTableSortList,
	DataTableToolbar as RootDataTableToolbar,
	DataTableViewOptions as RootDataTableViewOptions,
	DATE_FILTER_OPERATORS as ROOT_DATE_FILTER_OPERATORS,
	Drawer as RootDrawer,
	DrawerClose as RootDrawerClose,
	DrawerContent as RootDrawerContent,
	DrawerDescription as RootDrawerDescription,
	DrawerFooter as RootDrawerFooter,
	DrawerHeader as RootDrawerHeader,
	DrawerOverlay as RootDrawerOverlay,
	DrawerPortal as RootDrawerPortal,
	DrawerTitle as RootDrawerTitle,
	DrawerTrigger as RootDrawerTrigger,
	FileCell as RootFileCell,
	Form as RootForm,
	FormControl as RootFormControl,
	FormDescription as RootFormDescription,
	FormField as RootFormField,
	FormItem as RootFormItem,
	FormLabel as RootFormLabel,
	FormMessage as RootFormMessage,
	getFormErrorMessage as getRootFormErrorMessage,
	getFormFieldState as getRootFormFieldState,
	NUMBER_FILTER_OPERATORS as ROOT_NUMBER_FILTER_OPERATORS,
	DEFAULT_ROW_HEIGHT as ROOT_DEFAULT_ROW_HEIGHT,
	OVERSCAN as ROOT_OVERSCAN,
	RowSelectCell as RootRowSelectCell,
	RowSelectHeader as RootRowSelectHeader,
	SELECT_FILTER_OPERATORS as ROOT_SELECT_FILTER_OPERATORS,
	Sortable as RootSortable,
	SortableContent as RootSortableContent,
	SortableItem as RootSortableItem,
	SortableItemHandle as RootSortableItemHandle,
	SortableOverlay as RootSortableOverlay,
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
	useDataTable as useRootDataTable,
	useDataGridUndoRedo as useRootDataGridUndoRedo
} from './index.js';
import { DEFAULT_ROW_HEIGHT, OVERSCAN } from './config/data-grid.js';

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

	it('exposes upstream cell key and row height helpers from the data-grid module', () => {
		expect(getDataGridCellKey(2, 'status')).toBe('2:status');
		expect(parseDataGridCellKey('2:status')).toEqual({ rowIndex: 2, columnId: 'status' });
		expect(parseDataGridCellKey('bad')).toEqual({ rowIndex: 0, columnId: '' });
		expect(getDataGridRowHeightValue('medium')).toBe(56);
		expect(getDataGridLineCount('extra-tall')).toBe(4);
	});
});

describe('data-grid config', () => {
	it('keeps the virtual row overscan default aligned with upstream', () => {
		expect(DEFAULT_ROW_HEIGHT).toBe('short');
		expect(ROOT_DEFAULT_ROW_HEIGHT).toBe(DEFAULT_ROW_HEIGHT);
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

describe('package root data-table component exports', () => {
	it('exposes the shipped data-table surface from the package root', () => {
		expect(RootDataTable).toBe(ComponentDataTable);
		expect(RootDataTableAdvancedToolbar).toBe(ComponentDataTableAdvancedToolbar);
		expect(RootDataTableColumnHeader).toBe(ComponentDataTableColumnHeader);
		expect(RootDataTableDateFilter).toBe(ComponentDataTableDateFilter);
		expect(RootDataTableFacetedFilter).toBe(ComponentDataTableFacetedFilter);
		expect(RootDataTableFilterList).toBe(ComponentDataTableFilterList);
		expect(RootDataTableFilterMenu).toBe(ComponentDataTableFilterMenu);
		expect(RootDataTablePagination).toBe(ComponentDataTablePagination);
		expect(RootDataTableRangeFilter).toBe(ComponentDataTableRangeFilter);
		expect(RootDataTableSkeleton).toBe(ComponentDataTableSkeleton);
		expect(RootDataTableSliderFilter).toBe(ComponentDataTableSliderFilter);
		expect(RootDataTableSortList).toBe(ComponentDataTableSortList);
		expect(RootDataTableToolbar).toBe(ComponentDataTableToolbar);
		expect(RootDataTableViewOptions).toBe(ComponentDataTableViewOptions);
		expect(useRootDataTable).toBe(useComponentDataTable);
	});
});

describe('package root sortable component exports', () => {
	it('exposes the shipped sortable primitive from the package root', () => {
		expect(RootSortable).toBe(ComponentSortable);
		expect(RootSortableContent).toBe(ComponentSortableContent);
		expect(RootSortableItem).toBe(ComponentSortableItem);
		expect(RootSortableItemHandle).toBe(ComponentSortableItemHandle);
		expect(RootSortableOverlay).toBe(ComponentSortableOverlay);
	});
});

describe('package root drawer component exports', () => {
	it('exposes the shipped drawer primitive from the package root', () => {
		expect(RootDrawer).toBe(ComponentDrawer);
		expect(RootDrawerClose).toBe(ComponentDrawerClose);
		expect(RootDrawerContent).toBe(ComponentDrawerContent);
		expect(RootDrawerDescription).toBe(ComponentDrawerDescription);
		expect(RootDrawerFooter).toBe(ComponentDrawerFooter);
		expect(RootDrawerHeader).toBe(ComponentDrawerHeader);
		expect(RootDrawerOverlay).toBe(ComponentDrawerOverlay);
		expect(RootDrawerPortal).toBe(ComponentDrawerPortal);
		expect(RootDrawerTitle).toBe(ComponentDrawerTitle);
		expect(RootDrawerTrigger).toBe(ComponentDrawerTrigger);
	});
});

describe('package root form component exports', () => {
	it('exposes the shipped form primitive from the package root', () => {
		expect(RootForm).toBe(ComponentForm);
		expect(RootFormControl).toBe(ComponentFormControl);
		expect(RootFormDescription).toBe(ComponentFormDescription);
		expect(RootFormField).toBe(ComponentFormField);
		expect(RootFormItem).toBe(ComponentFormItem);
		expect(RootFormLabel).toBe(ComponentFormLabel);
		expect(RootFormMessage).toBe(ComponentFormMessage);
	});

	it('exposes the shipped form helpers from the package root', () => {
		expect(getRootFormFieldState).toBe(getComponentFormFieldState);
		expect(getRootFormErrorMessage).toBe(getComponentFormErrorMessage);
	});

	it('exposes the shipped primitive type contracts from the package root', () => {
		const packageRoot = readFileSync('src/lib/index.ts', 'utf8');
		const uiBarrel = readFileSync('src/lib/components/ui/index.ts', 'utf8');

		for (const exportedType of [
			'FormControlAttributes',
			'FormContextValue',
			'FormFieldContextValue',
			'FormFieldError',
			'FormFieldState',
			'FormItemContextValue',
			'DrawerContentProps',
			'DrawerDirection',
			'DrawerProps',
			'SortableItemData',
			'SortableOrientation',
			'SortableValue'
		]) {
			expect(packageRoot).toContain(`type ${exportedType}`);
			expect(uiBarrel).toContain(`type ${exportedType}`);
		}
	});

	it('exposes the original data-grid cell props type contract from the package root', () => {
		const packageRoot = readFileSync('src/lib/index.ts', 'utf8');
		const dataGridTypes = readFileSync('src/lib/types/data-grid.ts', 'utf8');

		expect(packageRoot).toContain('DataGridCellProps');
		expect(dataGridTypes).toContain('TableMeta');
		expect(dataGridTypes).toContain('export interface DataGridCellProps');

		for (const field of [
			'cell: Cell<TData, unknown>',
			'tableMeta: TableMeta<TData>',
			'rowHeight: RowHeightValue',
			'isSearchMatch: boolean',
			'isActiveSearchMatch: boolean',
			'readOnly: boolean'
		]) {
			expect(dataGridTypes).toContain(field);
		}
	});
});

describe('data-grid registry item', () => {
	it('keeps every upstream installable registry item with only intentional Svelte additions', () => {
		const registry = JSON.parse(readFileSync('registry.json', 'utf8')) as {
			items: Array<{ name: string }>;
		};
		const originalRegistryItems = [
			'data-table',
			'data-table-sort-list',
			'data-table-filter-list',
			'data-table-filter-menu',
			'data-grid',
			'data-grid-select-column',
			'data-grid-sort-menu',
			'data-grid-row-height-menu',
			'data-grid-view-menu',
			'data-grid-keyboard-shortcuts',
			'data-grid-filter-menu',
			'data-grid-skeleton',
			'use-data-grid-undo-redo'
		];
		const svelteOnlyRegistryItems = ['drawer', 'form', 'sortable'];
		const expectedRegistryItems = [...originalRegistryItems, ...svelteOnlyRegistryItems].sort();
		const actualRegistryItems = registry.items.map((item) => item.name).sort();

		expect(actualRegistryItems).toEqual(expectedRegistryItems);
	});

	it('preserves upstream registry dependencies for common installable items', () => {
		const registry = JSON.parse(readFileSync('registry.json', 'utf8')) as {
			items: Array<{
				name: string;
				registryDependencies?: string[];
			}>;
		};
		const originalRegistryDependencies = new Map([
			[
				'data-table',
				[
					'badge',
					'button',
					'calendar',
					'command',
					'dropdown-menu',
					'input',
					'popover',
					'select',
					'separator',
					'slider',
					'table'
				]
			],
			['data-table-sort-list', ['badge', 'button', 'command', 'popover', 'select']],
			['data-table-filter-list', ['badge', 'button', 'calendar', 'command', 'input', 'popover', 'select']],
			['data-table-filter-menu', ['badge', 'button', 'calendar', 'command', 'input', 'popover', 'select']],
			[
				'data-grid',
				[
					'badge',
					'button',
					'calendar',
					'checkbox',
					'command',
					'dialog',
					'dropdown-menu',
					'input',
					'popover',
					'select',
					'separator',
					'skeleton',
					'textarea',
					'tooltip'
				]
			],
			['data-grid-select-column', ['checkbox']],
			['data-grid-sort-menu', ['badge', 'button', 'command', 'popover', 'select']],
			['data-grid-row-height-menu', ['select']],
			['data-grid-view-menu', ['button', 'command', 'popover']],
			['data-grid-keyboard-shortcuts', ['button', 'dialog', 'input', 'kbd', 'separator']],
			['data-grid-filter-menu', ['badge', 'button', 'calendar', 'command', 'input', 'popover', 'select']],
			['data-grid-skeleton', ['skeleton']],
			['use-data-grid-undo-redo', []]
		] as const);
		const missing: string[] = [];

		for (const [name, originalDependencies] of originalRegistryDependencies) {
			const item = registry.items.find((registryItem) => registryItem.name === name);
			const dependencies = new Set(item?.registryDependencies ?? []);

			for (const dependency of originalDependencies) {
				if (!dependencies.has(dependency)) {
					missing.push(`${name}: ${dependency}`);
				}
			}
		}

		expect(missing).toEqual([]);
	});

	it('ships Svelte equivalents for the original full data-grid registry bundle', () => {
		const registry = JSON.parse(readFileSync('registry.json', 'utf8')) as {
			items: Array<{
				name: string;
				files?: Array<{ target: string }>;
			}>;
		};
		const dataGrid = registry.items.find((item) => item.name === 'data-grid');
		const targets = new Set(dataGrid?.files?.map((file) => file.target));
		const originalEquivalentTargets = [
			'data-grid/data-grid.svelte',
			'data-grid/data-grid-cell.svelte',
			'data-grid/data-grid-cell-wrapper.svelte',
			'data-grid/data-grid-column-header.svelte',
			'data-grid/data-grid-context-menu.svelte',
			'data-grid/data-grid-paste-dialog.svelte',
			'data-grid/data-grid-row.svelte',
			'data-grid/data-grid-search.svelte',
			'use-badge-overflow.svelte.ts',
			'use-data-grid.svelte.ts',
			'use-debounced-callback.ts',
			'data-grid.ts',
			'types/data-grid.ts'
		];

		for (const target of originalEquivalentTargets) {
			expect(targets.has(target)).toBe(true);
		}

		for (const cellTarget of [
			'data-grid/cells/short-text-cell.svelte',
			'data-grid/cells/long-text-cell.svelte',
			'data-grid/cells/number-cell.svelte',
			'data-grid/cells/checkbox-cell.svelte',
			'data-grid/cells/select-cell.svelte',
			'data-grid/cells/multi-select-cell.svelte',
			'data-grid/cells/date-cell.svelte',
			'data-grid/cells/url-cell.svelte',
			'data-grid/cells/file-cell.svelte'
		]) {
			expect(targets.has(cellTarget)).toBe(true);
		}

		expect(targets.has('use-window-size.svelte.ts')).toBe(false);
	});

	it('ships Svelte equivalents for the original full data-table registry bundle', () => {
		const registry = JSON.parse(readFileSync('registry.json', 'utf8')) as {
			items: Array<{
				name: string;
				files?: Array<{ target: string }>;
			}>;
		};
		const dataTable = registry.items.find((item) => item.name === 'data-table');
		const targets = new Set(dataTable?.files?.map((file) => file.target));
		const originalEquivalentTargets = [
			'data-table/data-table.svelte',
			'data-table/data-table-column-header.svelte',
			'data-table/data-table-pagination.svelte',
			'data-table/data-table-view-options.svelte',
			'data-table/data-table-faceted-filter.svelte',
			'data-table/data-table-toolbar.svelte',
			'data-table/data-table-slider-filter.svelte',
			'data-table/data-table-date-filter.svelte',
			'data-table/data-table-skeleton.svelte',
			'use-callback-ref.ts',
			'use-data-table.svelte.ts',
			'use-debounced-callback.ts',
			'data-table.ts',
			'format.ts',
			'parsers.ts',
			'config/data-table.ts',
			'types/data-table.ts'
		];

		for (const target of originalEquivalentTargets) {
			expect(targets.has(target)).toBe(true);
		}

		for (const addedParityTarget of [
			'data-table/data-table-advanced-toolbar.svelte',
			'data-table/data-table-sort-list.svelte',
			'data-table/data-table-filter-list.svelte',
			'data-table/data-table-filter-menu.svelte',
			'data-table/data-table-range-filter.svelte',
			'data-table-range-utils.ts',
			'filter-rows.ts'
		]) {
			expect(targets.has(addedParityTarget)).toBe(true);
		}
	});

	it('keeps standalone data-table menu registry slices scoped to their Svelte imports', () => {
		const registry = JSON.parse(readFileSync('registry.json', 'utf8')) as {
			items: Array<{
				name: string;
				dependencies?: string[];
				files?: Array<{ target: string }>;
			}>;
		};
		const expectedTargets = new Map([
			['data-table-sort-list', ['data-table/data-table-sort-list.svelte']],
			[
				'data-table-filter-list',
				[
					'data-table/data-table-filter-list.svelte',
					'data-table/data-table-range-filter.svelte',
					'data-grid/data-grid-range-calendar.svelte',
					'data-table-range-utils.ts',
					'format.ts',
					'id.ts',
					'config/data-table.ts',
					'types/data-grid.ts',
					'types/data-table.ts'
				]
			],
			[
				'data-table-filter-menu',
				[
					'data-table/data-table-filter-menu.svelte',
					'data-table/data-table-range-filter.svelte',
					'data-grid/data-grid-range-calendar.svelte',
					'data-table-range-utils.ts',
					'format.ts',
					'id.ts',
					'config/data-table.ts',
					'types/data-grid.ts',
					'types/data-table.ts'
				]
			]
		] as const);

		for (const [name, targets] of expectedTargets) {
			const item = registry.items.find((registryItem) => registryItem.name === name);
			expect(item?.files?.map((file) => file.target)).toEqual(targets);
		}

		expect(
			registry.items.find((registryItem) => registryItem.name === 'data-table-filter-menu')
				?.dependencies
		).not.toContain('svelte-dnd-action');
		expect(
			registry.items.find((registryItem) => registryItem.name === 'data-table-filter-list')
				?.dependencies
		).toContain('svelte-dnd-action');
	});

	it('keeps standalone grid utility registry dependencies scoped to direct imports', () => {
		const registry = JSON.parse(readFileSync('registry.json', 'utf8')) as {
			items: Array<{
				name: string;
				dependencies?: string[];
				files?: Array<{ target: string }>;
			}>;
		};
		const shortcuts = registry.items.find(
			(registryItem) => registryItem.name === 'data-grid-keyboard-shortcuts'
		);
		const rowHeight = registry.items.find(
			(registryItem) => registryItem.name === 'data-grid-row-height-menu'
		);
		const view = registry.items.find(
			(registryItem) => registryItem.name === 'data-grid-view-menu'
		);

		expect(shortcuts?.files?.map((file) => file.target)).toEqual([
			'data-grid/data-grid-keyboard-shortcuts.svelte'
		]);
		expect(shortcuts?.dependencies).toEqual(['@lucide/svelte']);
		expect(rowHeight?.dependencies).toEqual(['@tanstack/table-core', '@lucide/svelte']);
		expect(view?.dependencies).toEqual(['@tanstack/table-core', '@lucide/svelte']);
	});

	it('keeps the standalone select-column registry slice scoped to row selection rendering', () => {
		const registry = JSON.parse(readFileSync('registry.json', 'utf8')) as {
			items: Array<{
				name: string;
				files?: Array<{ target: string }>;
			}>;
		};
		const selectColumn = registry.items.find(
			(registryItem) => registryItem.name === 'data-grid-select-column'
		);

		expect(selectColumn?.files?.map((file) => file.target)).toEqual([
			'data-grid/data-grid-select-column.ts',
			'data-grid/cells/row-select-cell.svelte',
			'data-grid/cells/row-select-header.svelte',
			'types/data-grid.ts',
			'data-table/render-helpers.ts'
		]);
	});

	it('ships the exported action bar component and local primitive', () => {
		const registry = JSON.parse(readFileSync('registry.json', 'utf8')) as {
			items: Array<{
				name: string;
				files?: Array<{ type?: string; target: string }>;
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
		expect(itemNames.has('sortable')).toBe(true);
		expect(itemNames.has('drawer')).toBe(true);
		expect(itemNames.has('form')).toBe(true);
	});

	it('ships a standalone sortable registry item', () => {
		const registry = JSON.parse(readFileSync('registry.json', 'utf8')) as {
			items: Array<{
				name: string;
				dependencies?: string[];
				files?: Array<{ target: string }>;
			}>;
		};
		const sortable = registry.items.find((item) => item.name === 'sortable');
		const targets = new Set(sortable?.files?.map((file) => file.target));

		expect(sortable?.dependencies).toContain('svelte-dnd-action');
		for (const target of [
			'sortable/index.ts',
			'sortable/sortable.svelte',
			'sortable/sortable-content.svelte',
			'sortable/sortable-item.svelte',
			'sortable/sortable-item-handle.svelte',
			'sortable/sortable-overlay.svelte',
			'sortable/sortable-context.ts'
		]) {
			expect(targets.has(target)).toBe(true);
		}
	});

	it('ships a standalone drawer registry item', () => {
		const registry = JSON.parse(readFileSync('registry.json', 'utf8')) as {
			items: Array<{
				name: string;
				dependencies?: string[];
				files?: Array<{ target: string }>;
			}>;
		};
		const drawer = registry.items.find((item) => item.name === 'drawer');
		const targets = new Set(drawer?.files?.map((file) => file.target));

		expect(drawer?.dependencies).toContain('bits-ui');
		for (const target of [
			'drawer/index.ts',
			'drawer/drawer.svelte',
			'drawer/drawer-context.ts',
			'drawer/drawer-trigger.svelte',
			'drawer/drawer-close.svelte',
			'drawer/drawer-portal.svelte',
			'drawer/drawer-overlay.svelte',
			'drawer/drawer-content.svelte',
			'drawer/drawer-header.svelte',
			'drawer/drawer-footer.svelte',
			'drawer/drawer-title.svelte',
			'drawer/drawer-description.svelte'
		]) {
			expect(targets.has(target)).toBe(true);
		}
	});

	it('ships a standalone form registry item', () => {
		const registry = JSON.parse(readFileSync('registry.json', 'utf8')) as {
			items: Array<{
				name: string;
				dependencies?: string[];
				registryDependencies?: string[];
				files?: Array<{ target: string }>;
			}>;
		};
		const form = registry.items.find((item) => item.name === 'form');
		const targets = new Set(form?.files?.map((file) => file.target));

		expect(form?.dependencies).toContain('bits-ui');
		expect(form?.registryDependencies).toContain('label');
		for (const target of [
			'form/index.ts',
			'form/form.svelte',
			'form/form-context.ts',
			'form/form-field.svelte',
			'form/form-item.svelte',
			'form/form-label.svelte',
			'form/form-control.svelte',
			'form/form-description.svelte',
			'form/form-message.svelte'
		]) {
			expect(targets.has(target)).toBe(true);
		}
	});
});

describe('README data-grid examples', () => {
	const readme = readFileSync('README.md', 'utf8');

	it('keeps the main grid example aligned with feature-gated paste behavior', () => {
		expect(readme).toContain('enableSearch: true,');
		expect(readme).toContain('enablePaste: true');
		expect(readme).toContain('| Ctrl/Cmd + V         | Paste when `enablePaste` is true |');
	});

	it('shows undo redo tracking wired through the grid data change path', () => {
		expect(readme).toContain(
			'import { DataGrid, useDataGrid, useDataGridUndoRedo, type UndoRedoCellUpdate } from'
		);
		expect(readme).toContain('trackCellsUpdate(cellUpdates);');
		expect(readme).toContain('const dataGrid = useDataGrid({');
		expect(readme).toContain('onDataChange,');
		expect(readme).toContain('trackRowsAdd([row]);');
		expect(readme).toContain('trackRowsDelete(rows);');
		expect(readme).toContain('<DataGrid {...dataGrid} height={600} />');
	});

	it('documents the shipped keyboard shortcuts dialog options', () => {
		expect(readme).toContain('## Keyboard Shortcuts Dialog');
		expect(readme).toContain('import { DataGridKeyboardShortcuts } from');
		expect(readme).toContain('<DataGridKeyboardShortcuts');
		for (const option of [
			'enableSearch',
			'enableUndoRedo',
			'enablePaste',
			'enableRowAdd',
			'enableRowsDelete'
		]) {
			expect(readme).toContain(option);
		}
		expect(readme).toContain('It opens with `Ctrl/Cmd + /`.');
	});

	it('documents every shipped useDataGrid option', () => {
		const hookSource = readFileSync('src/lib/hooks/use-data-grid.svelte.ts', 'utf8');
		const optionsBlock = hookSource.match(
			/export interface UseDataGridOptions<TData extends RowData> \{([\s\S]*?)\n\}/
		)?.[1];

		expect(optionsBlock).toBeDefined();
		const optionNames = Array.from(optionsBlock?.matchAll(/^\t([A-Za-z]\w+)\??:/gm) ?? []).map(
			([, name]) => name
		);

		expect(optionNames).toEqual([
			'columns',
			'data',
			'rowHeight',
			'autoFocus',
			'enableColumnSelection',
			'enableSingleCellSelection',
			'enableSearch',
			'enablePaste',
			'readOnly',
			'overscan',
			'dir',
			'getRowId',
			'initialState',
			'onDataChange',
			'onSortingChange',
			'onColumnFiltersChange',
			'onRowSelectionChange',
			'onRowAdd',
			'onRowsAdd',
			'onRowsDelete',
			'onRowHeightChange',
			'onPaste',
			'onFilesUpload',
			'onFilesDelete'
		]);

		for (const option of optionNames) {
			expect(readme).toContain(`| \`${option}\``);
		}
	});
});

describe('README UI primitive docs', () => {
	const readme = readFileSync('README.md', 'utf8');
	const registry = JSON.parse(readFileSync('registry.json', 'utf8')) as {
		items: Array<{ name: string }>;
	};
	const registryItems = new Set(registry.items.map((item) => item.name));

	it('documents every installable registry item from registry.json', () => {
		expect(readme).toContain('### Installable Registry Items');

		const documentedItems = new Set(
			Array.from(readme.matchAll(/\| `([^`]+)` \| `?\/r\/([^`|\s]+)\.json`? \|/g)).map(
				([, name, urlName]) => {
					expect(name).toBe(urlName);
					return name;
				}
			)
		);

		expect([...documentedItems].sort()).toEqual([...registryItems].sort());
	});

	it('documents standalone registry slices for shipped upstream ui primitives', () => {
		expect(readme).toContain('## UI Primitives');
		for (const primitive of ['drawer', 'form', 'sortable']) {
			expect(registryItems.has(primitive)).toBe(true);
			expect(readme).toContain(`| \`${primitive}\``);
			expect(readme).toContain(`/r/${primitive}.json`);
		}
		expect(readme).toContain(
			'npx shadcn-svelte@latest add https://svelte-tablecn.vercel.app/r/sortable.json'
		);
	});

	it('keeps documented primitive exports aligned with the package root', () => {
		const documentedExports = [
			['Drawer', RootDrawer],
			['DrawerPortal', RootDrawerPortal],
			['DrawerOverlay', RootDrawerOverlay],
			['DrawerContent', RootDrawerContent],
			['DrawerTrigger', RootDrawerTrigger],
			['DrawerClose', RootDrawerClose],
			['DrawerHeader', RootDrawerHeader],
			['DrawerFooter', RootDrawerFooter],
			['DrawerTitle', RootDrawerTitle],
			['DrawerDescription', RootDrawerDescription],
			['Form', RootForm],
			['FormField', RootFormField],
			['FormItem', RootFormItem],
			['FormLabel', RootFormLabel],
			['FormControl', RootFormControl],
			['FormDescription', RootFormDescription],
			['FormMessage', RootFormMessage],
			['getFormFieldState', getRootFormFieldState],
			['getFormErrorMessage', getRootFormErrorMessage],
			['Sortable', RootSortable],
			['SortableContent', RootSortableContent],
			['SortableItem', RootSortableItem],
			['SortableItemHandle', RootSortableItemHandle],
			['SortableOverlay', RootSortableOverlay]
		] as const;

		for (const [name, component] of documentedExports) {
			expect(component).toBeTruthy();
			expect(readme).toContain(name);
		}
	});
});

describe('non-README parity docs', () => {
	const changelog = readFileSync('CHANGELOG.md', 'utf8');
	const parityPlan = readFileSync('PARITY_PLAN.md', 'utf8');
	const packageJson = JSON.parse(readFileSync('package.json', 'utf8')) as {
		dependencies?: Record<string, string>;
		devDependencies?: Record<string, string>;
	};

	it('records shipped shortcut, primitive, and select-editor parity work outside the README', () => {
		for (const phrase of [
			'DataGridKeyboardShortcuts',
			'Standalone `drawer`, `form`, and `sortable` registry slices',
			'primitive type contracts',
			'square, cell-aligned content'
		]) {
			expect(changelog).toContain(phrase);
		}

		expect(parityPlan).toContain('package-root/UI-barrel primitive helper/type exports');
		expect(parityPlan).toContain('cell-aligned select editor fix');
		expect(parityPlan).not.toContain(
			'a final documentation audit against any newly completed parity surfaces outside the README examples'
		);
	});

	it('records adapter decisions for primitive parity without React-only runtime dependencies', () => {
		for (const phrase of [
			'current primitive parity intentionally excludes React-only runtime integrations',
			'no Vaul drag/snap physics in `drawer`',
			'no `react-hook-form` controller adapter in `form`',
			'no dnd-kit keyboard sensor/announcement layer in `sortable`'
		]) {
			expect(parityPlan).toContain(phrase);
		}

		expect(changelog).toContain('Adapter scope is documented for `drawer`, `form`, and `sortable`');

		const dependencies = {
			...(packageJson.dependencies ?? {}),
			...(packageJson.devDependencies ?? {})
		};

		for (const reactOnlyDependency of [
			'vaul',
			'react-hook-form',
			'@dnd-kit/core',
			'@dnd-kit/sortable',
			'@dnd-kit/modifiers'
		]) {
			expect(dependencies).not.toHaveProperty(reactOnlyDependency);
		}
	});
});

describe('README data-table examples', () => {
	const readme = readFileSync('README.md', 'utf8');

	it('keeps the basic data-table example self-contained and filterable', () => {
		expect(readme).toContain('type Employee = {');
		expect(readme).toContain('let data = $state<Employee[]>([');
		expect(readme).toContain("filterFn: 'includesString'");
		expect(readme).toContain("filterFn: 'equalsString'");
		expect(readme).toContain("variant: 'select'");
		expect(readme).toContain('<DataTable {table}>');
		expect(readme).toContain('<DataTableToolbar {table} />');
	});

	it('documents the shipped data-table component surface', () => {
		const publicComponents = [
			['DataTable', RootDataTable],
			['DataTableAdvancedToolbar', RootDataTableAdvancedToolbar],
			['DataTableColumnHeader', RootDataTableColumnHeader],
			['DataTableDateFilter', RootDataTableDateFilter],
			['DataTableFacetedFilter', RootDataTableFacetedFilter],
			['DataTableFilterList', RootDataTableFilterList],
			['DataTableFilterMenu', RootDataTableFilterMenu],
			['DataTablePagination', RootDataTablePagination],
			['DataTableRangeFilter', RootDataTableRangeFilter],
			['DataTableSkeleton', RootDataTableSkeleton],
			['DataTableSliderFilter', RootDataTableSliderFilter],
			['DataTableSortList', RootDataTableSortList],
			['DataTableToolbar', RootDataTableToolbar],
			['DataTableViewOptions', RootDataTableViewOptions],
			['useDataTable', useRootDataTable]
		] as const;

		for (const [name, exported] of publicComponents) {
			expect(exported).toBeTruthy();
			expect(readme).toContain(`- \`${name}\``);
		}
	});

	it('documents every shipped useDataTable option', () => {
		const typesSource = readFileSync('src/lib/types/data-table.ts', 'utf8');
		const optionsBlock = typesSource.match(
			/export interface UseDataTableOptions<TData> \{([\s\S]*?)\n\}/
		)?.[1];

		expect(optionsBlock).toBeDefined();
		const optionNames = Array.from(optionsBlock?.matchAll(/^\t([A-Za-z]\w+)\??:/gm) ?? []).map(
			([, name]) => name
		);

		expect(optionNames).toEqual([
			'data',
			'columns',
			'pageCount',
			'getRowId',
			'queryKeys',
			'history',
			'debounceMs',
			'throttleMs',
			'clearOnDefault',
			'enableAdvancedFilter',
			'scroll',
			'shallow',
			'initialState',
			'enableRowSelection',
			'enableMultiSort',
			'manualPagination',
			'manualSorting',
			'manualFiltering'
		]);

		for (const option of optionNames) {
			expect(readme).toContain(`- \`${option}\``);
		}
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

	it('emits generated registry artifacts for every installable item', () => {
		const registry = JSON.parse(readFileSync('registry.json', 'utf8')) as {
			items: Array<{
				name: string;
				type?: string;
				title?: string;
				description?: string;
				dependencies?: string[];
				registryDependencies?: string[];
				meta?: Record<string, unknown>;
				files?: Array<{ type?: string; target: string }>;
			}>;
		};
		const registryIndex = JSON.parse(readFileSync('static/r/index.json', 'utf8')) as Array<{
			name: string;
			relativeUrl: string;
		}>;
		const indexUrls = new Map(registryIndex.map((item) => [item.name, item.relativeUrl]));
		const registryItemNames = registry.items.map((item) => item.name).sort();
		const emittedItemNames = registryIndex.map((item) => item.name).sort();
		const missing: string[] = [];
		const mismatchedMetadata: string[] = [];
		const mismatchedFiles: string[] = [];

		expect(emittedItemNames).toEqual(registryItemNames);

		for (const item of registry.items) {
			const relativeUrl = `${item.name}.json`;
			const emittedPath = `static/r/${relativeUrl}`;

			if (indexUrls.get(item.name) !== relativeUrl) {
				missing.push(`${item.name}: missing ${relativeUrl} from static/r/index.json`);
				continue;
			}

			if (!existsSync(emittedPath)) {
				missing.push(`${item.name}: missing ${emittedPath}`);
				continue;
			}

			const emitted = JSON.parse(readFileSync(emittedPath, 'utf8')) as {
				type?: string;
				title?: string;
				description?: string;
				dependencies?: string[];
				registryDependencies?: string[];
				meta?: Record<string, unknown>;
				files?: Array<{ type?: string; target: string }>;
			};
			const metadataFields = [
				'type',
				'title',
				'description',
				'dependencies',
				'registryDependencies',
				'meta'
			] as const;

			for (const field of metadataFields) {
				const expectedValue = item[field] ?? (field === 'registryDependencies' ? [] : undefined);
				const emittedValue = emitted[field] ?? (field === 'registryDependencies' ? [] : undefined);

				if (JSON.stringify(emittedValue) !== JSON.stringify(expectedValue)) {
					mismatchedMetadata.push(`${item.name}: ${field} differs from registry.json`);
				}
			}

			const expectedFiles = (item.files?.map((file) => `${file.type}:${file.target}`) ?? []).sort();
			const emittedFiles = (emitted.files?.map((file) => `${file.type}:${file.target}`) ?? []).sort();

			if (emittedFiles.join('\n') !== expectedFiles.join('\n')) {
				mismatchedFiles.push(`${item.name}: emitted artifact file entries differ from registry.json`);
			}
		}

		expect(missing).toEqual([]);
		expect(mismatchedMetadata).toEqual([]);
		expect(mismatchedFiles).toEqual([]);
	});

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
			expect(targets.has('config/data-table.ts')).toBe(true);
			expect(targets.has('types/data-grid.ts')).toBe(true);
			expect(targets.has('data-table/data-table-view-options.svelte')).toBe(false);
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
		expect(getDataTableFilterOperators('date')).toContainEqual({
			label: 'Is relative to today',
			value: 'isRelativeToToday'
		});
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
		expect(toSqlFilterOperator('isRelativeToToday')).toBe('isRelativeToToday');
		expect(fromSqlFilterOperator('isRelativeToToday')).toBe('isRelativeToToday');
		expect(
			getFiltersStateParser(new Set(['startedAt'])).parse(
				JSON.stringify([
					{
						id: 'startedAt',
						value: '0 days',
						variant: 'date',
						operator: 'isRelativeToToday',
						filterId: 'relative-date'
					}
				])
			)
		).toEqual([
			{
				id: 'startedAt',
				value: '0 days',
				variant: 'date',
				operator: 'isRelativeToToday',
				filterId: 'relative-date'
			}
		]);
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

	it('applies upstream relative-to-today date filters for data-table rows', () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date(2024, 2, 10, 12));

		try {
			expect(
				filterRows(
					[
						{ startedAt: new Date(2024, 2, 9, 12) },
						{ startedAt: new Date(2024, 2, 10, 12) },
						{ startedAt: new Date(2024, 2, 11, 12) }
					],
					[
						{
							id: 'startedAt',
							value: '0 days',
							variant: 'date',
							operator: 'isRelativeToToday',
							filterId: 'relative-date'
						}
					],
					'and'
				)
			).toEqual([{ startedAt: new Date(2024, 2, 10, 12) }]);
		} finally {
			vi.useRealTimers();
		}
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
