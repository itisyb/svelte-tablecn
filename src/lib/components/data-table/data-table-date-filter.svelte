<script lang="ts" generics="TData, TValue">
	import type { Column, Table } from '@tanstack/table-core';
	import type { DateValue } from '@internationalized/date';
	import { parseDate } from '@internationalized/date';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Calendar as CalendarPicker } from '$lib/components/ui/calendar/index.js';
	import { Popover, PopoverContent, PopoverTrigger } from '$lib/components/ui/popover/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { formatDate } from '$lib/format.js';

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
		if (!id) return undefined;

		return table?.getState().columnFilters.find((filter) => filter.id === id)?.value;
	});
	const values = $derived(Array.isArray(filterValue) ? filterValue : [filterValue].filter(Boolean));
	const displayValue = $derived(
		values
			.map((value) => (typeof value === 'string' ? formatDate(value) : ''))
			.filter(Boolean)
			.join(' - ')
	);
	const hasValue = $derived(values.length > 0 && displayValue.length > 0);

	function toCalendarDate(value: string | undefined): DateValue | undefined {
		if (!value) return undefined;

		try {
			return parseDate(value);
		} catch {
			return undefined;
		}
	}

	function onSingleDateChange(value: DateValue | undefined) {
		updateSingle(value ? value.toString() : '');
	}

	function onRangeDateChange(index: number, value: DateValue | undefined) {
		updateRange(index, value ? value.toString() : '');
	}

	function updateSingle(value: string) {
		resolvedColumn?.setFilterValue(value || undefined);
	}

	function updateRange(index: number, value: string) {
		const nextValue = [...values];
		nextValue[index] = value;
		const cleaned = nextValue.filter((item) => typeof item === 'string' && item.trim().length > 0);
		resolvedColumn?.setFilterValue(cleaned.length > 0 ? cleaned : undefined);
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
			<div class="grid sm:grid-cols-2">
				<div>
					<CalendarPicker
						type="single"
						value={toCalendarDate(typeof values[0] === 'string' ? values[0] : undefined)}
						onValueChange={(value: DateValue | undefined) => onRangeDateChange(0, value)}
					/>
				</div>
				<div>
					<CalendarPicker
						type="single"
						value={toCalendarDate(typeof values[1] === 'string' ? values[1] : undefined)}
						onValueChange={(value: DateValue | undefined) => onRangeDateChange(1, value)}
					/>
				</div>
			</div>
		{:else}
			<CalendarPicker
				type="single"
				value={toCalendarDate(typeof values[0] === 'string' ? values[0] : undefined)}
				onValueChange={(value: DateValue | undefined) => onSingleDateChange(value)}
			/>
		{/if}
	</PopoverContent>
</Popover>
