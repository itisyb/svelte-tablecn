<script lang="ts" generics="TData">
	import type { Row, Table, ColumnPinningState, VisibilityState, ColumnSizingState } from '@tanstack/table-core';
	import type { SvelteSet } from 'svelte/reactivity';
	import type { CellPosition, RowHeightValue, Direction } from '$lib/types/data-grid.js';
	import { getRowHeightValue } from '$lib/types/data-grid.js';
	import { getColumnBorderVisibility, getColumnPinningStyle, toPinningStyleString } from '$lib/data-grid.js';
	import { cn } from '$lib/utils.js';
	import DataGridCell from './data-grid-cell.svelte';

	// Use 'any' for VirtualizerReturn to avoid type conflicts between different definitions
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	type VirtualizerReturn = any;

	interface Props {
		row: Row<TData>;
		table: Table<TData>;
		columnPinning: ColumnPinningState;
		columnVisibility: VisibilityState;
		columnSizing: ColumnSizingState;
		/** SvelteSet for fine-grained selection reactivity */
		selectedCellsSet: SvelteSet<string> | undefined;
		/** Version counter that increments when selection changes - triggers re-render */
		selectionVersion: number;
		rowVirtualizer: VirtualizerReturn;
		virtualRowIndex: number;
		virtualStart: number;
		rowMapRef: Map<number, HTMLDivElement>;
		rowHeight: RowHeightValue;
		focusedCell: CellPosition | null;
		dir: Direction;
		stretchColumns: boolean;
		class?: string;
	}

	let {
		row,
		table,
		columnPinning,
		columnVisibility,
		columnSizing,
		selectedCellsSet,
		selectionVersion,
		virtualRowIndex,
		virtualStart,
		rowVirtualizer,
		rowMapRef,
		rowHeight,
		focusedCell,
		dir,
		stretchColumns,
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

	// Row selection is reactive via table state
	const isRowSelected = $derived(row.getIsSelected());

	// Get visible cells in correct order (left pinned -> center -> right pinned)
	const visibleCells = $derived.by(() => {
		const _pinning = columnPinning;
		const _visibility = columnVisibility;

		const isColumnVisible = (colId: string) => columnVisibility[colId] !== false;

		const leftCols = table.getLeftLeafColumns().filter((c) => isColumnVisible(c.id));
		const centerCols = table.getCenterLeafColumns().filter((c) => isColumnVisible(c.id));
		const rightCols = table.getRightLeafColumns().filter((c) => isColumnVisible(c.id));

		const orderedColumnIds = [
			...leftCols.map((c) => c.id),
			...centerCols.map((c) => c.id),
			...rightCols.map((c) => c.id)
		];

		const allCells = row.getAllCells();
		const cellMap = new Map(allCells.map((cell) => [cell.column.id, cell]));

		return orderedColumnIds
			.map((id) => cellMap.get(id))
			.filter((cell): cell is NonNullable<typeof cell> => cell != null);
	});

	const totalVisibleWidth = $derived.by(() => {
		const _ = columnSizing;
		let total = 0;
		for (const cell of visibleCells) {
			total += cell.column.getSize();
		}
		return total;
	});
</script>

<div
	role="row"
	aria-rowindex={virtualRowIndex + 2}
	aria-selected={isRowSelected}
	data-index={virtualRowIndex}
	data-slot="grid-row"
	bind:this={rowRef}
	tabindex={-1}
	class={cn('absolute left-0 top-0 flex w-full border-b will-change-transform', className)}
	style="transform: translateY({virtualStart}px); height: {getRowHeightValue(rowHeight)}px; width: {totalVisibleWidth}px; min-width: {totalVisibleWidth}px;"
>
	{#each visibleCells as cell, colIndex (cell.id)}
		{@const isCellFocused =
			focusedCell?.rowIndex === virtualRowIndex && focusedCell?.columnId === cell.column.id}
		{@const nextCell = visibleCells[colIndex + 1]}
		{@const isLastColumn = colIndex === visibleCells.length - 1}
		{@const borderVisibility = getColumnBorderVisibility({
			column: cell.column,
			nextColumn: nextCell?.column,
			isLastColumn
		})}
		{@const pinningStyle = toPinningStyleString(getColumnPinningStyle({ column: cell.column, dir }))}

		<div
			role="gridcell"
			aria-colindex={colIndex + 1}
			data-highlighted={isCellFocused ? '' : undefined}
			data-slot="grid-cell"
			tabindex={-1}
			class={cn({
				grow: stretchColumns && cell.column.id !== 'select',
				'border-e': borderVisibility.showEndBorder && cell.column.id !== 'select',
				'border-s': borderVisibility.showStartBorder && cell.column.id !== 'select'
			})}
			style="{pinningStyle}; width: calc(var(--col-{cell.column.id}-size) * 1px);"
		>
			<DataGridCell {cell} {table} {selectedCellsSet} {selectionVersion} />
		</div>
	{/each}
</div>
