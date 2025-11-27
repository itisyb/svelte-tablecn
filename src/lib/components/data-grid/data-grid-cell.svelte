<script lang="ts" generics="TData">
	import type { Cell, Table } from '@tanstack/table-core';
	import { getCellKey } from '$lib/types/data-grid.js';

	// Cell variant imports
	import ShortTextCell from './cells/short-text-cell.svelte';
	import NumberCell from './cells/number-cell.svelte';
	import CheckboxCell from './cells/checkbox-cell.svelte';
	import LongTextCell from './cells/long-text-cell.svelte';
	import SelectCell from './cells/select-cell.svelte';
	import MultiSelectCell from './cells/multi-select-cell.svelte';
	import DateCell from './cells/date-cell.svelte';
	import UrlCell from './cells/url-cell.svelte';
	import FileCell from './cells/file-cell.svelte';
	import RowSelectCell from './cells/row-select-cell.svelte';

	interface Props {
		cell: Cell<TData, unknown>;
		table: Table<TData>;
	}

	let { cell, table }: Props = $props();

	// Access meta directly each time - don't cache the reference
	const originalRowIndex = $derived(cell.row.index);

	// Get the display row index (for filtered/sorted tables)
	const displayRowIndex = $derived.by(() => {
		const rows = table.getRowModel().rows;
		const idx = rows.findIndex((row) => row.original === cell.row.original);
		return idx >= 0 ? idx : originalRowIndex;
	});

	const rowIndex = $derived(displayRowIndex);
	const columnId = $derived(cell.column.id);

	// CENTRALIZED: Fine-grained cell value using SvelteMap
	// This is computed ONCE here and passed to all cell variants
	// Only re-renders when THIS specific cell's value changes in the SvelteMap
	const cellValue = $derived.by(() => {
		const meta = table.options.meta;
		const val = meta?.getCellValue?.(rowIndex, columnId);
		if (val !== undefined) return val;
		// Fallback to cell.getValue() for initial render or if SvelteMap not available
		return cell.getValue();
	});

	// Derive cell state from table meta - access meta fresh each time via getter
	const isFocused = $derived.by(() => {
		const meta = table.options.meta;
		const fc = meta?.focusedCell;
		return fc?.rowIndex === rowIndex && fc?.columnId === columnId;
	});
	const isEditing = $derived.by(() => {
		const meta = table.options.meta;
		const ec = meta?.editingCell;
		return ec?.rowIndex === rowIndex && ec?.columnId === columnId;
	});
	// Access selectionState directly to create proper reactive dependency
	const isSelected = $derived.by(() => {
		const meta = table.options.meta;
		const selectedCells = meta?.selectionState?.selectedCells;
		if (!selectedCells) return false;
		return selectedCells.has(getCellKey(rowIndex, columnId));
	});
	const readOnly = $derived.by(() => {
		const meta = table.options.meta;
		return meta?.readOnly ?? false;
	});

	// Get cell variant from column def
	const cellOpts = $derived(cell.column.columnDef.meta?.cell);
	const variant = $derived(cellOpts?.variant ?? 'short-text');
</script>

{#if variant === 'short-text'}
	<ShortTextCell
		{cell}
		{table}
		{rowIndex}
		{columnId}
		{isEditing}
		{isFocused}
		{isSelected}
		{readOnly}
		{cellValue}
	/>
{:else if variant === 'number'}
	<NumberCell
		{cell}
		{table}
		{rowIndex}
		{columnId}
		{isEditing}
		{isFocused}
		{isSelected}
		{readOnly}
		{cellValue}
	/>
{:else if variant === 'checkbox'}
	<CheckboxCell {cell} {table} {rowIndex} {columnId} {isEditing} {isFocused} {isSelected} {readOnly} {cellValue} />
{:else if variant === 'long-text'}
	<LongTextCell
		{cell}
		{table}
		{rowIndex}
		{columnId}
		{isEditing}
		{isFocused}
		{isSelected}
		{readOnly}
		{cellValue}
	/>
{:else if variant === 'select'}
	<SelectCell
		{cell}
		{table}
		{rowIndex}
		{columnId}
		{isEditing}
		{isFocused}
		{isSelected}
		{readOnly}
		{cellValue}
	/>
{:else if variant === 'multi-select'}
	<MultiSelectCell
		{cell}
		{table}
		{rowIndex}
		{columnId}
		{isEditing}
		{isFocused}
		{isSelected}
		{readOnly}
		{cellValue}
	/>
{:else if variant === 'date'}
	<DateCell
		{cell}
		{table}
		{rowIndex}
		{columnId}
		{isEditing}
		{isFocused}
		{isSelected}
		{readOnly}
		{cellValue}
	/>
{:else if variant === 'url'}
	<UrlCell
		{cell}
		{table}
		{rowIndex}
		{columnId}
		{isEditing}
		{isFocused}
		{isSelected}
		{readOnly}
		{cellValue}
	/>
{:else if variant === 'file'}
	<FileCell
		{cell}
		{table}
		{rowIndex}
		{columnId}
		{isEditing}
		{isFocused}
		{isSelected}
		{readOnly}
		{cellValue}
	/>
{:else if variant === 'row-select'}
	<RowSelectCell row={cell.row} {table} {rowIndex} />
{:else}
	<!-- Default to short-text -->
	<ShortTextCell
		{cell}
		{table}
		{rowIndex}
		{columnId}
		{isEditing}
		{isFocused}
		{isSelected}
		{readOnly}
		{cellValue}
	/>
{/if}
