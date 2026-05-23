<script lang="ts">
	import type { ColumnDef } from '@tanstack/table-core';
	import { DataGrid, useDataGrid } from '$lib/components/data-grid';

	type Row = {
		id: string;
		first: string;
		second: string;
		third: string;
	};

	let data = $state<Row[]>([
		{
			id: '1',
			first: 'A',
			second: 'B',
			third: 'C'
		}
	]);

	const columns: ColumnDef<Row, unknown>[] = [
		{
			id: 'first',
			accessorKey: 'first',
			header: 'First',
			meta: { cell: { variant: 'short-text' } }
		},
		{
			id: 'second',
			accessorKey: 'second',
			header: 'Second',
			meta: { cell: { variant: 'short-text' } }
		},
		{
			id: 'third',
			accessorKey: 'third',
			header: 'Third',
			meta: { cell: { variant: 'short-text' } }
		}
	];

	const { table, selectedCellsSet, getSelectionVersion, ...dataGridProps } = useDataGrid({
		columns,
		data: () => data,
		onDataChange: (nextData) => {
			data = nextData;
		},
		getRowId: (row) => row.id
	});

	const selectionVersion = $derived(getSelectionVersion());
	const selectedCount = $derived.by(() => {
		selectionVersion;
		return selectedCellsSet.size;
	});
</script>

<DataGrid {...dataGridProps} {table} {selectedCellsSet} {getSelectionVersion} height={140} />
<output aria-label="selected cells">{selectedCount}</output>
