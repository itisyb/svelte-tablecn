<script lang="ts" generics="TData, TValue">
	import type { Column, Table } from '@tanstack/table-core';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Slider } from '$lib/components/ui/slider/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { Popover, PopoverContent, PopoverTrigger } from '$lib/components/ui/popover/index.js';
	import {
		formatRangeValue,
		getColumnRangeBounds,
		isValidRangeValue,
		parseRangeFilterValue,
		type RangeValue
	} from '$lib/data-table-range-utils.js';
	import { cn } from '$lib/utils.js';

	import PlusCircle from '@lucide/svelte/icons/plus-circle';
	import XCircle from '@lucide/svelte/icons/x-circle';

	interface Props {
		table?: Table<TData>;
		columnId?: string;
		column?: Column<TData, TValue>;
		title?: string;
	}

	let { table, columnId, column, title }: Props = $props();

	let open = $state(false);
	const inputId = $props.id();

	const resolvedColumnId = $derived(columnId ?? column?.id);
	const resolvedColumn = $derived(
		resolvedColumnId ? (table?.getColumn(resolvedColumnId) ?? column ?? undefined) : column
	);
	const meta = $derived(resolvedColumn?.columnDef.meta);
	const bounds = $derived(
		resolvedColumn
			? getColumnRangeBounds(resolvedColumn, meta?.range)
			: { min: meta?.range?.[0] ?? 0, max: meta?.range?.[1] ?? 100, step: 1 }
	);
	const unit = $derived(meta?.unit);

	const filterValue = $derived.by(() => {
		const id = resolvedColumnId;
		if (!id) return resolvedColumn?.getFilterValue();

		return table?.getState().columnFilters.find((filter) => filter.id === id)?.value ?? resolvedColumn?.getFilterValue();
	});

	const hasActiveFilter = $derived.by(() => {
		const parsed = parseRangeFilterValue(filterValue, [bounds.min, bounds.max]);
		return parsed[0] !== bounds.min || parsed[1] !== bounds.max;
	});

	let range = $derived(parseRangeFilterValue(filterValue, [bounds.min, bounds.max]));

	function commitRange(next: RangeValue) {
		range = next;
		const isDefault = next[0] === bounds.min && next[1] === bounds.max;
		resolvedColumn?.setFilterValue(isDefault ? undefined : next);
	}

	function onFromInputChange(event: Event) {
		const value = Number((event.currentTarget as HTMLInputElement).value);
		if (!Number.isNaN(value) && value >= bounds.min && value <= range[1]) {
			commitRange([value, range[1]]);
		}
	}

	function onToInputChange(event: Event) {
		const value = Number((event.currentTarget as HTMLInputElement).value);
		if (!Number.isNaN(value) && value <= bounds.max && value >= range[0]) {
			commitRange([range[0], value]);
		}
	}

	function onSliderChange(value: number[]) {
		if (isValidRangeValue(value)) {
			commitRange(value);
		}
	}

	function clearFilter(event?: MouseEvent) {
		event?.stopPropagation();
		resolvedColumn?.setFilterValue(undefined);
		range = [bounds.min, bounds.max];
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
				{#if hasActiveFilter}
					<!-- svelte-ignore a11y_click_events_have_key_events - mirrors upstream clear affordance inside the trigger button. -->
					<div
						role="button"
						aria-label={`Clear ${title ?? 'column'} filter`}
						tabindex={0}
						class="rounded-sm opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
						onclick={clearFilter}
					>
						<XCircle />
					</div>
				{:else}
					<PlusCircle class="size-4" />
				{/if}
				<span>{title}</span>
				{#if hasActiveFilter}
					<Separator orientation="vertical" class="mx-0.5 data-[orientation=vertical]:h-4" />
					{formatRangeValue(range[0])} - {formatRangeValue(range[1])}{unit ? ` ${unit}` : ''}
				{/if}
			</Button>
		{/snippet}
	</PopoverTrigger>
	<PopoverContent align="start" class="flex w-auto flex-col gap-4">
		<div class="flex flex-col gap-3">
			<p class="font-medium leading-none">{title}</p>
			<div class="flex items-center gap-4">
				<div class="relative">
					<Input
						id={`${inputId}-from`}
						type="number"
						aria-label={`${title ?? 'Column'} minimum`}
						aria-valuemin={bounds.min}
						aria-valuemax={bounds.max}
						inputmode="numeric"
						placeholder={String(bounds.min)}
						min={bounds.min}
						max={bounds.max}
						value={String(range[0])}
						oninput={onFromInputChange}
						class={cn('h-8 w-24', unit && 'pr-8')}
					/>
					{#if unit}
						<span
							class="pointer-events-none absolute inset-y-0 right-0 flex items-center rounded-r-md bg-accent px-2 text-muted-foreground text-sm"
						>
							{unit}
						</span>
					{/if}
				</div>
				<span class="text-muted-foreground text-sm">to</span>
				<div class="relative">
					<Input
						id={`${inputId}-to`}
						type="number"
						aria-label={`${title ?? 'Column'} maximum`}
						aria-valuemin={bounds.min}
						aria-valuemax={bounds.max}
						inputmode="numeric"
						placeholder={String(bounds.max)}
						min={bounds.min}
						max={bounds.max}
						value={String(range[1])}
						oninput={onToInputChange}
						class={cn('h-8 w-24', unit && 'pr-8')}
					/>
					{#if unit}
						<span
							class="pointer-events-none absolute inset-y-0 right-0 flex items-center rounded-r-md bg-accent px-2 text-muted-foreground text-sm"
						>
							{unit}
						</span>
					{/if}
				</div>
			</div>
			<Slider
				type="multiple"
				min={bounds.min}
				max={bounds.max}
				step={bounds.step}
				value={range}
				onValueChange={onSliderChange}
			/>
			<div class="flex items-center justify-between text-muted-foreground text-xs">
				<span>{formatRangeValue(bounds.min)}{unit ? ` ${unit}` : ''}</span>
				<span>{formatRangeValue(bounds.max)}{unit ? ` ${unit}` : ''}</span>
			</div>
		</div>
		<Button
			aria-label={`Clear ${title ?? 'column'} filter`}
			variant="outline"
			size="sm"
			onclick={() => clearFilter()}
		>
			Clear
		</Button>
	</PopoverContent>
</Popover>
