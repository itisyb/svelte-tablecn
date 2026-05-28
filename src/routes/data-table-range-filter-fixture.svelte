<script lang="ts">
	import type { Column } from '@tanstack/table-core';
	import DataTableRangeFilter from '$lib/components/data-table/data-table-range-filter.svelte';
	import type { ExtendedColumnFilter } from '$lib/types/data-table.js';

	type Row = {
		salary: number;
	};

	let filter = $state<ExtendedColumnFilter<Row>>({
		id: 'salary',
		value: ['50000', ''],
		variant: 'range',
		operator: 'isBetween',
		filterId: 'salary-range'
	});

	const column = {
		id: 'salary',
		columnDef: {
			meta: {
				label: 'Salary',
				range: [0, 100000]
			}
		},
		getFacetedMinMaxValues: () => [0, 100000]
	} as unknown as Column<Row, unknown>;

	function updateFilter(
		filterId: string,
		updates: Partial<Omit<ExtendedColumnFilter<Row>, 'filterId'>>
	) {
		filter = { ...filter, ...updates, filterId };
	}
</script>

<DataTableRangeFilter {filter} {column} inputId="salary-filter" onFilterUpdate={updateFilter} />

<output aria-label="range filter value">
	{Array.isArray(filter.value) ? filter.value.join('|') : `${filter.value}`}
</output>
