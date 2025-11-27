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
		readOnly = false,
		cellValue
	}: CellVariantProps<TData> = $props();

	// Use centralized cellValue prop - fine-grained reactivity is handled by DataGridCell
	const initialValue = $derived((cellValue as string) ?? '');
	const cellOpts = $derived(cell.column.columnDef.meta?.cell);
	const options = $derived(cellOpts?.variant === 'select' ? cellOpts.options : []);

	// Track local edits separately
	let localEditValue = $state<string | null>(null);
	
	// Value for display - use localEditValue if set, otherwise initialValue
	const value = $derived(localEditValue ?? initialValue ?? '');

	// Reset local edit value when editing stops
	$effect(() => {
		if (!isEditing) {
			localEditValue = null;
		}
	});

	function handleValueChange(newValue: string | undefined) {
		if (readOnly || !newValue) return;
		localEditValue = newValue;
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
			localEditValue = null;
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
