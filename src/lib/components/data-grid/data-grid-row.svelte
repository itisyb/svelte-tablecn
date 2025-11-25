<script lang="ts" generics="TData">
	import type { Row, Table } from '@tanstack/table-core';
	import type { CellPosition, RowHeightValue } from '$lib/types/data-grid.js';
	import { getRowHeightValue, getCommonPinningStyles } from '$lib/types/data-grid.js';
	import { cn } from '$lib/utils.js';
	import { FlexRender } from '$lib/table';
	import DataGridCell from './data-grid-cell.svelte';

	// Use 'any' for VirtualizerReturn to avoid type conflicts between different definitions
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	type VirtualizerReturn = any;

	interface Props {
		row: Row<TData>;
		rowVirtualizer: VirtualizerReturn;
		virtualRowIndex: number;
		virtualStart: number;
		rowMapRef: Map<number, HTMLDivElement>;
		rowHeight: RowHeightValue;
		focusedCell: CellPosition | null;
		class?: string;
	}

	let {
		row,
		virtualRowIndex,
		virtualStart,
		rowVirtualizer,
		rowMapRef,
		rowHeight,
		focusedCell,
		class: className
	}: Props = $props();

	let rowRef = $state<HTMLDivElement | null>(null);

	// Handle row ref changes - measure and track in rowMap
	$effect(() => {
		if (rowRef) {
			rowVirtualizer.measureElement(rowRef);
			rowMapRef.set(virtualRowIndex, rowRef);
		}

		return () => {
			rowMapRef.delete(virtualRowIndex);
		};
	});

	const isRowSelected = $derived(row.getIsSelected());
	const table = $derived(row._getAllCellsByColumnId());

	// Get the table from the row's context (via the row's parent table reference)
	// Note: In TanStack Table, rows have access to their parent table
	const rowTable = $derived(row.getAllCells()[0]?.getContext().table);
</script>

<div
	role="row"
	aria-rowindex={virtualRowIndex + 2}
	aria-selected={isRowSelected}
	data-index={virtualRowIndex}
	data-slot="grid-row"
	bind:this={rowRef}
	tabindex={-1}
	class={cn('absolute flex w-full border-b', className)}
	style="top: {virtualStart}px; height: {getRowHeightValue(rowHeight)}px;"
>
	{#each row.getVisibleCells() as cell, colIndex (cell.id)}
		{@const isCellFocused =
			focusedCell?.rowIndex === virtualRowIndex && focusedCell?.columnId === cell.column.id}
		{@const pinningStyles = getCommonPinningStyles({ column: cell.column })}

		<div
			role="gridcell"
			aria-colindex={colIndex + 1}
			data-highlighted={isCellFocused ? '' : undefined}
			data-slot="grid-cell"
			tabindex={-1}
			class={cn({
				'border-r': cell.column.id !== 'select'
			})}
			style="position: {pinningStyles.position}; left: {pinningStyles.left}; right: {pinningStyles.right}; background: {pinningStyles.background}; z-index: {pinningStyles.zIndex}; width: calc(var(--col-{cell.column.id}-size) * 1px);"
		>
			{#if typeof cell.column.columnDef.header === 'function' && rowTable}
				<div
					class={cn('size-full px-3 py-1.5', {
						'bg-primary/10': isRowSelected
					})}
				>
					<FlexRender content={cell.column.columnDef.cell} context={cell.getContext()} />
				</div>
			{:else if rowTable}
				<DataGridCell {cell} table={rowTable} />
			{/if}
		</div>
	{/each}
</div>
