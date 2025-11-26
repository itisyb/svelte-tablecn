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
		readOnly = false
	}: CellVariantProps<TData> = $props();

	const initialValue = $derived(cell.getValue() as number);
	let value = $state('');
	let inputRef = $state<HTMLInputElement | null>(null);
	const cellOpts = $derived(cell.column.columnDef.meta?.cell);
	const min = $derived(cellOpts?.variant === 'number' ? cellOpts.min : undefined);
	const max = $derived(cellOpts?.variant === 'number' ? cellOpts.max : undefined);
	const step = $derived(cellOpts?.variant === 'number' ? cellOpts.step : undefined);

	// Initialize and sync value
	$effect(() => {
		const iv = initialValue;
		const ivStr = String(iv ?? '');
		if (ivStr !== value && !isEditing) {
			value = ivStr;
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
		value = target.value;
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
				value = String(initialValue ?? '');
				inputRef?.blur();
			}
		} else if (isFocused) {
			// Handle Backspace to start editing with empty value
			if (event.key === 'Backspace') {
				value = '';
			} else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey) {
				// Handle typing to pre-fill the value when editing starts
				value = event.key;
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
		<span data-slot="grid-cell-content">{value}</span>
	{/if}
</DataGridCellWrapper>
