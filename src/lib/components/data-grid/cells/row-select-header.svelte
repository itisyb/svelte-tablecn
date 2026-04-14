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

	// Get reactive rowSelection from context (provided by DataGrid)
	const getRowSelection = getContext<() => RowSelectionState>('getRowSelection');

	// Use the getter to get reactive rowSelection
	const rowSelection = $derived(getRowSelection?.() ?? {});
	const rowCount = $derived(table.getRowModel().rows.length);

	// Count only rows that are actually selected (value is true)
	const selectedCount = $derived(Object.values(rowSelection).filter(Boolean).length);

	const isAllSelected = $derived(rowCount > 0 && selectedCount === rowCount);
	const isSomeSelected = $derived(selectedCount > 0 && selectedCount < rowCount);
	const hitboxClass = $derived(getHitboxSizeClass(hitboxSize));
</script>

{#if readOnly}
	<div class="mt-1 flex items-center ps-1 text-muted-foreground text-sm">#</div>
{:else}
	<div class={cn('flex size-full items-center justify-center px-3 py-1.5')}>
		<div class={cn('group relative -my-1.5 h-[calc(100%+0.75rem)] py-1.5', hitboxClass)}>
			<Checkbox
				aria-label="Select all"
				class="relative transition-[shadow,border] hover:border-primary/40"
				checked={isAllSelected}
				indeterminate={!isAllSelected && isSomeSelected}
				onCheckedChange={(checked) => table.toggleAllPageRowsSelected(!!checked)}
			/>
			<button
				type="button"
				aria-label="Select all rows"
				class={cn(
					'absolute inset-0 cursor-pointer',
					debug && 'border border-dashed border-red-500 bg-red-500/20'
				)}
				onclick={() => table.toggleAllPageRowsSelected(!isAllSelected)}
			></button>
		</div>
	</div>
{/if}
