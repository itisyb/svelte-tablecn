<script lang="ts">
	import type { ColumnDef } from '@tanstack/table-core';
	import {
		DataGrid,
		type UndoRedoCellUpdate,
		useDataGrid,
		useDataGridUndoRedo
	} from '$lib/components/data-grid';

	type Row = {
		id: string;
		first: string;
		second: string;
		third: string;
	};

	let data = $state<Row[]>([
		{
			id: '1',
			first: 'A',
			second: 'B',
			third: 'C'
		}
	]);

	const columns: ColumnDef<Row, unknown>[] = [
		{
			id: 'first',
			accessorKey: 'first',
			header: 'First',
			meta: { cell: { variant: 'short-text' } }
		},
		{
			id: 'second',
			accessorKey: 'second',
			header: 'Second',
			meta: { cell: { variant: 'short-text' } }
		},
		{
			id: 'third',
			accessorKey: 'third',
			header: 'Third',
			meta: { cell: { variant: 'short-text' } }
		}
	];

	const undoRedo = useDataGridUndoRedo({
		data: () => data,
		onDataChange: (nextData) => {
			data = nextData;
		},
		getRowId: (row) => row.id
	});

	function handleDataChange(nextData: Row[]) {
		const keys = ['first', 'second', 'third'] as const;
		const cellUpdates: UndoRedoCellUpdate[] = [];

		for (let rowIndex = 0; rowIndex < Math.max(data.length, nextData.length); rowIndex++) {
			const previousRow = data[rowIndex];
			const nextRow = nextData[rowIndex];
			if (!previousRow || !nextRow) continue;

			for (const key of keys) {
				if (Object.is(previousRow[key], nextRow[key])) continue;

				cellUpdates.push({
					rowId: previousRow.id,
					columnId: key,
					previousValue: previousRow[key],
					newValue: nextRow[key]
				});
			}
		}

		undoRedo.trackCellsUpdate(cellUpdates);
		data = nextData;
	}

	const { table, selectedCellsSet, getSelectionVersion, ...dataGridProps } = useDataGrid({
		columns,
		data: () => data,
		onDataChange: handleDataChange,
		getRowId: (row) => row.id
	});

	const selectionVersion = $derived(getSelectionVersion());
	const selectedCount = $derived.by(() => {
		selectionVersion;
		return selectedCellsSet.size;
	});
</script>

<DataGrid {...dataGridProps} {table} {selectedCellsSet} {getSelectionVersion} height={140} />
<output aria-label="selected cells">{selectedCount}</output>
<output aria-label="first value">{data[0]?.first}</output>
<output aria-label="second value">{data[0]?.second}</output>
<output aria-label="third value">{data[0]?.third}</output>
<output aria-label="can undo">{undoRedo.canUndo ? 'yes' : 'no'}</output>
<output aria-label="can redo">{undoRedo.canRedo ? 'yes' : 'no'}</output>
