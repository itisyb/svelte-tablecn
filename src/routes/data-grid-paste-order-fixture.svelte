<script lang="ts">
	import type { ColumnDef } from '@tanstack/table-core';
	import { DataGrid, useDataGrid } from '$lib/components/data-grid';
	import { Button } from '$lib/components/ui/button/index.js';

	type Row = {
		id: string;
		name: string;
	};

	let data = $state<Row[]>([{ id: '1', name: 'Ada' }]);
	let events = $state<string[]>([]);

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
			events = [...events, 'change'];
			data = nextData;
		},
		onPaste: async () => {
			events = [...events, 'paste-start'];
			await new Promise((resolve) => setTimeout(resolve, 10));
			events = [...events, 'paste-end'];
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
<output aria-label="first name">{data[0]?.name}</output>
<output aria-label="paste events">{events.join(',')}</output>
