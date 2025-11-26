<script lang="ts" generics="TData">
	import type { Cell, Table } from '@tanstack/table-core';
	import DataGridCellWrapper from '../data-grid-cell-wrapper.svelte';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';

	interface Props {
		cell: Cell<TData, unknown>;
		table: Table<TData>;
		rowIndex: number;
		columnId: string;
		isFocused: boolean;
		isSelected: boolean;
		readOnly?: boolean;
	}

	let {
		cell,
		table,
		rowIndex,
		columnId,
		isFocused,
		isSelected,
		readOnly = false
	}: Props = $props();

	const initialValue = $derived(cell.getValue() as boolean);
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

	function handleCheckboxClick(event: MouseEvent) {
		event.stopPropagation();
		if (!readOnly) {
			handleCheckedChange(!value);
		}
	}

	function handleCheckboxMouseDown(event: MouseEvent) {
		event.stopPropagation();
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
>
	<Checkbox
		checked={value}
		disabled={readOnly}
		class="border-primary"
		onclick={handleCheckboxClick}
		onmousedown={handleCheckboxMouseDown}
	/>
</DataGridCellWrapper>
