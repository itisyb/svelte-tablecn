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
		readOnly = false,
		cellValue
	}: CellVariantProps<TData> = $props();

	// Use centralized cellValue prop - fine-grained reactivity is handled by DataGridCell
	const initialValue = $derived((cellValue as string) ?? '');
	let containerRef = $state<HTMLDivElement | null>(null);
	let popoverRef = $state<HTMLDivElement | null>(null);

	// Track local edits separately
	let localEditValue = $state<string | null>(null);

	// Value for display - use localEditValue if set, otherwise initialValue
	const value = $derived(localEditValue ?? initialValue ?? '');

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
		localEditValue = formattedDate;
		const meta = table.options.meta;
		meta?.onDataUpdate?.({ rowIndex, columnId, value: formattedDate });
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
			localEditValue = null;
			meta?.onCellEditingStop?.();
		} else if (!isEditing && isFocused && event.key === 'Tab') {
			event.preventDefault();
			meta?.onCellEditingStop?.({
				direction: event.shiftKey ? 'left' : 'right'
			});
		}
	}

	function handleOpenAutoFocus(e: Event) {
		e.preventDefault();
		// Focus the selected day, or today, or first day of month
		// Use setTimeout to ensure calendar is fully rendered
		setTimeout(() => {
			if (!popoverRef) return;
			// Target the Calendar.Day element with data-calendar-day attribute
			const target =
				popoverRef.querySelector<HTMLElement>('[data-calendar-day][data-selected]') ??
				popoverRef.querySelector<HTMLElement>('[data-calendar-day][data-today]') ??
				popoverRef.querySelector<HTMLElement>('[data-calendar-day]');
			target?.focus();
		}, 0);
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
			bind:ref={popoverRef}
			data-grid-cell-editor=""
			align="start"
			alignOffset={-8}
			class="w-auto p-0"
			customAnchor={containerRef}
			onOpenAutoFocus={handleOpenAutoFocus}
		>
			<Calendar
				type="single"
				value={selectedDate}
				placeholder={defaultMonth}
				onValueChange={handleDateSelect}
				captionLayout="dropdown"
				weekdayFormat="short"
				initialFocus
			/>
		</PopoverContent>
	</PopoverPrimitive.Root>
{/if}
