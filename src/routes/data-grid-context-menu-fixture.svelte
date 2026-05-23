<script lang="ts">
	import type { Table } from '@tanstack/table-core';
	import DataGridContextMenu from '$lib/components/data-grid/data-grid-context-menu.svelte';

	type Row = {
		name: string;
	};

	let gridRef = $state<HTMLDivElement | null>(null);

	const table = {
		options: {
			meta: {
				contextMenu: {
					open: true,
					x: 20,
					y: 20
				},
				selectionState: {
					selectedCells: new Set(['0:name'])
				},
				get dataGridRef() {
					return gridRef;
				},
				onContextMenuOpenChange: () => {},
				onCellsCopy: () => {},
				onCellsCut: () => {},
				onDataUpdate: () => {},
				onRowsDelete: async () => {}
			}
		},
		getAllColumns: () => [
			{
				id: 'name',
				columnDef: {
					meta: {
						cell: {
							variant: 'short-text'
						}
					}
				}
			}
		]
	} as unknown as Table<Row>;
</script>

<div bind:this={gridRef} role="grid" tabindex={0}></div>
<DataGridContextMenu {table} />
