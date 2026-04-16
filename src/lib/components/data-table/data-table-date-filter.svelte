<script lang="ts" generics="TData, TValue">
	import type { Column, Table } from '@tanstack/table-core';
	import type { DateValue } from '@internationalized/date';
	import { parseDate } from '@internationalized/date';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Calendar as CalendarPicker } from '$lib/components/ui/calendar/index.js';
	import { Popover, PopoverContent, PopoverTrigger } from '$lib/components/ui/popover/index.js';
	import { formatDate } from '$lib/format.js';

	import Calendar from '@lucide/svelte/icons/calendar';
	import X from '@lucide/svelte/icons/x';

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
			.map((value) =>
				typeof value === 'string' ? formatDate(value, { month: 'short', day: 'numeric' }) : ''
			)
			.filter(Boolean)
			.join(' to ')
	);

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

	function clearFilter() {
		resolvedColumn?.setFilterValue(undefined);
		open = false;
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
				<Calendar />
				{title}
				{#if values.length > 0}
					<span class="max-w-40 truncate text-muted-foreground text-xs">
						{displayValue}
					</span>
				{/if}
			</Button>
		{/snippet}
	</PopoverTrigger>
	<PopoverContent align="start" class="w-72 space-y-3">
		{#if multiple}
			<div class="grid gap-2 sm:grid-cols-2">
				<div class="space-y-1">
					<span class="text-xs text-muted-foreground">From</span>
					<CalendarPicker
						type="single"
						value={toCalendarDate(typeof values[0] === 'string' ? values[0] : undefined)}
						onValueChange={(value: DateValue | undefined) => onRangeDateChange(0, value)}
					/>
				</div>
				<div class="space-y-1">
					<span class="text-xs text-muted-foreground">To</span>
					<CalendarPicker
						type="single"
						value={toCalendarDate(typeof values[1] === 'string' ? values[1] : undefined)}
						onValueChange={(value: DateValue | undefined) => onRangeDateChange(1, value)}
					/>
				</div>
			</div>
		{:else}
			<div class="space-y-1">
				<span class="text-xs text-muted-foreground">Date</span>
				<CalendarPicker
					type="single"
					value={toCalendarDate(typeof values[0] === 'string' ? values[0] : undefined)}
					onValueChange={(value: DateValue | undefined) => onSingleDateChange(value)}
				/>
			</div>
		{/if}
		<div class="flex justify-end">
			<Button variant="ghost" size="sm" class="h-8" onclick={clearFilter}>
				<X />
				Clear
			</Button>
		</div>
	</PopoverContent>
</Popover>
