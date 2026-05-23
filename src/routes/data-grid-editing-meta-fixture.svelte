<script lang="ts">
	import type { ColumnDef } from '@tanstack/table-core';
	import { DataGrid, useDataGrid } from '$lib/components/data-grid';

	type Row = {
		id: string;
		name: string;
		score: number;
	};

	const data: Row[] = [
		{ id: '1', name: 'Ada', score: 10 },
		{ id: '2', name: 'Grace', score: 20 }
	];

	const columns: ColumnDef<Row, unknown>[] = [
		{
			id: 'name',
			accessorKey: 'name',
			header: 'Name',
			size: 160,
			meta: { cell: { variant: 'short-text' } }
		},
		{
			id: 'score',
			accessorKey: 'score',
			header: 'Score',
			size: 120,
			meta: { cell: { variant: 'number' } }
		}
	];

	const { table, ...dataGridProps } = useDataGrid({
		columns,
		data,
		getRowId: (row) => row.id
	});

	function startSecondName() {
		table.options.meta?.onCellEditingStart?.(1, 'name');
	}

	function stopRight() {
		table.options.meta?.onCellEditingStop?.({ direction: 'right' });
	}

	function startSecondNameAndStopRight() {
		table.options.meta?.onCellEditingStart?.(1, 'name');
		table.options.meta?.onCellEditingStop?.({ direction: 'right' });
	}
</script>

<button type="button" onclick={startSecondName}>Start second name edit</button>
<button type="button" onclick={stopRight}>Stop right</button>
<button type="button" onclick={startSecondNameAndStopRight}>Start second name and stop right</button>
<DataGrid {...dataGridProps} {table} height={180} />
<output aria-label="focused cell">
	{table.options.meta?.focusedCell
		? `${table.options.meta.focusedCell.rowIndex}:${table.options.meta.focusedCell.columnId}`
		: 'none'}
</output>
<output aria-label="editing cell">
	{table.options.meta?.editingCell
		? `${table.options.meta.editingCell.rowIndex}:${table.options.meta.editingCell.columnId}`
		: 'none'}
</output>
