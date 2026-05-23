<script lang="ts">
	import type { ColumnDef } from '@tanstack/table-core';
	import { Button } from '$lib/components/ui/button/index.js';
	import { DataGrid, getDataGridSelectColumn, useDataGrid } from '$lib/components/data-grid';

	type Row = {
		id: string;
		name: string;
	};

	let nextId = 2;
	let data = $state<Row[]>([{ id: '1', name: 'Ada' }]);

	const columns: ColumnDef<Row, unknown>[] = [
		getDataGridSelectColumn<Row>(),
		{
			id: 'name',
			accessorKey: 'name',
			header: 'Name',
			meta: { cell: { variant: 'short-text' } }
		}
	];

	const { table, selectedCellsSet, getSelectionVersion, ...dataGridProps } = useDataGrid({
		columns,
		data: () => data,
		onDataChange: (nextData) => {
			data = nextData;
		},
		getRowId: (row) => row.id,
		onRowAdd: () => {
			const rowIndex = data.length;
			const row = { id: String(nextId++), name: 'Grace' };
			data = [...data, row];
			return { rowIndex, rowId: row.id, columnId: 'name' };
		}
	});

	const selectionVersion = $derived(getSelectionVersion());
	const selectedRows = $derived.by(() => {
		selectionVersion;
		return Object.keys(dataGridProps.getRowSelection()).length;
	});
</script>

<Button onclick={() => dataGridProps.onRowAdd?.()}>Add row</Button>
<DataGrid {...dataGridProps} {table} {selectedCellsSet} {getSelectionVersion} height={160} />
<output aria-label="selected rows">{selectedRows}</output>
<output aria-label="row count">{data.length}</output>
