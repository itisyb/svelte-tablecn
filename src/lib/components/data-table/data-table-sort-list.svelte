<script lang="ts" generics="TData">
	import type { Table, ColumnSort, SortingState } from '@tanstack/table-core';
	import { dragHandleZone, dragHandle, SHADOW_ITEM_MARKER_PROPERTY_NAME } from 'svelte-dnd-action';
	import { cn } from '$lib/utils.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Popover, PopoverContent, PopoverTrigger } from '$lib/components/ui/popover/index.js';
	import {
		Command,
		CommandEmpty,
		CommandGroup,
		CommandInput,
		CommandItem,
		CommandList
	} from '$lib/components/ui/command/index.js';
	import {
		Select,
		SelectContent,
		SelectItem,
		SelectTrigger
	} from '$lib/components/ui/select/index.js';

	import ArrowDownUp from '@lucide/svelte/icons/arrow-down-up';
	import Check from '@lucide/svelte/icons/check';
	import ChevronsUpDown from '@lucide/svelte/icons/chevrons-up-down';
	import GripVertical from '@lucide/svelte/icons/grip-vertical';
	import Trash2 from '@lucide/svelte/icons/trash-2';

	const SORT_SHORTCUT_KEY = 's';
	const REMOVE_SORT_SHORTCUTS = ['backspace', 'delete'];
	const SORT_ORDERS = [
		{ label: 'Asc', value: 'asc' },
		{ label: 'Desc', value: 'desc' }
	] as const;

	interface Props {
		table: Table<TData>;
		disabled?: boolean;
		align?: 'start' | 'center' | 'end';
		class?: string;
	}

	let { table, disabled = false, align = 'start', class: className }: Props = $props();

	let open = $state(false);
	const sorting = $derived(table.getState().sorting);
	let sortingItems = $state<ColumnSort[]>([]);

	$effect(() => {
		sortingItems = [...sorting];
	});

	const { columnLabels, columns } = $derived.by(() => {
		const labels = new Map<string, string>();
		const sortingIds = new Set(sorting.map((item) => item.id));
		const availableColumns: { id: string; label: string }[] = [];

		for (const column of table.getAllColumns()) {
			if (!column.getCanSort()) continue;

			const label = column.columnDef.meta?.label ?? column.id;
			labels.set(column.id, label);

			if (!sortingIds.has(column.id)) {
				availableColumns.push({ id: column.id, label });
			}
		}

		return { columnLabels: labels, columns: availableColumns };
	});

	function getSelectableColumns(currentSortId: string): { id: string; label: string }[] {
		return table
			.getAllColumns()
			.filter((column) => {
				if (!column.getCanSort()) return false;

				const isSortedElsewhere = sorting.some(
					(item) => item.id === column.id && item.id !== currentSortId
				);

				return !isSortedElsewhere;
			})
			.map((column) => ({
				id: column.id,
				label: column.columnDef.meta?.label ?? column.id
			}));
	}

	function onSortAdd() {
		const firstColumn = columns[0];
		if (!firstColumn) return;

		table.setSorting((prevSorting: SortingState) => [
			...prevSorting,
			{ id: firstColumn.id, desc: false }
		]);
	}

	function onSortUpdate(sortId: string, updates: Partial<ColumnSort>) {
		table.setSorting((prevSorting: SortingState) =>
			prevSorting.map((sort) => (sort.id === sortId ? { ...sort, ...updates } : sort))
		);
	}

	function onSortRemove(sortId: string) {
		table.setSorting((prevSorting: SortingState) =>
			prevSorting.filter((item) => item.id !== sortId)
		);
	}

	function onSortingReset() {
		table.setSorting(table.initialState.sorting ?? []);
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (
			disabled ||
			event.target instanceof HTMLInputElement ||
			event.target instanceof HTMLTextAreaElement ||
			(event.target instanceof HTMLElement && event.target.contentEditable === 'true')
		) {
			return;
		}

		if (
			event.key.toLowerCase() === SORT_SHORTCUT_KEY &&
			(event.ctrlKey || event.metaKey) &&
			event.shiftKey
		) {
			event.preventDefault();
			open = !open;
		}
	}

	function onTriggerKeyDown(event: KeyboardEvent) {
		if (REMOVE_SORT_SHORTCUTS.includes(event.key.toLowerCase()) && sorting.length > 0) {
			event.preventDefault();
			onSortingReset();
		}
	}

	function handleDndConsider(event: CustomEvent<{ items: ColumnSort[] }>) {
		sortingItems = event.detail.items;
	}

	function handleDndFinalize(event: CustomEvent<{ items: ColumnSort[] }>) {
		sortingItems = event.detail.items;
		const cleanItems = sortingItems.filter(
			(item) => !(item as unknown as Record<string, unknown>)[SHADOW_ITEM_MARKER_PROPERTY_NAME]
		);
		table.setSorting(cleanItems);
	}
