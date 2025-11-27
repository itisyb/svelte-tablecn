<script lang="ts">
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	import type { Table } from '@tanstack/table-core';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';

	interface Props {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		table: Table<any>;
	}

	let { table }: Props = $props();

	const isAllSelected = $derived(table.getIsAllPageRowsSelected());
	const isSomeSelected = $derived(table.getIsSomePageRowsSelected());

	function handleClick() {
		// Toggle: if all selected -> deselect all, otherwise select all
		table.toggleAllPageRowsSelected(!isAllSelected);
	}
</script>

<div class="flex size-full items-center justify-center px-3 py-1.5">
	<Checkbox
		aria-label="Select all"
		class="after:-inset-2.5 relative transition-[shadow,border] after:absolute after:content-[''] hover:border-primary/40"
		checked={isAllSelected}
		indeterminate={!isAllSelected && isSomeSelected}
		onclick={handleClick}
	/>
</div>
