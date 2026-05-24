<script lang="ts" generics="TData">
	import type {
		Row,
		Table,
		ColumnPinningState,
		VisibilityState,
		ColumnSizingState
	} from '@tanstack/table-core';
	import type { SvelteSet } from 'svelte/reactivity';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { CellPosition, RowHeightValue, Direction } from '$lib/types/data-grid.js';
	import { getRowHeightValue } from '$lib/types/data-grid.js';
	import {
		getColumnBorderVisibility,
		getColumnPinningStyle,
		toPinningStyleString
	} from '$lib/data-grid.js';
	import { cn, type WithElementRef } from '$lib/utils.js';
	import { FlexRender } from '$lib/table';
	import DataGridCell from './data-grid-cell.svelte';

	// Use 'any' for VirtualizerReturn to avoid type conflicts between different definitions
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	type VirtualizerReturn = any;

	interface Props extends WithElementRef<Omit<HTMLAttributes<HTMLDivElement>, 'dir'>, HTMLDivElement> {
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
		adjustLayout: boolean;
		stretchColumns: boolean;
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
		adjustLayout,
		stretchColumns,
		class: className,
		style: styleProp,
		ref = $bindable(null),
		...restProps
	}: Props = $props();

	let rowRef = $state<HTMLDivElement | null>(null);

	function getRowElement() {
		return rowRef;
	}

	function setRowElement(element: HTMLDivElement | null) {
		rowRef = element;
		ref = element;
	}

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
	const rowStyle = $derived.by(() => {
		const internalStyle = adjustLayout
			? `top: ${virtualStart}px; height: ${getRowHeightValue(rowHeight)}px; content-visibility: auto;`
			: `transform: translateY(${virtualStart}px); height: ${getRowHeightValue(rowHeight)}px; content-visibility: auto;`;

		return styleProp ? `${internalStyle} ${styleProp}` : internalStyle;
	});

	// Same column order as header (getVisibleLeafColumns), not row.getVisibleCells() alone.
	const visibleCells = $derived.by(() => {
		const _pinning = columnPinning;
		const _visibility = columnVisibility;
		const isVisible = (id: string) => columnVisibility[id] !== false;
		const cellsById = new Map(row.getVisibleCells().map((c) => [c.column.id, c]));
		return table
			.getVisibleLeafColumns()
			.filter((col) => isVisible(col.id))
			.map((col) => cellsById.get(col.id))
			.filter((cell): cell is NonNullable<typeof cell> => cell != null);
	});
</script>

<div
	role="row"
	aria-rowindex={virtualRowIndex + 2}
	aria-selected={isRowSelected}
	data-index={virtualRowIndex}
	data-slot="grid-row"
	tabindex={-1}
	{...restProps}
	bind:this={getRowElement, setRowElement}
	{dir}
	class={cn('absolute flex w-full border-b', !adjustLayout && 'will-change-transform', className)}
	style={rowStyle}
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
		{@const pinningStyle = toPinningStyleString(
			getColumnPinningStyle({ column: cell.column, dir })
		)}
		{@const customCell = cell.column.columnDef.cell}
		{@const hasGridCellVariant = cell.column.columnDef.meta?.cell != null}

		<div
			role="gridcell"
			aria-colindex={colIndex + 1}
			data-highlighted={isCellFocused ? '' : undefined}
			data-slot="grid-cell"
			{dir}
			tabindex={-1}
			class={cn('shrink-0', {
				grow: stretchColumns && cell.column.id !== 'select',
				'border-e': borderVisibility.showEndBorder && cell.column.id !== 'select',
				'border-s': borderVisibility.showStartBorder && cell.column.id !== 'select'
			})}
			style="{pinningStyle}; width: calc(var(--col-{cell.column.id}-size) * 1px);"
		>
			{#if customCell && !hasGridCellVariant}
				<div class={cn('size-full px-3 py-1.5', isRowSelected && 'bg-primary/10')}>
					<FlexRender content={customCell} context={cell.getContext()} />
				</div>
			{:else}
				<DataGridCell {cell} {table} {selectedCellsSet} {selectionVersion} />
			{/if}
		</div>
	{/each}
</div>
