<script lang="ts">
	import type { ColumnDef } from '@tanstack/table-core';
	import { DataGrid, useDataGrid } from '$lib/components/data-grid';
	import { Button } from '$lib/components/ui/button/index.js';

	type Row = {
		id: string;
		name: string;
		age: number | null;
	};

	let data = $state<Row[]>([{ id: '1', name: 'Ada', age: 37 }]);

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
		},
		{
			id: 'age',
			accessorKey: 'age',
			header: 'Age',
			size: 120,
			meta: {
				cell: {
					variant: 'number'
				}
			}
		}
	];

	const { table, selectedCellsSet, ...dataGridProps } = useDataGrid({
		columns,
		data: () => data,
		onDataChange: (nextData) => {
			data = nextData;
		},
		getRowId: (row) => row.id,
		enablePaste: true
	});

	const selectedCount = $derived(selectedCellsSet.size);

	function pasteFromClipboard() {
		table.options.meta?.onCellsPaste?.();
	}
</script>

<Button onclick={pasteFromClipboard}>Paste from clipboard</Button>
<DataGrid {...dataGridProps} {table} {selectedCellsSet} height={160} />
<Button variant="outline">Outside target</Button>
<output aria-label="selected cells">{selectedCount}</output>
<output aria-label="first name">{data[0]?.name}</output>
<output aria-label="first age">{data[0]?.age}</output>
