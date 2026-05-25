<script lang="ts" generics="TData">
	import type { Column } from '@tanstack/table-core';
	import { cn, type WithElementRef } from '$lib/utils.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Slider } from '$lib/components/ui/slider/index.js';
	import {
		formatRangeValue,
		getColumnRangeBounds,
		isValidRangeValue,
		parseRangeFilterValue,
		type RangeValue
	} from '$lib/data-table-range-utils.js';
	import type { ExtendedColumnFilter } from '$lib/types/data-table.js';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends WithElementRef<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
		filter: ExtendedColumnFilter<TData>;
		column: Column<TData, unknown>;
		inputId: string;
		onFilterUpdate: (
			filterId: string,
			updates: Partial<Omit<ExtendedColumnFilter<TData>, 'filterId'>>
		) => void;
		showSlider?: boolean;
	}

	let {
		filter,
		column,
		inputId,
		onFilterUpdate,
		showSlider = false,
		class: className,
		ref = $bindable(null),
		...restProps
	}: Props = $props();

	const meta = $derived(column.columnDef.meta);
	const bounds = $derived(getColumnRangeBounds(column, meta?.range));
	const unit = $derived(meta?.unit);

	const range = $derived(
		parseRangeFilterValue(
			Array.isArray(filter.value) ? filter.value : [filter.value, ''],
			[bounds.min, bounds.max]
		)
	);

	function updateRange(next: RangeValue) {
		onFilterUpdate(filter.filterId, {
			value: [String(next[0]), String(next[1])]
		});
	}

	function onRangeInputChange(event: Event, isMin = false) {
		const raw = (event.currentTarget as HTMLInputElement).value;
		if (raw === '') {
			onFilterUpdate(filter.filterId, {
				value: isMin ? ['', String(range[1])] : [String(range[0]), '']
			});
			return;
		}

		const numericValue = Number(raw);
		const [currentMin, currentMax] = range;
		const otherValue = isMin ? currentMax : currentMin;

		if (
			!Number.isNaN(numericValue) &&
			(isMin
				? numericValue >= bounds.min && numericValue <= otherValue
				: numericValue <= bounds.max && numericValue >= otherValue)
		) {
			updateRange(isMin ? [numericValue, currentMax] : [currentMin, numericValue]);
		}
	}

	function onSliderChange(value: number[]) {
		if (isValidRangeValue(value)) {
			updateRange(value);
		}
	}
</script>

<div
	bind:this={ref}
	data-slot="range"
	class={cn(showSlider ? 'flex w-full flex-col gap-2' : 'flex w-full items-center gap-2', className)}
	{...restProps}
>
	<div class={cn('flex w-full items-center gap-2', showSlider && 'gap-2')}>
		<div class="relative min-w-0 flex-1">
			<Input
				id={`${inputId}-min`}
				type="number"
				aria-label={`${meta?.label ?? column.id} minimum value`}
				aria-valuemin={bounds.min}
				aria-valuemax={bounds.max}
				data-slot="range-min"
				inputmode="numeric"
				placeholder={formatRangeValue(bounds.min)}
				min={bounds.min}
				max={bounds.max}
				class={cn('h-8 w-full rounded', unit && 'pr-8')}
				value={String(range[0])}
				oninput={(event) => onRangeInputChange(event, true)}
			/>
			{#if unit}
				<span
					class="pointer-events-none absolute inset-y-0 right-0 flex items-center rounded-r-md bg-accent px-2 text-muted-foreground text-sm"
				>
					{unit}
				</span>
			{/if}
		</div>
		<span class="sr-only shrink-0 text-muted-foreground">to</span>
		<div class="relative min-w-0 flex-1">
			<Input
				id={`${inputId}-max`}
				type="number"
				aria-label={`${meta?.label ?? column.id} maximum value`}
				aria-valuemin={bounds.min}
				aria-valuemax={bounds.max}
				data-slot="range-max"
				inputmode="numeric"
				placeholder={formatRangeValue(bounds.max)}
				min={bounds.min}
				max={bounds.max}
				class={cn('h-8 w-full rounded', unit && 'pr-8')}
				value={String(range[1])}
				oninput={(event) => onRangeInputChange(event)}
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
	{#if showSlider}
		<Slider
			type="multiple"
			min={bounds.min}
			max={bounds.max}
			step={bounds.step}
			value={range}
			onValueChange={onSliderChange}
		/>
	{/if}
</div>
