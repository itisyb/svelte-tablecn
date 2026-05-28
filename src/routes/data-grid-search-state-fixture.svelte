<script lang="ts">
	import type { ColumnDef } from '@tanstack/table-core';
	import { DataGrid, useDataGrid } from '$lib/components/data-grid';

	type Row = {
		id: string;
		name: string;
		actionLabel: string;
	};

	let data = $state<Row[]>([{ id: '1', name: 'Ada', actionLabel: 'Review' }]);

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
		},
		{
			id: 'actions',
			accessorKey: 'actionLabel',
			header: 'Actions',
			size: 120,
			meta: {
				cell: {
					variant: 'short-text'
				}
			}
		}
	];

	const dataGrid = useDataGrid({
		columns,
		data: () => data,
		onDataChange: (nextData) => {
			data = nextData;
		},
		getRowId: (row) => row.id,
		enableSearch: true
	});

	function searchAda() {
		dataGrid.searchState?.onSearch('Ada');
	}

	function searchReview() {
		dataGrid.searchState?.onSearch('Review');
	}

	function selectAllFromFocusedCell() {
		const grid = document.querySelector<HTMLElement>('[data-slot="grid"]');
		const firstCell = document.querySelector<HTMLElement>('[data-slot="grid-cell-wrapper"]');
		firstCell?.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
		firstCell?.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
		firstCell?.click();
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

<button type="button" onclick={searchAda}>Search Ada</button>
<button type="button" onclick={searchReview}>Search Review</button>
<button type="button" onclick={selectAllFromFocusedCell}>Select all from focused cell</button>
<DataGrid {...dataGrid} height={160} />
<output aria-label="initial match index">{dataGrid.searchState?.matchIndex}</output>
<output aria-label="active search match">
	{dataGrid.activeSearchMatch
		? `${dataGrid.activeSearchMatch.rowIndex}:${dataGrid.activeSearchMatch.columnId}`
		: 'none'}
</output>
<output aria-label="search matches by row">
	{dataGrid.searchMatchesByRow?.get(0)?.has('name') ? 'row0-name' : 'none'}
</output>
<output aria-label="action search match">
	{dataGrid.searchMatchesByRow?.get(0)?.has('actions') ? 'row0-actions' : 'none'}
</output>
<output aria-label="selected cells">{dataGrid.selectedCellsSet.size}</output>
<output aria-label="selection range">
	{dataGrid.tableMeta.selectionState?.selectionRange
		? `${dataGrid.tableMeta.selectionState.selectionRange.start.rowIndex}:${dataGrid.tableMeta.selectionState.selectionRange.start.columnId}-${dataGrid.tableMeta.selectionState.selectionRange.end.rowIndex}:${dataGrid.tableMeta.selectionState.selectionRange.end.columnId}`
		: 'none'}
</output>
