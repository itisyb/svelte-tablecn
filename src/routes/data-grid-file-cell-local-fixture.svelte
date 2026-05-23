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
						maxFileSize: 1024,
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
</script>

<output aria-label="file count">{value.length}</output>
<output aria-label="first file">{value[0]?.name ?? ''}</output>

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
