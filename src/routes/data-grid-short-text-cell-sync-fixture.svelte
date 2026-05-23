<script lang="ts">
	import type { Cell, Table } from '@tanstack/table-core';
	import ShortTextCell from '$lib/components/data-grid/cells/short-text-cell.svelte';

	type Row = { name: string };

	let value = $state('Original name');

	const cell = {
		id: '0_name',
		row: { id: '0' },
		column: { id: 'name' }
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

<button type="button" onclick={() => (value = 'External name')}>External name</button>
<output aria-label="saved name">{value}</output>

<ShortTextCell
	{cell}
	{table}
	rowIndex={0}
	columnId="name"
	isEditing={true}
	isFocused={true}
	isSelected={false}
	cellValue={value}
/>
