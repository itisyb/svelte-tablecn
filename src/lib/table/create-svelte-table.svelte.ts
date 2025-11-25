// TanStack Table integration for Svelte 5
// This creates a reactive table instance using Svelte 5 runes

import {
	createTable,
	getCoreRowModel,
	type TableOptions,
	type TableOptionsResolved,
	type TableState,
	type Table,
	type RowData,
	type Updater
} from '@tanstack/table-core';

export interface CreateSvelteTableOptions<TData extends RowData>
	extends Omit<TableOptions<TData>, 'getCoreRowModel'> {
	// Make getCoreRowModel optional since we provide a default
	getCoreRowModel?: ReturnType<typeof getCoreRowModel>;
}

/**
 * Creates a reactive TanStack Table instance for Svelte 5
 *
 * @param options - Table options (can be reactive via getter function)
 * @returns A reactive table instance
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { createSvelteTable } from '$lib/table';
 *
 *   let data = $state([...]);
 *
 *   const table = createSvelteTable({
 *     get data() { return data },
 *     columns,
 *   });
 * </script>
 * ```
 */
export function createSvelteTable<TData extends RowData>(
	options: CreateSvelteTableOptions<TData>
): Table<TData> {
	// Create reactive state for the table - initialized properly
	let tableState = $state<TableState>({
		columnFilters: [],
		columnOrder: [],
		columnPinning: { left: [], right: [] },
		columnSizing: {},
		columnSizingInfo: {
			columnSizingStart: [],
			deltaOffset: null,
			deltaPercentage: null,
			isResizingColumn: false,
			startOffset: null,
			startSize: null
		},
		columnVisibility: {},
		expanded: {},
		globalFilter: undefined,
		grouping: [],
		pagination: {
			pageIndex: 0,
			pageSize: 10
		},
		rowPinning: { top: [], bottom: [] },
		rowSelection: {},
		sorting: []
	});

	// Build the resolved options
	const resolvedOptions: TableOptionsResolved<TData> = {
		...options,
		getCoreRowModel: options.getCoreRowModel ?? getCoreRowModel(),
		state: {
			...tableState,
			...options.state
		},
		onStateChange: (updater: Updater<TableState>) => {
			// Update our reactive state
			if (typeof updater === 'function') {
				tableState = updater(tableState);
			} else {
				tableState = updater;
			}

			// Call user's onStateChange if provided
			options.onStateChange?.(updater);
		},
		renderFallbackValue: null
	} as TableOptionsResolved<TData>;

	const table = createTable(resolvedOptions);

	// Initialize state from table's initial state
	tableState = { ...tableState, ...table.initialState };

	// Create effect to update table options when they change
	$effect(() => {
		table.setOptions((prev) => ({
			...prev,
			...options,
			state: {
				...tableState,
				...options.state
			},
			onStateChange: (updater: Updater<TableState>) => {
				if (typeof updater === 'function') {
					tableState = updater(tableState);
				} else {
					tableState = updater;
				}
				options.onStateChange?.(updater);
			}
		}));
	});

	return table;
}

/**
 * Helper to create table options with reactive data
 * Use this when you want to pass reactive data to the table
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   let data = $state([...]);
 *   let sorting = $state([]);
 *
 *   const table = createSvelteTable(
 *     tableOptions(() => ({
 *       data,
 *       columns,
 *       state: { sorting },
 *       onSortingChange: (updater) => {
 *         sorting = typeof updater === 'function' ? updater(sorting) : updater;
 *       }
 *     }))
 *   );
 * </script>
 * ```
 */
export function tableOptions<TData extends RowData>(
	getOptions: () => CreateSvelteTableOptions<TData>
): CreateSvelteTableOptions<TData> {
	// This is a helper that makes the pattern clearer
	// The actual reactivity comes from the $effect in createSvelteTable
	return getOptions();
}

// Re-export useful types and functions from table-core
export {
	createColumnHelper,
	type ColumnDef,
	type ColumnHelper,
	type Row,
	type Cell,
	type Header,
	type HeaderGroup,
	type Column,
	type Table,
	type TableState,
	type SortingState,
	type ColumnFiltersState,
	type VisibilityState,
	type RowSelectionState,
	type PaginationState,
	type Updater
} from '@tanstack/table-core';
