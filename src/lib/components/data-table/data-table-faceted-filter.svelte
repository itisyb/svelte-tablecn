<script lang="ts" generics="TData, TValue">
	import type { Column, Table } from '@tanstack/table-core';
	import type { DataTableOption } from '$lib/types/data-table.js';
	import { cn } from '$lib/utils.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import {
		Command,
		CommandEmpty,
		CommandGroup,
		CommandInput,
		CommandItem,
		CommandList,
		CommandSeparator
	} from '$lib/components/ui/command/index.js';
	import { Popover, PopoverContent, PopoverTrigger } from '$lib/components/ui/popover/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';

	import Check from '@lucide/svelte/icons/check';
	import PlusCircle from '@lucide/svelte/icons/plus-circle';
	import XCircle from '@lucide/svelte/icons/x-circle';

	interface Props {
		table?: Table<TData>;
		columnId?: string;
		column?: Column<TData, TValue>;
		title?: string;
		options: DataTableOption[];
		multiple?: boolean;
	}

	let { table, columnId, column, title, options, multiple = false }: Props = $props();

	let open = $state(false);
	const resolvedColumnId = $derived(columnId ?? column?.id);
	const resolvedColumn = $derived(
		resolvedColumnId ? (table?.getColumn(resolvedColumnId) ?? column ?? undefined) : column
	);
	const columnFilterValue = $derived.by(() => {
		const id = resolvedColumnId;
		if (!id) {
			return undefined;
		}

		const filters = table?.getState().columnFilters;
		const filter = filters?.find((item) => item.id === id);
		return filter?.value;
	});
	const selectedValues = $derived(
		new Set(Array.isArray(columnFilterValue) ? (columnFilterValue as string[]) : [])
	);

	function onItemSelect(option: DataTableOption, isSelected: boolean) {
		const currentColumn = resolvedColumn;
		if (!currentColumn) return;

		if (multiple) {
			const nextSelectedValues = new Set(selectedValues);
			if (isSelected) {
				nextSelectedValues.delete(option.value);
			} else {
				nextSelectedValues.add(option.value);
			}

			const filterValues = Array.from(nextSelectedValues);
			currentColumn.setFilterValue(filterValues.length ? filterValues : undefined);
			return;
		}

		currentColumn.setFilterValue(isSelected ? undefined : [option.value]);
		open = false;
	}

	function onReset(event?: MouseEvent) {
		event?.stopPropagation();
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
				{#if selectedValues.size > 0}
					<button
						type="button"
						aria-label={`Clear ${title ?? 'column'} filter`}
						class="rounded-sm opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
						onclick={onReset}
					>
						<XCircle />
					</button>
				{:else}
					<PlusCircle />
				{/if}
				{title}
				{#if selectedValues.size > 0}
					<Separator orientation="vertical" class="mx-0.5 data-[orientation=vertical]:h-4" />
					<Badge variant="secondary" class="rounded-sm px-1 font-normal lg:hidden">
						{selectedValues.size}
					</Badge>
					<div class="hidden items-center gap-1 lg:flex">
						{#if selectedValues.size > 2}
							<Badge variant="secondary" class="rounded-sm px-1 font-normal">
								{selectedValues.size} selected
							</Badge>
						{:else}
							{#each options.filter( (option) => selectedValues.has(option.value) ) as option (option.value)}
								<Badge variant="secondary" class="rounded-sm px-1 font-normal">
									{option.label}
								</Badge>
							{/each}
						{/if}
					</div>
				{/if}
			</Button>
		{/snippet}
	</PopoverTrigger>
	<PopoverContent class="w-50 p-0" align="start">
		<Command>
			<CommandInput placeholder={title} />
			<CommandList class="max-h-full">
				<CommandEmpty>No results found.</CommandEmpty>
				<CommandGroup class="max-h-[300px] scroll-py-1 overflow-y-auto overflow-x-hidden">
					{#each options as option (option.value)}
						{@const isSelected = selectedValues.has(option.value)}
						<CommandItem value={option.label} onSelect={() => onItemSelect(option, isSelected)}>
							<div
								class={cn(
									'flex size-4 items-center justify-center rounded-sm border border-primary',
									isSelected ? 'bg-primary' : 'opacity-50 [&_svg]:invisible'
								)}
							>
								<Check />
							</div>
							{#if option.icon}
								{@const Icon = option.icon}
								<Icon />
							{/if}
							<span class="truncate">{option.label}</span>
							{#if option.count}
								<span class="ml-auto font-mono text-xs">{option.count}</span>
							{/if}
						</CommandItem>
					{/each}
				</CommandGroup>
				{#if selectedValues.size > 0}
					<CommandSeparator />
					<CommandGroup>
						<CommandItem onSelect={() => onReset()} class="justify-center text-center">
							Clear filters
						</CommandItem>
					</CommandGroup>
				{/if}
			</CommandList>
		</Command>
	</PopoverContent>
</Popover>
