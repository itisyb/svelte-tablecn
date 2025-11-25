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
	const meta = $derived(table.options.meta);

	// Initialize and sync value
	$effect(() => {
		const iv = Boolean(initialValue);
		if (iv !== value) {
			value = iv;
		}
	});

	function handleCheckedChange(checked: boolean) {
		if (readOnly) return;
		value = checked;
		meta?.onDataUpdate?.({ rowIndex, columnId, value: checked });
	}

	function handleCheckboxChange(event: Event) {
		const target = event.target as HTMLInputElement;
		handleCheckedChange(target.checked);
	}

	function handleWrapperKeyDown(event: KeyboardEvent) {
		if (isFocused && !readOnly && (event.key === ' ' || event.key === 'Enter')) {
			event.preventDefault();
			event.stopPropagation();
			handleCheckedChange(!value);
		} else if (isFocused && event.key === 'Tab') {
			event.preventDefault();
			meta?.onCellEditingStop?.({
				direction: event.shiftKey ? 'left' : 'right'
			});
		}
	}

	function handleWrapperClick(event: MouseEvent) {
		if (isFocused && !readOnly) {
			event.preventDefault();
			event.stopPropagation();
			handleCheckedChange(!value);
		}
	}

	function handleCheckboxClick(event: MouseEvent) {
		event.stopPropagation();
	}

	function handleCheckboxMouseDown(event: MouseEvent) {
		event.stopPropagation();
	}

	function handleCheckboxDoubleClick(event: MouseEvent) {
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
	onclick={handleWrapperClick}
	onkeydown={handleWrapperKeyDown}
>
	<Checkbox
		bind:checked={value}
		disabled={readOnly}
		class="border-primary"
		onclick={handleCheckboxClick}
		onmousedown={handleCheckboxMouseDown}
		ondblclick={handleCheckboxDoubleClick}
		onchange={handleCheckboxChange}
	/>
</DataGridCellWrapper>
