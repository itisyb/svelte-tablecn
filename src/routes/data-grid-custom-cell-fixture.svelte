<script lang="ts">
	import type { ColumnDef } from '@tanstack/table-core';
	import { DataGrid, useDataGrid } from '$lib/components/data-grid';

	type Person = {
		id: string;
		name: string;
	};

	let data = $state<Person[]>([{ id: '1', name: 'Ada' }]);

	const columns: ColumnDef<Person, unknown>[] = [
		{
			id: 'custom',
			accessorKey: 'name',
			header: 'Custom',
			cell: ({ row }) => `Custom ${row.original.name}`,
			size: 180
		}
	];

	const { table, ...dataGridProps } = useDataGrid({
		columns,
		data: () => data,
		onDataChange: (nextData) => {
			data = nextData;
		},
		getRowId: (row) => row.id
	});
</script>

<DataGrid {...dataGridProps} {table} height={120} />
