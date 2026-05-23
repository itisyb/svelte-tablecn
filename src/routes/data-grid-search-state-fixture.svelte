<script lang="ts">
	import type { ColumnDef } from '@tanstack/table-core';
	import { DataGrid, useDataGrid } from '$lib/components/data-grid';

	type Row = {
		id: string;
		name: string;
	};

	let data = $state<Row[]>([{ id: '1', name: 'Ada' }]);

	const columns: ColumnDef<Row, unknown>[] = [
		{
			id: 'name',
			accessorKey: 'name',
			header: 'Name',
			size: 180,
			meta: {
				cell: {
					variant: 'short-text'
				}
			}
		}
	];

	const dataGrid = useDataGrid({
		columns,
		data: () => data,
		onDataChange: (nextData) => {
			data = nextData;
		},
		getRowId: (row) => row.id,
		enableSearch: true
	});

	function searchAda() {
		dataGrid.searchState?.onSearch('Ada');
	}
</script>

<button type="button" onclick={searchAda}>Search Ada</button>
<DataGrid {...dataGrid} height={160} />
<output aria-label="initial match index">{dataGrid.searchState?.matchIndex}</output>
<output aria-label="active search match">
	{dataGrid.activeSearchMatch
		? `${dataGrid.activeSearchMatch.rowIndex}:${dataGrid.activeSearchMatch.columnId}`
		: 'none'}
</output>
<output aria-label="search matches by row">
	{dataGrid.searchMatchesByRow?.get(0)?.has('name') ? 'row0-name' : 'none'}
</output>
