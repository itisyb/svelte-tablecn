# svelte-tablecn

A powerful, feature-rich data grid component for Svelte 5. This is a port of [tablecn.com](https://tablecn.com) - the original React implementation.

## Demo

[Live Demo](https://svelte-tablecn.vercel.app)

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

### Prerequisites

Make sure you have [shadcn-svelte](https://www.shadcn-svelte.com/) configured in your project with Tailwind CSS v4:

```bash
bunx shadcn-svelte@latest init
```

## Usage

```svelte
<script lang="ts">
  import { DataGrid } from '$lib/components/data-grid';
  import { useDataGrid } from '$lib/hooks/use-data-grid.svelte';
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
    { id: '1', name: 'John Doe', email: 'john@example.com', age: 32, department: 'Engineering', startDate: '2022-03-15', isActive: true },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', age: 28, department: 'Marketing', startDate: '2021-07-22', isActive: true },
    { id: '3', name: 'Bob Johnson', email: 'bob@example.com', age: 45, department: 'Sales', startDate: '2019-11-08', isActive: false },
    { id: '4', name: 'Alice Williams', email: 'alice@example.com', age: 35, department: 'HR', startDate: '2020-05-30', isActive: true },
    { id: '5', name: 'Charlie Brown', email: 'charlie@example.com', age: 29, department: 'Finance', startDate: '2023-01-10', isActive: true },
    { id: '6', name: 'Diana Ross', email: 'diana@example.com', age: 41, department: 'Engineering', startDate: '2018-09-14', isActive: true },
    { id: '7', name: 'Edward Chen', email: 'edward@example.com', age: 33, department: 'Marketing', startDate: '2021-02-28', isActive: false },
    { id: '8', name: 'Fiona Garcia', email: 'fiona@example.com', age: 27, department: 'Sales', startDate: '2022-08-05', isActive: true },
    { id: '9', name: 'George Wilson', email: 'george@example.com', age: 52, department: 'HR', startDate: '2017-04-18', isActive: true },
    { id: '10', name: 'Hannah Lee', email: 'hannah@example.com', age: 31, department: 'Finance', startDate: '2020-12-01', isActive: true },
  ]);

  const columns: ColumnDef<Employee, unknown>[] = [
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
          options: departments.map(d => ({ label: d, value: d }))
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
    enableSearch: true
  });
</script>

<DataGrid {...dataGridProps} {table} height={600} />
```

## Cell Variants

The data grid supports multiple cell types:

| Variant | Description |
|---------|-------------|
| `short-text` | Single-line text input |
| `long-text` | Multi-line text with expandable editor |
| `number` | Numeric input with optional min/max/step |
| `date` | Date picker |
| `select` | Single select dropdown |
| `multi-select` | Multiple select with tags |
| `checkbox` | Boolean checkbox |
| `url` | URL input with link preview |
| `file` | File upload cell |
| `row-select` | Row selection checkbox |

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Arrow keys | Navigate cells |
| Tab / Shift+Tab | Move right/left |
| Enter | Start editing / Move down |
| Escape | Cancel editing / Clear selection |
| Ctrl/Cmd + C | Copy selected cells |
| Ctrl/Cmd + V | Paste |
| Ctrl/Cmd + X | Cut |
| Ctrl/Cmd + Z | Undo |
| Ctrl/Cmd + Shift + Z | Redo |
| Ctrl/Cmd + F | Open search |
| Delete/Backspace | Clear cell content |

## API Reference

### useDataGrid Options

| Option | Type | Description |
|--------|------|-------------|
| `data` | `TData[] \| (() => TData[])` | Data array or getter function for reactivity |
| `columns` | `ColumnDef<TData>[]` | Column definitions |
| `getRowId` | `(row) => string` | Function to get unique row ID |
| `enableSearch` | `boolean` | Enable search functionality |
| `enablePaste` | `boolean` | Enable paste functionality |
| `readOnly` | `boolean` | Make grid read-only |
| `rowHeight` | `'short' \| 'medium' \| 'tall' \| 'extra-tall'` | Row height preset |
| `initialState` | `object` | Initial table state (sorting, filters, etc.) |
| `onDataChange` | `(data: TData[]) => void` | Called when data changes |
| `onRowAdd` | `() => void` | Called when a new row is added |
| `onRowsAdd` | `(count: number) => void` | Called when multiple rows are added |
| `onRowsDelete` | `(rows, indices) => void` | Called when rows are deleted |
| `onFilesUpload` | `(params) => Promise<FileCellData[]>` | Handle file uploads |
| `onFilesDelete` | `(params) => void` | Handle file deletions |

### Column Meta Options

```typescript
meta: {
  label: string;           // Column label
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
