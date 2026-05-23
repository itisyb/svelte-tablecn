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
		onRowsAdd: (count) => {
			const rows = Array.from({ length: count }, () => ({
				id: String(nextId++),
				name: ''
			}));
			setTimeout(() => {
				data = [...data, ...rows];
			}, 150);
		},
		getRowId: (row) => row.id,
		enablePaste: true
	});

	function pasteFromClipboard() {
		table.options.meta?.onCellsPaste?.();
	}
</script>

<Button onclick={pasteFromClipboard}>Paste from clipboard</Button>
<DataGrid {...dataGridProps} {table} height={180} />
<output aria-label="row count">{data.length}</output>
<output aria-label="first name">{data[0]?.name}</output>
<output aria-label="second name">{data[1]?.name}</output>
