<script lang="ts">
	import type { Cell, Table } from '@tanstack/table-core';
	import FileCell from '$lib/components/data-grid/cells/file-cell.svelte';
	import type { FileCellData } from '$lib/types/data-grid.js';

	type Row = { attachments: FileCellData[] };

	let value = $state<FileCellData[]>([]);

	const cell = {
		id: '0_attachments',
		row: { id: '0' },
		column: {
			id: 'attachments',
			columnDef: {
				meta: {
					cell: {
						variant: 'file',
						maxFileSize: 1,
						maxFiles: 2,
						multiple: true
					}
				}
			}
		}
	} as unknown as Cell<Row, unknown>;

	const table = {
		options: {
			data: [{} as Row],
			meta: {
				onDataUpdate: (update: { value: unknown }) => {
					value = update.value as FileCellData[];
				},
				onCellEditingStart: () => {},
				onCellEditingStop: () => {}
			}
		}
	} as unknown as Table<Row>;

	function replaceExternally() {
		value = [
			{
				id: 'server-file',
				name: 'server.txt',
				size: 12,
				type: 'text/plain',
				url: 'https://example.com/server.txt'
			}
		];
	}
</script>

<button type="button" onclick={replaceExternally}>Replace files</button>
<FileCell
	{cell}
	{table}
	rowIndex={0}
	columnId="attachments"
	isEditing={true}
	isFocused={true}
	isSelected={false}
	cellValue={value}
/>
<output aria-label="file names">{value.map((file) => file.name).join(', ') || 'none'}</output>
