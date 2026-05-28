<script lang="ts">
	import type { ColumnDef } from '@tanstack/table-core';
	import { DataGrid, useDataGrid } from '$lib/components/data-grid';
	import { Button } from '$lib/components/ui/button/index.js';

	type Row = {
		id: string;
		name: string;
	};

	const data: Row[] = [{ id: '1', name: 'Ada' }];

	const columns: ColumnDef<Row, unknown>[] = [
		{
			id: 'name',
			accessorKey: 'name',
			header: 'Name',
			size: 160,
			meta: {
				cell: {
					variant: 'short-text'
				}
			}
		}
	];

	const { table, selectedCellsSet, ...dataGridProps } = useDataGrid({
		columns,
		data,
		getRowId: (row) => row.id
	});
</script>

<DataGrid {...dataGridProps} {table} {selectedCellsSet} height={120} />
<Button variant="outline">Outside focus target</Button>
