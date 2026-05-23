<script lang="ts">
	import type { ColumnFiltersState, Table } from '@tanstack/table-core';
	import DataGridFilterMenu from '$lib/components/data-grid/data-grid-filter-menu.svelte';

	let columnFilters = $state<ColumnFiltersState>([
		{
			id: 'name',
			value: {
				operator: 'contains',
				value: 'a'
			}
		}
	]);

	const columns = [
		{
			id: 'name',
			getCanFilter: () => true,
			columnDef: {
				meta: {
					label: 'Name',
					cell: {
						variant: 'short-text'
					}
				}
			}
		},
		{
			id: 'age',
			getCanFilter: () => true,
			columnDef: {
				meta: {
					label: 'Age',
					cell: {
						variant: 'number'
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
