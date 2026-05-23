<script lang="ts">
	import type { ColumnDef } from '@tanstack/table-core';
	import { DataGrid, useDataGrid } from '$lib/components/data-grid';
	import { Button } from '$lib/components/ui/button/index.js';

	type Row = {
		id: string;
		name: string;
		age: number;
	};

	let data = $state<Row[]>([{ id: '1', name: 'Ada', age: 37 }]);

	const columns: ColumnDef<Row, unknown>[] = [
		{
			id: 'name',
			accessorKey: 'name',
			header: 'Name',
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
		getRowId: (row) => row.id
	});

	const selectedCount = $derived(selectedCellsSet.size);

	function dispatchSelectAllShortcut() {
		const grid = document.querySelector<HTMLElement>('[data-slot="grid"]');
		grid?.focus();
		grid?.dispatchEvent(
			new KeyboardEvent('keydown', {
				key: 'a',
				ctrlKey: true,
				bubbles: true,
				cancelable: true
			})
		);
	}
</script>

<Button onclick={dispatchSelectAllShortcut}>Dispatch select all</Button>
<DataGrid {...dataGridProps} {table} {selectedCellsSet} height={140} />
<output aria-label="selected cells">{selectedCount}</output>
