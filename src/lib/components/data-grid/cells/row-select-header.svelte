<script lang="ts">
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	import type { Table, RowSelectionState } from '@tanstack/table-core';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';
	import type { DataGridSelectHitboxSize } from '$lib/types/data-grid.js';
	import { cn } from '$lib/utils.js';
	import { getContext } from 'svelte';

	interface Props {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		table: Table<any>;
		hitboxSize?: DataGridSelectHitboxSize;
		readOnly?: boolean;
		debug?: boolean;
	}

	let { table, hitboxSize = 'default', readOnly = false, debug = false }: Props = $props();

	function getHitboxSizeClass(size: DataGridSelectHitboxSize): string {
		switch (size) {
			case 'sm':
				return '-ms-3 -me-1.5 ps-3 pe-1.5';
			case 'lg':
				return '-mx-3 px-3';
			default:
				return '-ms-3 -me-2 ps-3 pe-2';
		}
	}

	const getRowSelection = getContext<() => RowSelectionState>('getRowSelection');

	// Track rowSelection so header state updates when selection changes.
	const rowSelection = $derived(getRowSelection?.() ?? {});

	const isAllSelected = $derived.by(() => {
		void rowSelection;
		return table.getIsAllPageRowsSelected();
	});

	const isSomeSelected = $derived.by(() => {
		void rowSelection;
		return table.getIsSomePageRowsSelected();
	});

	const hitboxClass = $derived(getHitboxSizeClass(hitboxSize));

	function handleSelectAllChange(checked: boolean | 'indeterminate') {
		// One handler only — overlay button was double-toggling (select all then immediately re-select).
		if (checked === true || checked === 'indeterminate') {
			table.toggleAllPageRowsSelected(true);
			return;
		}

		table.toggleAllPageRowsSelected(false);
	}
</script>

{#if readOnly}
	<div class="mt-1 flex items-center ps-1 text-muted-foreground text-sm">#</div>
{:else}
	<div
		class={cn(
			'group relative -my-1.5 h-[calc(100%+0.75rem)] py-1.5',
			hitboxClass,
			debug && 'outline outline-dashed outline-red-500/50'
		)}
	>
		<Checkbox
			aria-label="Select all"
			class="relative transition-[shadow,border] hover:border-primary/40"
			checked={isAllSelected}
			indeterminate={isSomeSelected}
			onCheckedChange={handleSelectAllChange}
		/>
	</div>
{/if}