</script>

<svelte:window onkeydown={handleKeyDown} />

<Popover bind:open>
	<PopoverTrigger>
		{#snippet child({ props })}
			<Button
				{...props}
				variant="outline"
				size="sm"
				class={cn('font-normal', className)}
				onkeydown={onTriggerKeyDown}
				{disabled}
			>
				<ArrowDownUp class="text-muted-foreground" />
				Sort
				{#if sorting.length > 0}
					<Badge
						variant="secondary"
						class="h-[18.24px] rounded-[3.2px] px-[5.12px] font-mono font-normal text-[10.4px]"
					>
						{sorting.length}
					</Badge>
				{/if}
			</Button>
		{/snippet}
	</PopoverTrigger>
	<PopoverContent
		{align}
		class="flex w-full max-w-[var(--radix-popover-content-available-width)] flex-col gap-3.5 p-4 sm:min-w-[380px]"
	>
		<div class="flex flex-col gap-1">
			<h4 class="font-medium leading-none">
				{sorting.length > 0 ? 'Sort by' : 'No sorting applied'}
			</h4>
			<p class={cn('text-muted-foreground text-sm', sorting.length > 0 && 'sr-only')}>
				{sorting.length > 0
					? 'Modify sorting to organize your rows.'
					: 'Add sorting to organize your rows.'}
			</p>
		</div>
		{#if sortingItems.length > 0}
			<ul
				class="flex max-h-[300px] flex-col gap-2 overflow-y-auto p-1"
				use:dragHandleZone={{
					items: sortingItems,
					flipDurationMs: 150,
					dropTargetStyle: {},
					type: 'data-table-sort-items'
				}}
				onconsider={handleDndConsider}
				onfinalize={handleDndFinalize}
			>
				{#each sortingItems as sort (sort.id)}
					<li class="flex items-center gap-2">
						<Popover>
							<PopoverTrigger>
								{#snippet child({ props })}
									<Button
										{...props}
										variant="outline"
										size="sm"
										class="w-44 justify-between rounded font-normal"
									>
										<span class="truncate">{columnLabels.get(sort.id)}</span>
										<ChevronsUpDown class="opacity-50" />
									</Button>
								{/snippet}
							</PopoverTrigger>
							<PopoverContent class="w-[var(--radix-popover-trigger-width)] p-0">
								<Command>
									<CommandInput placeholder="Search fields..." />
									<CommandList>
										<CommandEmpty>No fields found.</CommandEmpty>
										<CommandGroup>
											{#each getSelectableColumns(sort.id) as column (column.id)}
												<CommandItem
													value={column.id}
													onSelect={() => onSortUpdate(sort.id, { id: column.id })}
												>
													<span class="truncate">{column.label}</span>
													<Check
														class={cn(
															'ml-auto',
															column.id === sort.id ? 'opacity-100' : 'opacity-0'
														)}
													/>
												</CommandItem>
											{/each}
										</CommandGroup>
									</CommandList>
								</Command>
							</PopoverContent>
						</Popover>
						<Select
							type="single"
							value={sort.desc ? 'desc' : 'asc'}
							onValueChange={(value: string) => onSortUpdate(sort.id, { desc: value === 'desc' })}
						>
							<SelectTrigger class="h-8 w-24 rounded data-size:h-8">
								<span data-slot="select-value">{sort.desc ? 'Desc' : 'Asc'}</span>
							</SelectTrigger>
							<SelectContent class="min-w-[var(--radix-select-trigger-width)]">
								{#each SORT_ORDERS as order (order.value)}
									<SelectItem value={order.value}>{order.label}</SelectItem>
								{/each}
							</SelectContent>
						</Select>
						<Button
							variant="outline"
							size="icon"
							class="size-8 shrink-0 rounded"
							onclick={() => onSortRemove(sort.id)}
						>
							<Trash2 />
						</Button>
						<button
							use:dragHandle
							aria-label="drag handle for sort"
							class="border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex size-8 shrink-0 cursor-grab items-center justify-center rounded border text-sm font-medium whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
						>
							<GripVertical class="size-4" />
						</button>
					</li>
				{/each}
			</ul>
		{/if}
		<div class="flex w-full items-center gap-2">
			<Button size="sm" class="rounded" onclick={onSortAdd} disabled={columns.length === 0}
				>Add sort</Button
			>
			{#if sorting.length > 0}
				<Button variant="outline" size="sm" class="rounded" onclick={onSortingReset}
					>Reset sorting</Button
				>
			{/if}
		</div>
	</PopoverContent>
</Popover>
