<script lang="ts">
	import type { ColumnFiltersState, Table } from '@tanstack/table-core';
	import DataGridFilterMenu from '$lib/components/data-grid/data-grid-filter-menu.svelte';

	let columnFilters = $state<ColumnFiltersState>([
		{
			id: 'status',
			value: {
				operator: 'is',
				value: undefined
			}
		}
	]);

	const columns = [
		{
			id: 'status',
			getCanFilter: () => true,
			columnDef: {
				meta: {
					label: 'Status',
					cell: {
						variant: 'select',
						options: [
							{ label: 'Active', value: 'active' },
							{ label: 'Paused', value: 'paused' }
						]
					}
				}
			}
		}
	];

	const table = $derived({
		getAllColumns: () => columns,
		getColumn: (id: string) => columns.find((column) => column.id === id),
		getState: () => ({ columnFilters }),
		initialState: { columnFilters: [] },
		setColumnFilters: (
			updater: ColumnFiltersState | ((previous: ColumnFiltersState) => ColumnFiltersState)
		) => {
			columnFilters = typeof updater === 'function' ? updater(columnFilters) : updater;
		}
	} as unknown as Table<unknown>);
</script>

<DataGridFilterMenu {table} />
