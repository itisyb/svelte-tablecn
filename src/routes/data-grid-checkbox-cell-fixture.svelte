<script lang="ts">
	import type { Cell, Table } from '@tanstack/table-core';
	import CheckboxCell from '$lib/components/data-grid/cells/checkbox-cell.svelte';

	let value = $state(false);

	const cell = {
		id: '0_active',
		row: {
			id: '0'
		},
		column: {
			id: 'active'
		}
	} as unknown as Cell<{ active: boolean }, unknown>;

	const table = {
		options: {
			meta: {
				onDataUpdate: () => {}
			}
		}
	} as unknown as Table<{ active: boolean }>;
</script>

<button type="button" onclick={() => (value = true)}>External check</button>

<CheckboxCell
	{cell}
	{table}
	rowIndex={0}
	columnId="active"
	isEditing={false}
	isFocused={true}
	isSelected={false}
	cellValue={value}
/>
