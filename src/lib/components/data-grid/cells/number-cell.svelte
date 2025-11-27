<script lang="ts" generics="TData">
	import type { CellVariantProps } from '$lib/types/data-grid.js';
	import DataGridCellWrapper from '../data-grid-cell-wrapper.svelte';

	let {
		cell,
		table,
		rowIndex,
		columnId,
		isEditing,
		isFocused,
		isSelected,
		readOnly = false,
		cellValue
	}: CellVariantProps<TData> = $props();

	// Use centralized cellValue prop - fine-grained reactivity is handled by DataGridCell
	const initialValue = $derived(cellValue as number | undefined);
	let inputRef = $state<HTMLInputElement | null>(null);
	const cellOpts = $derived(cell.column.columnDef.meta?.cell);
	const min = $derived(cellOpts?.variant === 'number' ? cellOpts.min : undefined);
	const max = $derived(cellOpts?.variant === 'number' ? cellOpts.max : undefined);
	const step = $derived(cellOpts?.variant === 'number' ? cellOpts.step : undefined);

	// Track local edits separately - this only matters during editing
	let localEditValue = $state<string | null>(null);
	
	// Display value directly from initialValue (no effect delay)
	const displayValue = $derived(String(initialValue ?? ''));
	
	// Value for editing - use localEditValue if set, otherwise displayValue
	const value = $derived(localEditValue ?? displayValue);

	// Reset local edit value when editing stops
	$effect(() => {
		if (!isEditing) {
			localEditValue = null;
		}
	});

	// Focus input when entering edit mode
	$effect(() => {
		if (isEditing && inputRef) {
			inputRef.focus();
			inputRef.select();
		}
	});

	function handleBlur() {
		const numValue = value === '' ? null : Number(value);
		const meta = table.options.meta;
		if (!readOnly && numValue !== initialValue) {
			meta?.onDataUpdate?.({ rowIndex, columnId, value: numValue });
		}
		meta?.onCellEditingStop?.();
	}

	function handleInput(event: Event) {
		const target = event.currentTarget as HTMLInputElement;
		localEditValue = target.value;
	}

	function handleWrapperKeyDown(event: KeyboardEvent) {
		const meta = table.options.meta;
		if (isEditing) {
			if (event.key === 'Enter') {
				event.preventDefault();
				const numValue = value === '' ? null : Number(value);
				if (numValue !== initialValue) {
					meta?.onDataUpdate?.({ rowIndex, columnId, value: numValue });
				}
				meta?.onCellEditingStop?.({ moveToNextRow: true });
			} else if (event.key === 'Tab') {
				event.preventDefault();
				const numValue = value === '' ? null : Number(value);
				if (numValue !== initialValue) {
					meta?.onDataUpdate?.({ rowIndex, columnId, value: numValue });
				}
				meta?.onCellEditingStop?.({
					direction: event.shiftKey ? 'left' : 'right'
				});
			} else if (event.key === 'Escape') {
				event.preventDefault();
				localEditValue = null;
				inputRef?.blur();
			}
		} else if (isFocused) {
			// Handle Backspace to start editing with empty value
			if (event.key === 'Backspace') {
				localEditValue = '';
			} else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey) {
				// Handle typing to pre-fill the value when editing starts
				localEditValue = event.key;
			}
		}
	}
</script>

<DataGridCellWrapper
	{cell}
	{table}
	{rowIndex}
	{columnId}
	{isEditing}
	{isFocused}
	{isSelected}
	onkeydown={handleWrapperKeyDown}
>
	{#if isEditing}
		<input
			bind:this={inputRef}
			type="number"
			{value}
			{min}
			{max}
			{step}
			onblur={handleBlur}
			oninput={handleInput}
			class="w-full border-none bg-transparent p-0 outline-none"
		/>
	{:else}
		<span data-slot="grid-cell-content">{displayValue}</span>
	{/if}
</DataGridCellWrapper>
