# svelte-tablecn

A powerful, feature-rich data grid component for Svelte 5. This is a port of [tablecn.com](https://tablecn.com) - the original React implementation.

## Demo

[Live Demo](https://svelte-tablecn.vercel.app)

See [CHANGELOG.md](./CHANGELOG.md) for release notes.

## Features

- Cell editing with multiple cell types (text, number, date, select, multi-select, checkbox, URL, file)
- Keyboard navigation (arrow keys, tab, enter, escape)
- Cell selection (single, multi-select with Ctrl/Cmd, range select with Shift)
- Copy/paste support (single cells and ranges)
- Search with highlighting
- Column sorting, filtering, pinning, resizing, and visibility
- Row virtualization for large datasets
- Context menu
- Undo/redo support
- Full TypeScript support
- Built on TanStack Table and TanStack Virtual

## Installation

### Using shadcn-svelte CLI (Recommended)

```bash
# Using bun
bunx shadcn-svelte@latest add https://svelte-tablecn.vercel.app/r/data-grid.json

# Using pnpm
pnpm dlx shadcn-svelte@latest add https://svelte-tablecn.vercel.app/r/data-grid.json

# Using npm
npx shadcn-svelte@latest add https://svelte-tablecn.vercel.app/r/data-grid.json
```

### Installable Registry Items

Install the full grid/table blocks or add smaller slices as needed:

| Item | Registry URL |
| --- | --- |
| `data-grid` | `/r/data-grid.json` |
| `data-table` | `/r/data-table.json` |
| `data-table-sort-list` | `/r/data-table-sort-list.json` |
| `data-table-filter-list` | `/r/data-table-filter-list.json` |
| `data-table-filter-menu` | `/r/data-table-filter-menu.json` |
| `data-grid-select-column` | `/r/data-grid-select-column.json` |
| `data-grid-sort-menu` | `/r/data-grid-sort-menu.json` |
| `data-grid-row-height-menu` | `/r/data-grid-row-height-menu.json` |
| `data-grid-view-menu` | `/r/data-grid-view-menu.json` |
| `data-grid-keyboard-shortcuts` | `/r/data-grid-keyboard-shortcuts.json` |
| `data-grid-filter-menu` | `/r/data-grid-filter-menu.json` |
| `data-grid-skeleton` | `/r/data-grid-skeleton.json` |
| `sortable` | `/r/sortable.json` |
| `drawer` | `/r/drawer.json` |
| `form` | `/r/form.json` |
| `use-data-grid-undo-redo` | `/r/use-data-grid-undo-redo.json` |

### Prerequisites

Make sure you have [shadcn-svelte](https://www.shadcn-svelte.com/) configured in your project with Tailwind CSS v4:

```bash
bunx shadcn-svelte@latest init
```

## Usage

```svelte
<script lang="ts">
	import { DataGrid, getDataGridSelectColumn, useDataGrid } from '$lib';
	import type { ColumnDef } from '@tanstack/table-core';

	type Employee = {
		id: string;
		name: string;
		email: string;
		age: number;
		department: string;
		startDate: string;
		isActive: boolean;
	};

	const departments = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance'];

	let data = $state<Employee[]>([
		{
			id: '1',
			name: 'John Doe',
			email: 'john@example.com',
			age: 32,
			department: 'Engineering',
			startDate: '2022-03-15',
			isActive: true
		},
		{
			id: '2',
			name: 'Jane Smith',
			email: 'jane@example.com',
			age: 28,
			department: 'Marketing',
			startDate: '2021-07-22',
			isActive: true
		},
		{
			id: '3',
			name: 'Bob Johnson',
			email: 'bob@example.com',
			age: 45,
			department: 'Sales',
			startDate: '2019-11-08',
			isActive: false
		},
		{
			id: '4',
			name: 'Alice Williams',
			email: 'alice@example.com',
			age: 35,
			department: 'HR',
			startDate: '2020-05-30',
			isActive: true
		},
		{
			id: '5',
			name: 'Charlie Brown',
			email: 'charlie@example.com',
			age: 29,
			department: 'Finance',
			startDate: '2023-01-10',
			isActive: true
		},
		{
			id: '6',
			name: 'Diana Ross',
			email: 'diana@example.com',
			age: 41,
			department: 'Engineering',
			startDate: '2018-09-14',
			isActive: true
		},
		{
			id: '7',
			name: 'Edward Chen',
			email: 'edward@example.com',
			age: 33,
			department: 'Marketing',
			startDate: '2021-02-28',
			isActive: false
		},
		{
			id: '8',
			name: 'Fiona Garcia',
			email: 'fiona@example.com',
			age: 27,
			department: 'Sales',
			startDate: '2022-08-05',
			isActive: true
		},
		{
			id: '9',
			name: 'George Wilson',
			email: 'george@example.com',
			age: 52,
			department: 'HR',
			startDate: '2017-04-18',
			isActive: true
		},
		{
			id: '10',
			name: 'Hannah Lee',
			email: 'hannah@example.com',
			age: 31,
			department: 'Finance',
			startDate: '2020-12-01',
			isActive: true
		}
	]);

	const columns: ColumnDef<Employee, unknown>[] = [
		getDataGridSelectColumn<Employee>({ enableRowMarkers: true }),
		{
			accessorKey: 'name',
			header: 'Name',
			meta: { cell: { variant: 'short-text' } }
		},
		{
			accessorKey: 'email',
			header: 'Email',
			meta: { cell: { variant: 'short-text' } }
		},
		{
			accessorKey: 'age',
			header: 'Age',
			meta: { cell: { variant: 'number', min: 18, max: 100 } }
		},
		{
			accessorKey: 'department',
			header: 'Department',
			meta: {
				cell: {
					variant: 'select',
					options: departments.map((d) => ({ label: d, value: d }))
				}
			}
		},
		{
			accessorKey: 'startDate',
			header: 'Start Date',
			meta: { cell: { variant: 'date' } }
		},
		{
			accessorKey: 'isActive',
			header: 'Active',
			meta: { cell: { variant: 'checkbox' } }
		}
	];

	const { table, ...dataGridProps } = useDataGrid({
		data: () => data,
		columns,
		onDataChange: (newData) => {
			data = newData;
		},
		getRowId: (row) => row.id,
		enableSearch: true,
		enablePaste: true
	});
</script>

<DataGrid {...dataGridProps} {table} height={600} />
```

## Selection Column

Use `getDataGridSelectColumn()` for the upstream-style row selection column:

```ts
const columns = [
	getDataGridSelectColumn<Employee>({ enableRowMarkers: true })
	// other columns...
];
```

## Undo/Redo

Use `useDataGridUndoRedo` to track cell edits, row adds, and row deletes:

```svelte
<script lang="ts">
	import { DataGrid, useDataGrid, useDataGridUndoRedo, type UndoRedoCellUpdate } from '$lib';
	import type { ColumnDef } from '@tanstack/table-core';

	type Employee = {
		id: string;
		name: string;
	};

	let data = $state<Employee[]>([]);

	const columns: ColumnDef<Employee, unknown>[] = [
		{
			accessorKey: 'name',
			header: 'Name',
			meta: { cell: { variant: 'short-text' } }
		}
	];

	function createBlankEmployee(): Employee {
		return { id: crypto.randomUUID(), name: '' };
	}

	const { trackCellsUpdate, trackRowsAdd, trackRowsDelete } = useDataGridUndoRedo({
		data: () => data,
		onDataChange: (newData) => {
			data = newData;
		},
		getRowId: (row) => row.id
	});

	function onDataChange(newData: Employee[]) {
		const cellUpdates: UndoRedoCellUpdate[] = [];
		const maxLength = Math.max(data.length, newData.length);

		for (let rowIndex = 0; rowIndex < maxLength; rowIndex++) {
			const previousRow = data[rowIndex];
			const nextRow = newData[rowIndex];

			if (!previousRow || !nextRow) continue;

			const keys = new Set<keyof Employee>([
				...(Object.keys(previousRow) as Array<keyof Employee>),
				...(Object.keys(nextRow) as Array<keyof Employee>)
			]);

			for (const key of keys) {
				const previousValue = previousRow[key];
				const newValue = nextRow[key];

				if (!Object.is(previousValue, newValue)) {
					cellUpdates.push({
						rowId: previousRow.id,
						columnId: String(key),
						previousValue,
						newValue
					});
				}
			}
		}

		if (cellUpdates.length > 0) {
			trackCellsUpdate(cellUpdates);
		}

		data = newData;
	}

	const dataGrid = useDataGrid({
		data: () => data,
		columns,
		onDataChange,
		onRowAdd: () => {
			const row = createBlankEmployee();
			data = [...data, row];
			trackRowsAdd([row]);
		},
		onRowsDelete: (rows: Employee[]) => {
			trackRowsDelete(rows);
			data = data.filter((row) => !rows.includes(row));
		},
		getRowId: (row) => row.id
	});
</script>

<DataGrid {...dataGrid} height={600} />
```

## Skeleton

```svelte
<script lang="ts">
	import { DataGridSkeleton, DataGridSkeletonToolbar, DataGridSkeletonGrid } from '$lib';
</script>

<DataGridSkeleton>
	{#snippet children()}
		<DataGridSkeletonToolbar />
		<DataGridSkeletonGrid />
	{/snippet}
</DataGridSkeleton>
```

## Keyboard Shortcuts Dialog

Use `DataGridKeyboardShortcuts` to expose the same searchable shortcut dialog as the original grid. It opens with `Ctrl/Cmd + /`.

```svelte
<script lang="ts">
	import { DataGridKeyboardShortcuts } from '$lib';
</script>

<DataGridKeyboardShortcuts
	enableSearch
	enableUndoRedo
	enablePaste
	enableRowAdd
	enableRowsDelete
/>
```

## Data Table

The package also includes the core non-editable `data-table` surface:

- `useDataTable`
- `DataTable`
- `DataTableColumnHeader`
- `DataTableToolbar`
- `DataTableAdvancedToolbar`
- `DataTablePagination`
- `DataTableViewOptions`
- `DataTableFacetedFilter`
- `DataTableDateFilter`
- `DataTableSliderFilter`
- `DataTableRangeFilter`
- `DataTableSortList`
- `DataTableFilterList`
- `DataTableFilterMenu`
- `DataTableSkeleton`

```svelte
<script lang="ts">
	import { DataTable, DataTableToolbar, useDataTable } from '$lib';
	import type { ColumnDef } from '@tanstack/table-core';

	type Employee = {
		id: string;
		name: string;
		department: string;
	};

	let data = $state<Employee[]>([
		{ id: '1', name: 'Ada Lovelace', department: 'Engineering' },
		{ id: '2', name: 'Grace Hopper', department: 'Research' }
	]);

	const columns: ColumnDef<Employee, unknown>[] = [
		{
			id: 'name',
			accessorKey: 'name',
			header: 'Name',
			enableColumnFilter: true,
			filterFn: 'includesString',
			meta: { label: 'Name', variant: 'text' }
		},
		{
			id: 'department',
			accessorKey: 'department',
			header: 'Department',
			enableColumnFilter: true,
			filterFn: 'equalsString',
			meta: {
				label: 'Department',
				variant: 'select',
				options: [
					{ label: 'Engineering', value: 'Engineering' },
					{ label: 'Research', value: 'Research' }
				]
			}
		}
	];

	const { table } = useDataTable({
		data: () => data,
		columns
	});
</script>

<DataTable {table}>
	{#snippet children()}
		<DataTableToolbar {table} />
	{/snippet}
</DataTable>
```

`useDataTable` also supports URL-synced state for:

- `page`
- `perPage`
- `sort`
- per-column toolbar filters
- advanced `filters` and `joinOperator`

Relevant options:

- `data`
- `columns`
- `queryKeys`
- `history`
- `debounceMs`
- `throttleMs`
- `clearOnDefault`
- `enableAdvancedFilter`
- `scroll`
- `shallow`
- `pageCount`
- `getRowId`
- `initialState`
- `enableRowSelection`
- `enableMultiSort`
- `manualPagination`
- `manualSorting`
- `manualFiltering`

The hook also forwards additional TanStack Table options such as `defaultColumn`, `meta`, `filterFns`, and `getSubRows` when they are not controlled by the Svelte URL/state adapter.

For advanced filters (multi-rule, AND/OR, operators), see [docs/ADVANCED_FILTERS.md](./docs/ADVANCED_FILTERS.md). The demo toggles **Filter list** vs **Filter menu** like tablecn’s `filterFlag`.

For how Svelte 5 and TanStack Table interact (and why filters used to loop), see [docs/REACTIVITY.md](./docs/REACTIVITY.md).

## UI Primitives

The Svelte port also ships upstream-style UI primitives used by the grid and table. These are exported from `$lib`; `drawer`, `form`, and `sortable` are also available as standalone registry items.

| Primitive  | Public exports                                                                   | Registry availability |
| ---------- | -------------------------------------------------------------------------------- | --------------------- |
| `faceted`  | `Faceted`, `FacetedTrigger`, `FacetedContent`, `FacetedBadgeList`, `FacetedInput`, `FacetedList`, `FacetedEmpty`, `FacetedGroup`, `FacetedItem`, `FacetedSeparator`, `FacetedValue` | Bundled with table filter registry items |
| `drawer`   | `Drawer`, `DrawerPortal`, `DrawerOverlay`, `DrawerContent`, `DrawerTrigger`, `DrawerClose`, `DrawerHeader`, `DrawerFooter`, `DrawerTitle`, `DrawerDescription` | `/r/drawer.json` |
| `form`     | `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormDescription`, `FormMessage`, `useFormField`, `getFormFieldState`, `getFormErrorMessage` | `/r/form.json` |
| `sortable` | `Sortable`, `SortableContent`, `SortableItem`, `SortableItemHandle`, `SortableOverlay` | `/r/sortable.json` |

Install a primitive directly with the shadcn-svelte CLI:

```bash
npx shadcn-svelte@latest add https://svelte-tablecn.vercel.app/r/sortable.json
```

## Cell Variants

The data grid supports multiple cell types:

| Variant        | Description                              |
| -------------- | ---------------------------------------- |
| `short-text`   | Single-line text input                   |
| `long-text`    | Multi-line text with expandable editor   |
| `number`       | Numeric input with optional min/max/step |
| `date`         | Date picker                              |
| `select`       | Single select dropdown                   |
| `multi-select` | Multiple select with tags                |
| `checkbox`     | Boolean checkbox                         |
| `url`          | URL input with link preview              |
| `file`         | File upload cell                         |
| `row-select`   | Row selection checkbox                   |

## Keyboard Shortcuts

| Shortcut             | Action                           |
| -------------------- | -------------------------------- |
| Arrow keys           | Navigate cells                   |
| Tab / Shift+Tab      | Move right/left                  |
| Enter                | Start editing / Move down        |
| Escape               | Cancel editing / Clear selection |
| Ctrl/Cmd + C         | Copy selected cells              |
| Ctrl/Cmd + V         | Paste when `enablePaste` is true |
| Ctrl/Cmd + X         | Cut                              |
| Ctrl/Cmd + Z         | Undo when undo/redo is wired     |
| Ctrl/Cmd + Shift + Z | Redo when undo/redo is wired     |
| Ctrl/Cmd + F         | Open search when enabled         |
| Ctrl/Cmd + Shift + F | Toggle the filter menu           |
| Ctrl/Cmd + Shift + S | Toggle the sort menu             |
| Ctrl/Cmd + /         | Show keyboard shortcuts          |
| Delete/Backspace     | Clear cell content               |

## API Reference

### useDataGrid Options

| Option          | Type                                            | Description                                  |
| --------------- | ----------------------------------------------- | -------------------------------------------- |
| `data`          | `TData[] \| (() => TData[])`                    | Data array or getter function for reactivity |
| `columns`       | `ColumnDef<TData, unknown>[]`                   | Column definitions                           |
| `getRowId`      | `(row) => string`                               | Function to get unique row ID                |
| `autoFocus`     | `boolean \| { rowIndex?, columnId? }`           | Focus the grid or a specific cell on mount   |
| `dir`           | `'ltr' \| 'rtl' \| (() => 'ltr' \| 'rtl')`      | Text direction                               |
| `enableColumnSelection` | `boolean`                                | Enable header-driven column selection        |
| `enableSingleCellSelection` | `boolean`                            | Select the focused cell on click             |
| `enableSearch`  | `boolean`                                       | Enable search functionality                  |
| `enablePaste`   | `boolean`                                       | Enable paste functionality                   |
| `readOnly`      | `boolean`                                       | Make grid read-only                          |
| `overscan`      | `number`                                        | Virtual row overscan count                   |
| `rowHeight`     | `'short' \| 'medium' \| 'tall' \| 'extra-tall'` | Row height preset                            |
| `state`         | `Partial<TableState>`                           | Additional TanStack table state merged under grid-owned state |
| `initialState`  | `object`                                        | Initial table state (sorting, filters, etc.) |
| `onDataChange`  | `(data: TData[]) => void`                       | Called when data changes                     |
| `onSortingChange` | `(sorting) => void`                           | Called when sorting changes                  |
| `onColumnFiltersChange` | `(filters) => void`                    | Called when column filters change            |
| `onRowSelectionChange` | `(rowSelection) => void`               | Called when row selection changes            |
| `onRowAdd`      | `(event?) => Partial<CellPosition> \| null \| void \| Promise<...>` | Called when a new row is added |
| `onRowsAdd`     | `(count: number) => void`                       | Called when multiple rows are added          |
| `onRowsDelete`  | `(rows, indices) => void`                       | Called when rows are deleted                 |
| `onRowHeightChange` | `(value) => void`                           | Called when row height changes               |
| `onPaste`       | `(updates) => void \| Promise<void>`            | Called before pasted updates are applied     |
| `onFilesUpload` | `(params) => Promise<FileCellData[]>`           | Handle file uploads                          |
| `onFilesDelete` | `(params) => void`                              | Handle file deletions                        |

The hook also forwards additional TanStack Table options such as `defaultColumn`, `meta`, `filterFns`, and `getSubRows` when they are not controlled by the grid state adapter.

### Column Meta Options

```typescript
meta: {
  label?: string;          // Column label
  cell: {
    variant: CellVariant;  // Cell type
    // Variant-specific options:
    min?: number;          // For 'number'
    max?: number;          // For 'number'
    step?: number;         // For 'number'
    options?: Option[];    // For 'select' and 'multi-select'
    maxFiles?: number;     // For 'file'
    maxFileSize?: number;  // For 'file'
    accept?: string;       // For 'file'
  }
}
```

## Credits

This is a Svelte 5 port of [tablecn.com](https://tablecn.com). All credit for the original design and implementation goes to the tablecn team.

Built with:

- [Svelte 5](https://svelte.dev)
- [TanStack Table](https://tanstack.com/table)
- [TanStack Virtual](https://tanstack.com/virtual)
- [shadcn-svelte](https://www.shadcn-svelte.com/)
- [Bits UI](https://bits-ui.com)

## License

MIT
