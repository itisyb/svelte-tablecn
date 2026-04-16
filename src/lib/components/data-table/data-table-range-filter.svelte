<script lang="ts" generics="TData">
	import type { Column } from '@tanstack/table-core';
	import { cn } from '$lib/utils.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import type { ExtendedColumnFilter } from '$lib/types/data-table.js';

	interface Props {
		filter: ExtendedColumnFilter<TData>;
		column: Column<TData, unknown>;
		inputId: string;
		onFilterUpdate: (
			filterId: string,
			updates: Partial<Omit<ExtendedColumnFilter<TData>, 'filterId'>>
		) => void;
		class?: string;
	}

	let { filter, column, inputId, onFilterUpdate, class: className }: Props = $props();

	const meta = $derived(column.columnDef.meta);
	const bounds = $derived.by(() => {
		const range = meta?.range;
		if (range) return range;

		const facetedRange = column.getFacetedMinMaxValues();
		if (!facetedRange) return [0, 100] as const;

		return [Number(facetedRange[0] ?? 0), Number(facetedRange[1] ?? 100)] as const;
	});

	const value = $derived(Array.isArray(filter.value) ? filter.value : [filter.value, '']);

	function onRangeValueChange(nextValue: string, isMin = false) {
		const [min, max] = bounds;
		const numericValue = Number(nextValue);
		const [currentMin = '', currentMax = ''] = value;
		const otherValue = isMin ? currentMax : currentMin;

		if (
			nextValue === '' ||
			(!Number.isNaN(numericValue) &&
				(isMin
					? numericValue >= min && numericValue <= (Number(otherValue) || max)
					: numericValue <= max && numericValue >= (Number(otherValue) || min)))
		) {
			onFilterUpdate(filter.filterId, {
				value: isMin ? [nextValue, otherValue] : [otherValue, nextValue]
			});
		}
	}
</script>

<div data-slot="range" class={cn('flex w-full items-center gap-2', className)}>
	<Input
		id={`${inputId}-min`}
		type="number"
		aria-label={`${meta?.label ?? column.id} minimum value`}
		aria-valuemin={bounds[0]}
		aria-valuemax={bounds[1]}
		data-slot="range-min"
		inputmode="numeric"
		placeholder={`${bounds[0]}`}
		min={bounds[0]}
		max={bounds[1]}
		class="h-8 w-full rounded"
		value={typeof value[0] === 'string' ? value[0] : ''}
		oninput={(event) => onRangeValueChange((event.currentTarget as HTMLInputElement).value, true)}
	/>
	<span class="sr-only shrink-0 text-muted-foreground">to</span>
	<Input
		id={`${inputId}-max`}
		type="number"
		aria-label={`${meta?.label ?? column.id} maximum value`}
		aria-valuemin={bounds[0]}
		aria-valuemax={bounds[1]}
		data-slot="range-max"
		inputmode="numeric"
		placeholder={`${bounds[1]}`}
		min={bounds[0]}
		max={bounds[1]}
		class="h-8 w-full rounded"
		value={typeof value[1] === 'string' ? value[1] : ''}
		oninput={(event) => onRangeValueChange((event.currentTarget as HTMLInputElement).value)}
	/>
</div>
