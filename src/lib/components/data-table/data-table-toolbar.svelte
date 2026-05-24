<script lang="ts" generics="TData">
	import type { Column, Table } from '@tanstack/table-core';
	import { cn } from '$lib/utils.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import DataTableDateFilter from './data-table-date-filter.svelte';
	import DataTableFacetedFilter from './data-table-faceted-filter.svelte';
	import DataTableSliderFilter from './data-table-slider-filter.svelte';
	import DataTableViewOptions from './data-table-view-options.svelte';
	import type { Snippet } from 'svelte';

	import X from '@lucide/svelte/icons/x';

	interface Props {
		table: Table<TData>;
		children?: Snippet;
		class?: string;
	}

	let { table, children, class: className }: Props = $props();

	const isFiltered = $derived(table.getState().columnFilters.length > 0);
	const columns = $derived(table.getAllColumns().filter((column) => column.getCanFilter()));

	function getColumnFilterValue(columnId: string): unknown {
		return table.getState().columnFilters.find((filter) => filter.id === columnId)?.value;
	}

	function getColumnStringFilterValue(columnId: string): string {
		const value = getColumnFilterValue(columnId);
		return typeof value === 'string' ? value : '';
	}

	function setColumnStringFilterValue(column: Column<TData>, value: string) {
		column.setFilterValue(value);
	}

	function onReset() {
		table.resetColumnFilters();
	}

</script>

<div
	role="toolbar"
	aria-orientation="horizontal"
	class={cn('flex w-full items-start justify-between gap-2 p-1', className)}
>
	<div class="flex flex-1 flex-wrap items-center gap-2">
		{#each columns as column (column.id)}
			{@const meta = column.columnDef.meta}
			{@const label = meta?.label ?? column.id}
			{@const variant = meta?.variant}

			{#if variant === 'text'}
				<Input
					placeholder={meta?.placeholder ?? label}
					bind:value={
						() => getColumnStringFilterValue(column.id),
						(value) => setColumnStringFilterValue(column, value)
					}
					class="h-8 w-40 lg:w-56"
				/>
			{:else if variant === 'number'}
				<div class="relative">
					<Input
						type="number"
						inputmode="numeric"
						placeholder={meta?.placeholder ?? label}
						value={typeof getColumnFilterValue(column.id) === 'string'
							? (getColumnFilterValue(column.id) as string)
							: ''}
						oninput={(event) =>
							column.setFilterValue((event.currentTarget as HTMLInputElement).value)}
						class={cn('h-8 w-[120px]', meta?.unit && 'pr-8')}
					/>
					{#if meta?.unit}
						<span
							class="absolute top-0 right-0 bottom-0 flex items-center rounded-r-md bg-accent px-2 text-muted-foreground text-sm"
						>
							{meta.unit}
						</span>
					{/if}
				</div>
			{:else if variant === 'range'}
				<DataTableSliderFilter {table} columnId={column.id} {column} title={label} />
			{:else if variant === 'date' || variant === 'dateRange'}
				<DataTableDateFilter
					{table}
					columnId={column.id}
					{column}
					title={label}
					multiple={variant === 'dateRange'}
				/>
			{:else if variant === 'select' || variant === 'multiSelect'}
				<DataTableFacetedFilter
					{table}
					columnId={column.id}
					{column}
					title={label}
					options={meta?.options ?? []}
					multiple={variant === 'multiSelect'}
				/>
			{/if}
		{/each}

		{#if isFiltered}
			<Button
				aria-label="Reset filters"
				variant="outline"
				size="sm"
				class="border-dashed"
				onclick={onReset}
			>
				<X />
				Reset
			</Button>
		{/if}
	</div>
	<div class="flex items-center gap-2">
		{@render children?.()}
		<DataTableViewOptions {table} align="end" />
	</div>
</div>
