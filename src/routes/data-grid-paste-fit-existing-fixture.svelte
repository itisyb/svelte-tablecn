<script lang="ts">
	import type { ColumnDef } from '@tanstack/table-core';
	import { DataGrid, useDataGrid } from '$lib/components/data-grid';
	import { Button } from '$lib/components/ui/button/index.js';

	type Row = {
		id: string;
		name: string;
	};

	let data = $state<Row[]>([{ id: '1', name: 'Ada' }]);
	let nextId = 2;

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

	const { table, ...dataGridProps } = useDataGrid({
		columns,
		data: () => data,
		onDataChange: (nextData) => {
			data = nextData;
		},
		onRowAdd: () => {
			const row = { id: String(nextId++), name: '' };
			data = [...data, row];
		},
		getRowId: (row) => row.id,
		enablePaste: true
	});

	function pasteFromClipboard() {
		table.options.meta?.onCellsPaste?.();
	}
</script>

<Button onclick={pasteFromClipboard}>Paste from clipboard</Button>
<DataGrid {...dataGridProps} {table} height={160} />
<output aria-label="row count">{data.length}</output>
<output aria-label="first name">{data[0]?.name}</output>
