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
			size: 120,
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

	const defaultFocusGrid = useDataGrid({
		columns,
		data,
		getRowId: (row) => row.id,
		autoFocus: true
	});

	const targetFocusGrid = useDataGrid({
		columns,
		data,
		getRowId: (row) => row.id,
		autoFocus: { rowIndex: 1, columnId: 'score' }
	});

	const rowOnlyFocusGrid = useDataGrid({
		columns,
		data,
		getRowId: (row) => row.id,
		autoFocus: { rowIndex: 1 }
	});
</script>

<DataGrid {...defaultFocusGrid} height={120} />
<output aria-label="default focused cell">
	{defaultFocusGrid.focusedCell
		? `${defaultFocusGrid.focusedCell.rowIndex}:${defaultFocusGrid.focusedCell.columnId}`
		: 'none'}
</output>

<DataGrid {...targetFocusGrid} height={120} />
<output aria-label="target focused cell">
	{targetFocusGrid.focusedCell
		? `${targetFocusGrid.focusedCell.rowIndex}:${targetFocusGrid.focusedCell.columnId}`
		: 'none'}
</output>

<DataGrid {...rowOnlyFocusGrid} height={120} />
<output aria-label="row-only focused cell">
	{rowOnlyFocusGrid.focusedCell
		? `${rowOnlyFocusGrid.focusedCell.rowIndex}:${rowOnlyFocusGrid.focusedCell.columnId}`
		: 'none'}
</output>
