# svelte-tablecn

A powerful, feature-rich data grid component for Svelte 5. This is a port of [tablecn.com](https://tablecn.com) - the original React implementation.

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
# Using pnpm
pnpm dlx shadcn-svelte@latest add https://svelte-tablecn.vercel.app/r/data-grid.json

# Using npm
npx shadcn-svelte@latest add https://svelte-tablecn.vercel.app/r/data-grid.json

# Using bun
bun x shadcn-svelte@latest add https://svelte-tablecn.vercel.app/r/data-grid.json
```

### Prerequisites

Make sure you have [shadcn-svelte](https://www.shadcn-svelte.com/) configured in your project:

```bash
pnpm dlx shadcn-svelte@latest init
```

## Usage

```svelte
<script lang="ts">
  import { DataGrid } from '$lib/components/data-grid';
  import { useDataGrid } from '$lib/hooks/use-data-grid.svelte';
  import type { ColumnDef } from '@tanstack/table-core';

  type Person = {
    id: string;
    name: string;
    email: string;
    age: number;
  };

  let data = $state<Person[]>([
    { id: '1', name: 'John Doe', email: 'john@example.com', age: 30 },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', age: 25 },
  ]);

  const columns: ColumnDef<Person, unknown>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      meta: {
        cell: { variant: 'short-text' }
      }
    },
    {
      accessorKey: 'email',
      header: 'Email',
      meta: {
        cell: { variant: 'short-text' }
      }
    },
    {
      accessorKey: 'age',
      header: 'Age',
      meta: {
        cell: { variant: 'number' }
      }
    }
  ];

  const grid = useDataGrid({
    getData: () => data,
    columns,
    enableSearch: true,
    onDataUpdate: (updates) => {
      // Handle cell updates
      const updateArray = Array.isArray(updates) ? updates : [updates];
      for (const update of updateArray) {
        const row = data[update.rowIndex];
        if (row) {
          (row as any)[update.columnId] = update.value;
        }
      }
      data = [...data];
    }
  });
</script>

<DataGrid {...grid} height={600} />
```

## Cell Variants

The data grid supports multiple cell types:

| Variant | Description |
|---------|-------------|
| `short-text` | Single-line text input |
| `long-text` | Multi-line text with expandable editor |
| `number` | Numeric input |
| `date` | Date picker |
| `select` | Single select dropdown |
| `multi-select` | Multiple select with tags |
| `checkbox` | Boolean checkbox |
| `url` | URL input with link preview |
| `file` | File upload cell |

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
| `getData` | `() => TData[]` | Function returning the data array |
| `columns` | `ColumnDef<TData>[]` | Column definitions |
| `enableSearch` | `boolean` | Enable search functionality |
| `enableSorting` | `boolean` | Enable column sorting |
| `enableFiltering` | `boolean` | Enable column filtering |
| `enableColumnPinning` | `boolean` | Enable column pinning |
| `enableColumnResizing` | `boolean` | Enable column resizing |
| `readOnly` | `boolean` | Make grid read-only |
| `onDataUpdate` | `(updates) => void` | Called when cells are edited |
| `onRowAdd` | `() => void` | Called when a new row is added |
| `onRowsDelete` | `(rows, indices) => void` | Called when rows are deleted |

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
