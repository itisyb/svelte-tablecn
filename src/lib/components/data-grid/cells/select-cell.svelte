<script lang="ts" generics="TData">
	import type { CellVariantProps } from '$lib/types/data-grid.js';
	import DataGridCellWrapper from '../data-grid-cell-wrapper.svelte';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import {
		Select,
		SelectContent,
		SelectItem,
		SelectTrigger,
		SelectValue
	} from '$lib/components/ui/select/index.js';
	import { tick } from 'svelte';

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
	let previousInitialValue = $state<string | null>(null);

	$effect(() => {
		if (initialValue === previousInitialValue) return;

		previousInitialValue = initialValue;
		localEditValue = null;
	});

	// Value for display - use localEditValue if set, otherwise initialValue
	const value = $derived(localEditValue ?? initialValue ?? '');

	// Reference to the SelectTrigger for focus management
	let triggerRef = $state<HTMLButtonElement | null>(null);
	let wrapperRef = $state<HTMLDivElement | null>(null);

	// Focus the trigger when editing starts so typeahead works
	$effect(() => {
		if (isEditing && triggerRef) {
			tick().then(() => {
				triggerRef?.focus();
			});
		}
	});

	function handleValueChange(newValue: string | undefined) {
		if (readOnly || newValue === undefined) return;
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
			localEditValue = null;
			meta?.onCellEditingStop?.();
		}
	}

	function handleWrapperKeyDown(event: KeyboardEvent) {
		const meta = table.options.meta;
		if (isEditing && event.key === 'Escape') {
			event.preventDefault();
			event.stopPropagation();
			localEditValue = null;
			meta?.onCellEditingStop?.();
		} else if ((isFocused || isEditing) && event.key === 'Tab') {
			event.preventDefault();
			event.stopPropagation();
			meta?.onCellEditingStop?.({
				direction: event.shiftKey ? 'left' : 'right'
			});
		}
	}

	const displayLabel = $derived(options.find((opt) => opt.value === value)?.label ?? value);
</script>

<DataGridCellWrapper
	bind:wrapperRef
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
			items={options}
			onValueChange={handleValueChange}
			open={isEditing}
			onOpenChange={handleOpenChange}
		>
			<SelectTrigger
				size="sm"
				bind:ref={triggerRef}
				onkeydowncapture={handleWrapperKeyDown}
				class="size-full !w-full items-start border-none p-0 shadow-none focus-visible:ring-0 dark:bg-transparent [&_svg]:hidden"
				style="width: calc(100% - 1rem);"
			>
				{#if displayLabel}
					<Badge variant="secondary" class="whitespace-pre-wrap px-1.5 py-px">
						<SelectValue />
					</Badge>
				{:else}
					<SelectValue />
				{/if}
			</SelectTrigger>
			<SelectContent
				data-grid-cell-editor=""
				align="start"
				alignOffset={-8}
				sideOffset={-8}
				class="min-w-[calc(var(--bits-select-anchor-width)_+_16px)] rounded-sm"
				style="min-width: calc(var(--bits-select-anchor-width) + 16px);"
			>
				{#each options as option (option.value)}
					<SelectItem value={option.value} label={option.label}>
						{option.label}
					</SelectItem>
				{/each}
			</SelectContent>
		</Select>
	{:else if displayLabel}
		<Badge
			data-slot="grid-cell-content"
			variant="secondary"
			class="whitespace-pre-wrap px-1.5 py-px"
		>
			{displayLabel}
		</Badge>
	{/if}
</DataGridCellWrapper>
