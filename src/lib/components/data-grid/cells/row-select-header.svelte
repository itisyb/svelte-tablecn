<script lang="ts">
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	import type { Table, RowSelectionState } from '@tanstack/table-core';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';
	import { getContext } from 'svelte';

	interface Props {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		table: Table<any>;
	}

	let { table }: Props = $props();

	// Get reactive rowSelection from context (provided by DataGrid)
	const getRowSelection = getContext<() => RowSelectionState>('getRowSelection');

	// Use the getter to get reactive rowSelection
	const rowSelection = $derived(getRowSelection?.() ?? {});
	const rowCount = $derived(table.getRowModel().rows.length);

	// Count only rows that are actually selected (value is true)
	const selectedCount = $derived(Object.values(rowSelection).filter(Boolean).length);

	const isAllSelected = $derived(rowCount > 0 && selectedCount === rowCount);
	const isSomeSelected = $derived(selectedCount > 0 && selectedCount < rowCount);
</script>

<div class="flex size-full items-center justify-center px-3 py-1.5">
	<Checkbox
		aria-label="Select all"
		class="after:-inset-2.5 relative transition-[shadow,border] after:absolute after:content-[''] hover:border-primary/40"
		checked={isAllSelected}
		indeterminate={!isAllSelected && isSomeSelected}
		onCheckedChange={(checked) => table.toggleAllPageRowsSelected(!!checked)}
	/>
</div>
