<script lang="ts">
	import type { Table } from '@tanstack/table-core';
	import DataGridFilterMenu from '$lib/components/data-grid/data-grid-filter-menu.svelte';
	import DataGridSortMenu from '$lib/components/data-grid/data-grid-sort-menu.svelte';

	const table = {
		getAllColumns: () => [],
		getState: () => ({ columnFilters: [], sorting: [] }),
		initialState: { columnFilters: [], sorting: [] },
		setColumnFilters: () => {},
		setSorting: () => {}
	} as unknown as Table<unknown>;
</script>

<DataGridFilterMenu {table} disabled />
<DataGridSortMenu {table} disabled />
