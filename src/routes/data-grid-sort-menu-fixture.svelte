<script lang="ts">
	import type { SortingState, Table } from '@tanstack/table-core';
	import DataGridSortMenu from '$lib/components/data-grid/data-grid-sort-menu.svelte';

	let sorting = $state<SortingState>([{ id: 'name', desc: false }]);

	const columns = [
		{
			id: 'name',
			getCanSort: () => true,
			columnDef: {
				meta: {
					label: 'Name'
				}
			}
		},
		{
			id: 'age',
			getCanSort: () => true,
			columnDef: {
				meta: {
					label: 'Age'
				}
			}
		}
	];

	const table = $derived({
		getAllColumns: () => columns,
		getState: () => ({ sorting }),
		initialState: { sorting: [] },
		setSorting: (updater: SortingState | ((previous: SortingState) => SortingState)) => {
			sorting = typeof updater === 'function' ? updater(sorting) : updater;
		}
	} as unknown as Table<unknown>);
</script>

<DataGridSortMenu {table} />
