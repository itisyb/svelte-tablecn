<script lang="ts" generics="TData">
	import type { Row, Table } from '@tanstack/table-core';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';
	import type { DataGridSelectHitboxSize } from '$lib/types/data-grid.js';
	import { cn } from '$lib/utils.js';

	interface Props {
		row: Row<TData>;
		table: Table<TData>;
		rowIndex: number;
		enableRowMarkers?: boolean;
		readOnly?: boolean;
		hitboxSize?: DataGridSelectHitboxSize;
		debug?: boolean;
	}

	let {
		row,
		table,
		rowIndex,
		enableRowMarkers = false,
		readOnly = false,
		hitboxSize = 'default',
		debug = false
	}: Props = $props();

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

	// Read rowSelection from table state to create reactive dependency
	// This ensures the component re-renders when selection changes
	const rowSelection = $derived(table.getState().rowSelection);
	const isSelected = $derived(rowSelection[row.id] ?? false);
	const meta = $derived(table.options.meta);
	const rowNumber = $derived(enableRowMarkers || readOnly ? rowIndex + 1 : undefined);
	const hitboxClass = $derived(getHitboxSizeClass(hitboxSize));

	function handleCheckedChange(checked: boolean | 'indeterminate') {
		const onRowSelect = meta?.onRowSelect;
		if (onRowSelect) {
			onRowSelect(rowIndex, !!checked, false);
		} else {
			row.toggleSelected(!!checked);
		}
	}

	function handleClick(event: MouseEvent) {
		if (event.shiftKey) {
			event.preventDefault();
			const onRowSelect = meta?.onRowSelect;
			if (onRowSelect) {
				onRowSelect(rowIndex, !isSelected, true);
			}
		}
	}

	function handleHitboxClick(event: MouseEvent) {
		if (event.shiftKey) {
			handleClick(event);
			return;
		}

		handleCheckedChange(!isSelected);
	}

	function handleMouseDown(event: MouseEvent) {
		event.stopPropagation();
	}
</script>

{#if readOnly}
	<div class="flex size-full items-center ps-1 text-muted-foreground text-xs tabular-nums">
		{rowNumber ?? rowIndex + 1}
	</div>
{:else}
	<div
		class={cn(
			'flex size-full items-center justify-center px-3 py-1.5',
			isSelected && 'bg-primary/10'
		)}
	>
		<div class={cn('group relative -my-1.5 h-[calc(100%+0.75rem)] py-1.5', hitboxClass)}>
			{#if rowNumber !== undefined}
				<div
					aria-hidden="true"
					class={cn(
						'pointer-events-none absolute start-3 top-1.5 flex size-4 items-center justify-center text-muted-foreground text-xs tabular-nums transition-opacity group-hover:opacity-0',
						isSelected && 'opacity-0'
					)}
				>
					{rowNumber}
				</div>
			{/if}

			<Checkbox
				aria-label={rowNumber ? `Select row ${rowNumber}` : 'Select row'}
				class={cn(
					'relative transition-[shadow,border,opacity] hover:border-primary/40',
					rowNumber !== undefined &&
						'opacity-0 group-hover:opacity-100 data-[state=checked]:opacity-100'
				)}
				checked={isSelected}
				onCheckedChange={handleCheckedChange}
				onclick={handleClick}
				onmousedown={handleMouseDown}
			/>

			<button
				type="button"
				aria-label={rowNumber ? `Select row ${rowNumber}` : 'Select row'}
				class={cn(
					'absolute inset-0 cursor-pointer',
					debug && 'border border-dashed border-red-500 bg-red-500/20'
				)}
				onclick={handleHitboxClick}
				onmousedown={handleMouseDown}
			></button>
		</div>
	</div>
{/if}
