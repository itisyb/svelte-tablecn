<script lang="ts" generics="TData">
	import type { CellVariantProps } from '$lib/types/data-grid.js';
	import DataGridCellWrapper from '../data-grid-cell-wrapper.svelte';
	import {
		Select,
		SelectContent,
		SelectItem,
		SelectTrigger
	} from '$lib/components/ui/select/index.js';

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

	const initialValue = $derived(cell.getValue() as string);
	let value = $state('');
	const cellOpts = $derived(cell.column.columnDef.meta?.cell);
	const options = $derived(cellOpts?.variant === 'select' ? cellOpts.options : []);

	// Initialize and sync value
	$effect(() => {
		const iv = initialValue;
		if (iv !== value && !isEditing) {
			value = iv;
		}
	});

	function handleValueChange(newValue: string | undefined) {
		if (readOnly || !newValue) return;
		value = newValue;
		const meta = table.options.meta;
		meta?.onDataUpdate?.({ rowIndex, columnId, value: newValue });
		meta?.onCellEditingStop?.();
	}

	function handleOpenChange(isOpen: boolean) {
		const meta = table.options.meta;
		if (isOpen && !readOnly) {
			meta?.onCellEditingStart?.(rowIndex, columnId);
		} else {
			meta?.onCellEditingStop?.();
		}
	}

	function handleWrapperKeyDown(event: KeyboardEvent) {
		const meta = table.options.meta;
		if (isEditing && event.key === 'Escape') {
			event.preventDefault();
			value = initialValue;
			meta?.onCellEditingStop?.();
		} else if (!isEditing && isFocused && event.key === 'Tab') {
			event.preventDefault();
			meta?.onCellEditingStop?.({
				direction: event.shiftKey ? 'left' : 'right'
			});
		}
	}

	const displayLabel = $derived(options.find((opt) => opt.value === value)?.label ?? value);
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
		<Select
			type="single"
			{value}
			onValueChange={handleValueChange}
			open={isEditing}
			onOpenChange={handleOpenChange}
		>
			<SelectTrigger
				class="size-full items-start border-none p-0 shadow-none focus-visible:ring-0 dark:bg-transparent [&_svg]:hidden"
			>
				{displayLabel}
			</SelectTrigger>
			<SelectContent
				data-grid-cell-editor=""
				align="start"
				alignOffset={-8}
				sideOffset={-8}
				class="min-w-[calc(var(--bits-select-trigger-width)+16px)]"
			>
				{#each options as option (option.value)}
					<SelectItem value={option.value}>
						{option.label}
					</SelectItem>
				{/each}
			</SelectContent>
		</Select>
	{:else}
		<span data-slot="grid-cell-content">{displayLabel}</span>
	{/if}
</DataGridCellWrapper>
