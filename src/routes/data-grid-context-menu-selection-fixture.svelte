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

	const dataGrid = useDataGrid({
		columns,
		data,
		getRowId: (row) => row.id
	});

	let prevented = $state(false);
	let stopped = $state(false);
	let clickPrevented = $state(false);

	function openFirstCellContextMenu() {
		prevented = false;
		stopped = false;

		dataGrid.tableMeta.onCellContextMenu?.(0, 'name', {
			clientX: 40,
			clientY: 40,
			preventDefault: () => {
				prevented = true;
			},
			stopPropagation: () => {
				stopped = true;
			}
		} as MouseEvent);
	}

	function rightClickFirstCellViaMeta() {
		clickPrevented = false;

		dataGrid.tableMeta.onCellClick?.(0, 'name', {
			button: 2,
			preventDefault: () => {
				clickPrevented = true;
			}
		} as MouseEvent);
	}
</script>

<button type="button" onclick={openFirstCellContextMenu}>Open first cell context menu</button>
<button type="button" onclick={rightClickFirstCellViaMeta}>Right click first cell via meta</button>
<DataGrid {...dataGrid} height={160} />
<output aria-label="context menu prevented">{prevented ? 'yes' : 'no'}</output>
<output aria-label="context menu stopped">{stopped ? 'yes' : 'no'}</output>
<output aria-label="cell click prevented">{clickPrevented ? 'yes' : 'no'}</output>
<output aria-label="context menu open">{dataGrid.contextMenu.open ? 'open' : 'closed'}</output>
<output aria-label="selected cells">{dataGrid.selectedCellsSet.size}</output>
<output aria-label="focused cell">
	{dataGrid.focusedCell ? `${dataGrid.focusedCell.rowIndex}:${dataGrid.focusedCell.columnId}` : 'none'}
</output>
