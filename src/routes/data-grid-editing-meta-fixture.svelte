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

	const dataGrid = useDataGrid({
		columns,
		data,
		getRowId: (row) => row.id
	});

	function startSecondName() {
		dataGrid.table.options.meta?.onCellEditingStart?.(1, 'name');
	}

	function stopRight() {
		dataGrid.table.options.meta?.onCellEditingStop?.({ direction: 'right' });
	}

	function startSecondNameAndStopRight() {
		dataGrid.table.options.meta?.onCellEditingStart?.(1, 'name');
		dataGrid.table.options.meta?.onCellEditingStop?.({ direction: 'right' });
	}

	function preventedDoubleClick() {
		const event = new MouseEvent('dblclick', { bubbles: true, cancelable: true });
		event.preventDefault();
		dataGrid.table.options.meta?.onCellDoubleClick?.(1, 'name', event);
	}
</script>

<button type="button" onclick={startSecondName}>Start second name edit</button>
<button type="button" onclick={stopRight}>Stop right</button>
<button type="button" onclick={startSecondNameAndStopRight}>Start second name and stop right</button>
<button type="button" onclick={preventedDoubleClick}>Prevented double click</button>
<DataGrid {...dataGrid} height={180} />
<output aria-label="meta focused cell">
	{dataGrid.table.options.meta?.focusedCell
		? `${dataGrid.table.options.meta.focusedCell.rowIndex}:${dataGrid.table.options.meta.focusedCell.columnId}`
		: 'none'}
</output>
<output aria-label="meta editing cell">
	{dataGrid.table.options.meta?.editingCell
		? `${dataGrid.table.options.meta.editingCell.rowIndex}:${dataGrid.table.options.meta.editingCell.columnId}`
		: 'none'}
</output>
<output aria-label="hook focused cell">
	{dataGrid.focusedCell ? `${dataGrid.focusedCell.rowIndex}:${dataGrid.focusedCell.columnId}` : 'none'}
</output>
<output aria-label="hook editing cell">
	{dataGrid.editingCell ? `${dataGrid.editingCell.rowIndex}:${dataGrid.editingCell.columnId}` : 'none'}
</output>
<output aria-label="hook table meta focused cell">
	{dataGrid.tableMeta.focusedCell
		? `${dataGrid.tableMeta.focusedCell.rowIndex}:${dataGrid.tableMeta.focusedCell.columnId}`
		: 'none'}
</output>
<output aria-label="hook table meta editing cell">
	{dataGrid.tableMeta.editingCell
		? `${dataGrid.tableMeta.editingCell.rowIndex}:${dataGrid.tableMeta.editingCell.columnId}`
		: 'none'}
</output>
