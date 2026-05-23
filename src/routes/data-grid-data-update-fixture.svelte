<script lang="ts">
	import type { ColumnDef } from '@tanstack/table-core';
	import { DataGrid, useDataGrid } from '$lib/components/data-grid';

	type Row = {
		id: string;
		name: string;
	};

	let data = $state<Row[]>([{ id: '1', name: 'Ada' }]);
	let changeCount = $state(0);

	const columns: ColumnDef<Row, unknown>[] = [
		{
			id: 'name',
			accessorKey: 'name',
			header: 'Name',
			size: 180,
			meta: { cell: { variant: 'short-text' } }
		}
	];

	const dataGrid = useDataGrid({
		columns,
		data: () => data,
		getRowId: (row) => row.id,
		onDataChange: (nextData) => {
			changeCount += 1;
			data = nextData;
		}
	});

	function updateMissingRow() {
		dataGrid.table.options.meta?.onDataUpdate?.({
			rowIndex: 999,
			columnId: 'name',
			value: 'Missing'
		});
	}
</script>

<button type="button" onclick={updateMissingRow}>Update missing row</button>
<DataGrid {...dataGrid} height={160} />
<output aria-label="change count">{changeCount}</output>
<output aria-label="first name">{data[0]?.name ?? ''}</output>
