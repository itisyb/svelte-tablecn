<script lang="ts" generics="TData, TValue">
	import type { Column, Table } from '@tanstack/table-core';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Slider } from '$lib/components/ui/slider/index.js';
	import { Popover, PopoverContent, PopoverTrigger } from '$lib/components/ui/popover/index.js';

	import SlidersHorizontal from '@lucide/svelte/icons/sliders-horizontal';
	import X from '@lucide/svelte/icons/x';

	interface Props {
		table?: Table<TData>;
		columnId?: string;
		column?: Column<TData, TValue>;
		title?: string;
	}

	let { table, columnId, column, title }: Props = $props();

	let open = $state(false);
	const resolvedColumnId = $derived(columnId ?? column?.id);
	const resolvedColumn = $derived(
		resolvedColumnId ? (table?.getColumn(resolvedColumnId) ?? column ?? undefined) : column
	);
	const meta = $derived(resolvedColumn?.columnDef.meta);
	const range = $derived(meta?.range ?? [0, 100]);
	const filterValue = $derived.by(() => {
		const id = resolvedColumnId;
		if (!id) return undefined;

		return table?.getState().columnFilters.find((filter) => filter.id === id)?.value;
	});
	let sliderValue = $state<number[]>([0, 100]);
	const displayValue = $derived.by(() => {
		const isDefaultRange = sliderValue[0] === range[0] && sliderValue[1] === range[1];
		return isDefaultRange ? '' : `${sliderValue[0]} - ${sliderValue[1]}`;
	});

	$effect(() => {
		const nextValue =
			Array.isArray(filterValue) && filterValue.every((value) => typeof value === 'number')
				? (filterValue as number[])
				: [range[0], range[1]];

		if (sliderValue[0] !== nextValue[0] || sliderValue[1] !== nextValue[1]) {
			sliderValue = [...nextValue];
		}
	});

	function updateSliderValue(value: number[]) {
		sliderValue = value;
		const isDefaultRange = value[0] === range[0] && value[1] === range[1];
		resolvedColumn?.setFilterValue(isDefaultRange ? undefined : value);
	}

	function clearFilter() {
		resolvedColumn?.setFilterValue(undefined);
		sliderValue = [range[0], range[1]];
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
				<SlidersHorizontal />
				{title}
				{#if displayValue}
					<span class="max-w-32 truncate text-muted-foreground text-xs">{displayValue}</span>
				{/if}
			</Button>
		{/snippet}
	</PopoverTrigger>
	<PopoverContent align="start" class="w-72 space-y-3">
		<div class="space-y-3">
			<Slider
				type="multiple"
				min={range[0]}
				max={range[1]}
				step={1}
				value={sliderValue}
				onValueChange={(value: number[]) => updateSliderValue(value)}
			/>
			<div class="flex items-center justify-between text-muted-foreground text-xs">
				<span>{sliderValue[0]}</span>
				<span>{sliderValue[1]}</span>
			</div>
		</div>
		<div class="flex justify-end">
			<Button variant="ghost" size="sm" class="h-8" onclick={clearFilter}>
				<X />
				Clear
			</Button>
		</div>
	</PopoverContent>
</Popover>
