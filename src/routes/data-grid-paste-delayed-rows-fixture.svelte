<script lang="ts">
	import type { ColumnDef } from '@tanstack/table-core';
	import {
		DataGrid,
		useDataGrid,
		useDataGridUndoRedo,
		type UndoRedoCellUpdate
	} from '$lib/components/data-grid';
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

	const undoRedo = useDataGridUndoRedo({
		data: () => data,
		onDataChange: (nextData) => {
			data = nextData;
		},
		getRowId: (row) => row.id
	});

	const { table, ...dataGridProps } = useDataGrid({
		columns,
		data: () => data,
		onDataChange: (nextData) => {
			const cellUpdates: UndoRedoCellUpdate[] = [];

			for (let rowIndex = 0; rowIndex < Math.max(data.length, nextData.length); rowIndex++) {
				const oldRow = data[rowIndex];
				const newRow = nextData[rowIndex];
				if (!oldRow || !newRow) continue;

				if (!Object.is(oldRow.name, newRow.name)) {
					cellUpdates.push({
						rowId: oldRow.id,
						columnId: 'name',
						previousValue: oldRow.name,
						newValue: newRow.name
					});
				}
			}

			undoRedo.trackCellsUpdate(cellUpdates);
			data = nextData;
		},
		onRowsAdd: (count) => {
			const rows = Array.from({ length: count }, () => ({
				id: String(nextId++),
				name: ''
			}));
			setTimeout(() => {
				data = [...data, ...rows];
				undoRedo.trackRowsAdd(rows);
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
<Button onclick={undoRedo.onUndo}>Undo</Button>
<Button onclick={undoRedo.onRedo}>Redo</Button>
<DataGrid {...dataGridProps} {table} height={180} />
<output aria-label="row count">{data.length}</output>
<output aria-label="first name">{data[0]?.name}</output>
<output aria-label="second name">{data[1]?.name}</output>
<output aria-label="can undo">{undoRedo.canUndo ? 'yes' : 'no'}</output>
<output aria-label="can redo">{undoRedo.canRedo ? 'yes' : 'no'}</output>
