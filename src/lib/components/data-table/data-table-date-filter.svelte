<script lang="ts" generics="TData, TValue">
	import type { Column, Table } from '@tanstack/table-core';
	import type { DateValue } from '@internationalized/date';
	import { CalendarDate, parseDate } from '@internationalized/date';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Calendar as CalendarPicker } from '$lib/components/ui/calendar/index.js';
	import { Popover, PopoverContent, PopoverTrigger } from '$lib/components/ui/popover/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { formatDate } from '$lib/format.js';
	import DataGridRangeCalendar from '$lib/components/data-grid/data-grid-range-calendar.svelte';

	import Calendar from '@lucide/svelte/icons/calendar';
	import XCircle from '@lucide/svelte/icons/x-circle';

	interface Props {
		table?: Table<TData>;
		columnId?: string;
		column?: Column<TData, TValue>;
		title?: string;
		multiple?: boolean;
	}

	let { table, columnId, column, title, multiple = false }: Props = $props();

	let open = $state(false);
	const resolvedColumnId = $derived(columnId ?? column?.id);
	const resolvedColumn = $derived(
		resolvedColumnId ? (table?.getColumn(resolvedColumnId) ?? column ?? undefined) : column
	);
	const filterValue = $derived.by(() => {
		const id = resolvedColumnId;
		if (!id) return resolvedColumn?.getFilterValue();

		return table?.getState().columnFilters.find((filter) => filter.id === id)?.value ?? resolvedColumn?.getFilterValue();
	});
	const values = $derived(parseColumnFilterValue(filterValue));
	const displayValue = $derived(
		values
			.map((value) => formatDate(value))
			.filter(Boolean)
			.join(' - ')
	);
	const hasValue = $derived(values.length > 0 && displayValue.length > 0);

	function parseColumnFilterValue(value: unknown) {
		if (value === null || value === undefined) {
			return [];
		}

		if (Array.isArray(value)) {
			return value.map((item) => (typeof item === 'number' || typeof item === 'string' ? item : undefined));
		}

		if (typeof value === 'string' || typeof value === 'number') {
			return [value];
		}

		return [];
	}

	function calendarDateToTimestamp(value: DateValue) {
		return new Date(value.year, value.month - 1, value.day).getTime();
	}

	function toCalendarDate(value: string | number | undefined): DateValue | undefined {
		if (value === undefined || value === '') return undefined;

		try {
			if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
				return parseDate(value.split('T')[0]);
			}

			const timestamp = typeof value === 'string' ? Number(value) : value;
			const date = new Date(Number.isNaN(timestamp) ? value : timestamp);
			if (Number.isNaN(date.getTime())) return undefined;

			return new CalendarDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
		} catch {
			return undefined;
		}
	}

	function onSingleDateChange(value: DateValue | undefined) {
		updateSingle(value ? calendarDateToTimestamp(value) : undefined);
	}

	function onRangeCalendarChange(range: { start?: DateValue; end?: DateValue }) {
		const nextValue = [range.start, range.end].map((value) =>
			value ? calendarDateToTimestamp(value) : undefined
		);
		resolvedColumn?.setFilterValue(nextValue.some((item) => item !== undefined) ? nextValue : undefined);
	}

	function updateSingle(value: number | undefined) {
		resolvedColumn?.setFilterValue(value);
	}

	function onReset(event: MouseEvent) {
		event.stopPropagation();
		resolvedColumn?.setFilterValue(undefined);
	}
</script>

<Popover bind:open>
	<PopoverTrigger>
		{#snippet child({ props })}
			<Button
				{...props}
				aria-label={`Filter ${title ?? 'column'}`}
				variant="outline"
				size="sm"
				class="border-dashed font-normal"
			>
				{#if hasValue}
					<!-- svelte-ignore a11y_click_events_have_key_events - mirrors upstream clear affordance inside the trigger button. -->
					<div
						role="button"
						aria-label={`Clear ${title ?? 'column'} filter`}
						tabindex={0}
						class="rounded-sm opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
						onclick={onReset}
					>
						<XCircle />
					</div>
				{:else}
					<Calendar />
				{/if}
				{title}
				{#if hasValue}
					<Separator orientation="vertical" class="mx-0.5 data-[orientation=vertical]:h-4" />
					<span class="max-w-40 truncate">
						{displayValue}
					</span>
				{/if}
			</Button>
		{/snippet}
	</PopoverTrigger>
	<PopoverContent align="start" class="w-auto p-0">
		{#if multiple}
			<DataGridRangeCalendar
				value={{ start: toCalendarDate(values[0]), end: toCalendarDate(values[1]) }}
				onValueChange={onRangeCalendarChange}
				captionLayout="dropdown"
				initialFocus
			/>
		{:else}
			<CalendarPicker
				type="single"
				captionLayout="dropdown"
				value={toCalendarDate(values[0])}
				onValueChange={(value: DateValue | undefined) => onSingleDateChange(value)}
			/>
		{/if}
	</PopoverContent>
</Popover>
