<script lang="ts" generics="TData">
	import type { CellVariantProps } from '$lib/types/data-grid.js';
	import DataGridCellWrapper from '../data-grid-cell-wrapper.svelte';
	import { Popover as PopoverPrimitive } from 'bits-ui';
	import { PopoverContent } from '$lib/components/ui/popover/index.js';
	import { Calendar } from '$lib/components/ui/calendar/index.js';
	import { type DateValue, parseDate, today, getLocalTimeZone } from '@internationalized/date';

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
	let containerRef = $state<HTMLDivElement | null>(null);
	const meta = $derived(table.options.meta);

	// Initialize and sync value
	$effect(() => {
		const iv = initialValue ?? '';
		if (iv !== value && !isEditing) {
			value = iv;
		}
	});

	// Parse value to DateValue for calendar
	const selectedDate = $derived.by((): DateValue | undefined => {
		if (!value) return undefined;
		try {
			return parseDate(value);
		} catch {
			return undefined;
		}
	});

	// Default month for calendar (selected date or today)
	const defaultMonth = $derived(selectedDate ?? today(getLocalTimeZone()));

	function formatDateForDisplay(dateStr: string): string {
		if (!dateStr) return '';
		try {
			const date = new Date(dateStr);
			return date.toLocaleDateString();
		} catch {
			return dateStr;
		}
	}

	function handleDateSelect(date: DateValue | undefined) {
		if (!date || readOnly) return;

		const formattedDate = `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`;
		value = formattedDate;
		meta?.onDataUpdate?.({ rowIndex, columnId, value: formattedDate });
		meta?.onCellEditingStop?.();
	}

	function handleOpenChange(isOpen: boolean) {
		if (isOpen && !readOnly) {
			meta?.onCellEditingStart?.(rowIndex, columnId);
		} else {
			meta?.onCellEditingStop?.();
		}
	}

	function handleWrapperKeyDown(event: KeyboardEvent) {
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
</script>

<DataGridCellWrapper
	bind:wrapperRef={containerRef}
	{cell}
	{table}
	{rowIndex}
	{columnId}
	{isEditing}
	{isFocused}
	{isSelected}
	onkeydown={handleWrapperKeyDown}
>
	<span data-slot="grid-cell-content">{formatDateForDisplay(value)}</span>
</DataGridCellWrapper>

{#if isEditing}
	<PopoverPrimitive.Root open={isEditing} onOpenChange={handleOpenChange}>
		<PopoverContent
			data-grid-cell-editor=""
			align="start"
			alignOffset={-8}
			class="w-auto p-0"
			customAnchor={containerRef}
		>
			<Calendar
				type="single"
				value={selectedDate}
				onValueChange={handleDateSelect}
				captionLayout="dropdown"
				weekdayFormat="short"
			/>
		</PopoverContent>
	</PopoverPrimitive.Root>
{/if}
