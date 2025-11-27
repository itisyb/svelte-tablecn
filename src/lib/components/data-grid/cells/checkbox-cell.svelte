<script lang="ts" generics="TData">
	import type { CellVariantProps } from '$lib/types/data-grid.js';
	import DataGridCellWrapper from '../data-grid-cell-wrapper.svelte';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';

	let {
		cell,
		table,
		rowIndex,
		columnId,
		isEditing: _isEditing,
		isFocused,
		isSelected,
		readOnly = false,
		cellValue
	}: CellVariantProps<TData> = $props();

	// Use centralized cellValue prop - fine-grained reactivity is handled by DataGridCell
	const initialValue = $derived(cellValue as boolean);
	let value = $state(false);

	// Initialize and sync value from cell data
	$effect(() => {
		const iv = Boolean(initialValue);
		value = iv;
	});

	function handleCheckedChange(newValue: boolean) {
		if (readOnly) return;
		value = newValue;
		table.options.meta?.onDataUpdate?.({ rowIndex, columnId, value: newValue });
	}

	function handleWrapperKeyDown(event: KeyboardEvent) {
		if (isFocused && !readOnly && (event.key === ' ' || event.key === 'Enter')) {
			event.preventDefault();
			event.stopPropagation();
			handleCheckedChange(!value);
		} else if (isFocused && event.key === 'Tab') {
			event.preventDefault();
			table.options.meta?.onCellEditingStop?.({
				direction: event.shiftKey ? 'left' : 'right'
			});
		}
	}

	// Handle wrapper click - focus cell and toggle checkbox
	function handleWrapperClick(event: MouseEvent) {
		event.preventDefault();
		event.stopPropagation();
		
		// Focus the cell if not already focused
		if (!isFocused) {
			table.options.meta?.onCellClick?.(rowIndex, columnId, event);
		}
		
		// Toggle checkbox on single click
		if (!readOnly) {
			handleCheckedChange(!value);
		}
	}
</script>

<DataGridCellWrapper
	{cell}
	{table}
	{rowIndex}
	{columnId}
	isEditing={false}
	{isFocused}
	{isSelected}
	class="flex size-full justify-center"
	onkeydown={handleWrapperKeyDown}
	onclick={handleWrapperClick}
>
	<Checkbox
		checked={value}
		disabled={readOnly}
		class="border-primary pointer-events-none"
	/>
</DataGridCellWrapper>
