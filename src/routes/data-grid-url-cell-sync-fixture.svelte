<script lang="ts">
	import type { Cell, Table } from '@tanstack/table-core';
	import UrlCell from '$lib/components/data-grid/cells/url-cell.svelte';

	type Row = { website: string };

	let value = $state('https://original.example');

	const cell = {
		id: '0_website',
		row: { id: '0' },
		column: { id: 'website' }
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

<button type="button" onclick={() => (value = 'https://external.example')}>External URL</button>

<UrlCell
	{cell}
	{table}
	rowIndex={0}
	columnId="website"
	isEditing={true}
	isFocused={true}
	isSelected={false}
	cellValue={value}
/>
