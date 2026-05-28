<script lang="ts">
	import type { Table } from '@tanstack/table-core';
	import DataTableToolbar from '$lib/components/data-table/data-table-toolbar.svelte';

	type Row = {
		score: number;
	};

	let filterValue = $state<unknown>(42);

	const column = $derived({
		id: 'score',
		accessorFn: (row: Row) => row.score,
		columnDef: {
			meta: {
				label: 'Score',
				variant: 'number'
			}
		},
		getCanFilter: () => true,
		getCanHide: () => false,
		getIsVisible: () => true,
		getFilterValue: () => filterValue,
		setFilterValue: (value: unknown) => {
			filterValue = value;
		}
	});

	const table = $derived({
		getState: () => ({
			columnFilters: [{ id: 'score', value: filterValue }],
			columnVisibility: {}
		}),
		getAllColumns: () => [column],
		resetColumnFilters: () => {
			filterValue = undefined;
		}
	} as unknown as Table<Row>);
</script>

<DataTableToolbar {table} />
<output aria-label="number filter value">{filterValue == null ? '' : String(filterValue)}</output>
