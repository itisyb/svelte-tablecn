<script lang="ts">
	import type { ColumnDef } from '@tanstack/table-core';
	import { DataGrid, getDataGridSelectColumn, useDataGrid } from '$lib/components/data-grid';

	type Row = {
		id: string;
		name: string;
	};

	const data: Row[] = [
		{ id: '1', name: 'Ada' },
		{ id: '2', name: 'Grace' }
	];

	const columns: ColumnDef<Row, unknown>[] = [
		getDataGridSelectColumn<Row>({ enableRowMarkers: true, readOnly: true }),
		{
			id: 'name',
			accessorKey: 'name',
			header: 'Name',
			meta: { cell: { variant: 'short-text' } }
		}
	];

	const { table, selectedCellsSet, getSelectionVersion, ...dataGridProps } = useDataGrid({
		columns,
		data,
		getRowId: (row) => row.id,
		initialState: {
			rowSelection: { '1': true }
		}
	});
</script>

<DataGrid {...dataGridProps} {table} {selectedCellsSet} {getSelectionVersion} height={120} />
