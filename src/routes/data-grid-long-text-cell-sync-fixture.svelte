<script lang="ts">
	import type { Cell, Table } from '@tanstack/table-core';
	import LongTextCell from '$lib/components/data-grid/cells/long-text-cell.svelte';

	type Row = { notes: string };

	let value = $state('Original note');

	const cell = {
		id: '0_notes',
		row: { id: '0' },
		column: { id: 'notes' }
	} as unknown as Cell<Row, unknown>;

	const table = {
		options: {
			meta: {
				rowHeight: 'short',
				onDataUpdate: (update: { value: unknown }) => {
					value = update.value as string;
				},
				onCellEditingStart: () => {},
				onCellEditingStop: () => {}
			}
		}
	} as unknown as Table<Row>;
</script>

<button type="button" onclick={() => (value = 'External note')}>External note</button>

<LongTextCell
	{cell}
	{table}
	rowIndex={0}
	columnId="notes"
	isEditing={true}
	isFocused={true}
	isSelected={false}
	cellValue={value}
/>
