<script lang="ts">
	import type { Cell, Table } from '@tanstack/table-core';
	import DateCell from '$lib/components/data-grid/cells/date-cell.svelte';

	type Row = { startDate: string | Date };

	let value = $state<string | Date>(new Date(2024, 0, 1));

	const cell = {
		id: '0_startDate',
		row: { id: '0' },
		column: { id: 'startDate' }
	} as unknown as Cell<Row, unknown>;

	const table = {
		options: {
			meta: {
				onDataUpdate: (update: { value: unknown }) => {
					value = update.value as string;
				},
				onCellEditingStart: () => {},
				onCellEditingStop: () => {}
			}
		}
	} as unknown as Table<Row>;
</script>

<button type="button" onclick={() => (value = '2024-01-03')}>External date</button>

<DateCell
	{cell}
	{table}
	rowIndex={0}
	columnId="startDate"
	isEditing={true}
	isFocused={true}
	isSelected={false}
	cellValue={value}
/>
