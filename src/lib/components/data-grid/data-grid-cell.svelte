<script lang="ts" generics="TData">
	import type { Cell, Table } from '@tanstack/table-core';
	import type { SvelteSet } from 'svelte/reactivity';
	import { getCellKey, getCellValueKey } from '$lib/types/data-grid.js';

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
		/** SvelteSet for fine-grained selection reactivity */
		selectedCellsSet?: SvelteSet<string>;
		/** Version counter that triggers re-computation when selection changes */
		selectionVersion?: number;
	}

	let { cell, table, selectedCellsSet, selectionVersion = 0 }: Props = $props();

	const rowIndex = $derived(cell.row.index);
	const columnId = $derived(cell.column.id);
	const rowId = $derived(cell.row.id);

	// CENTRALIZED: Fine-grained cell value using SvelteMap
	const cellValue = $derived.by(() => {
		const meta = table.options.meta;
		const map = meta?.cellValueMap;
		const valueKey = getCellValueKey(rowId, columnId);

		if (map && map.has(valueKey)) {
			return map.get(valueKey);
		}

		const original = cell.row.original as Record<string, unknown>;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const accessorKey = (cell.column.columnDef as any).accessorKey as string | undefined;

		if (accessorKey && original) {
			return original[accessorKey];
		}

		return cell.getValue();
	});

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
	const isSelected = $derived.by(() => {
		if (!selectedCellsSet) return false;
		const key = getCellKey(rowIndex, columnId);
		return selectedCellsSet.has(key);
	});

	const readOnly = $derived.by(() => {
		const meta = table.options.meta;
		return meta?.readOnly ?? false;
	});

	const cellOpts = $derived(cell.column.columnDef.meta?.cell);
	const variant = $derived(cellOpts?.variant ?? 'short-text');
	const rowSelectOptions = $derived.by(() => {
		if (cellOpts?.variant !== 'row-select') return null;
		return cellOpts;
	});
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
	<CheckboxCell
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
	<RowSelectCell
		row={cell.row}
		{table}
		{rowIndex}
		enableRowMarkers={rowSelectOptions?.enableRowMarkers}
		readOnly={rowSelectOptions?.readOnly}
		hitboxSize={rowSelectOptions?.hitboxSize}
		debug={rowSelectOptions?.debug}
	/>
{:else}
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
