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
	import { useId } from 'bits-ui';
	import type { ComponentProps } from 'svelte';

	import ArrowDownUp from '@lucide/svelte/icons/arrow-down-up';
	import ChevronsUpDown from '@lucide/svelte/icons/chevrons-up-down';
	import GripVertical from '@lucide/svelte/icons/grip-vertical';
	import Trash2 from '@lucide/svelte/icons/trash-2';

	const SORT_SHORTCUT_KEY = 's';
	const REMOVE_SORT_SHORTCUTS = ['backspace', 'delete'];
	const SORT_ORDERS = [
		{ label: 'Asc', value: 'asc' },
		{ label: 'Desc', value: 'desc' }
	] as const;

	interface Props extends ComponentProps<typeof PopoverContent> {
		table: Table<TData>;
		disabled?: boolean;
	}

	let { table, disabled = false, class: className, ...contentProps }: Props = $props();

	const id = useId();
	const labelId = `${id}-label`;
	const descriptionId = `${id}-description`;
	let open = $state(false);
	const sorting = $derived(table.getState().sorting);
	let isDragging = $state(false);
	let dragSorting = $state<ColumnSort[]>([]);
	let openFieldSelectors = $state<Set<string>>(new Set());
	let openDirectionSelectors = $state<Set<string>>(new Set());
	const sortingItems = $derived(isDragging ? dragSorting : sorting);

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
		isDragging = true;
		dragSorting = event.detail.items;
	}

	function handleDndFinalize(event: CustomEvent<{ items: ColumnSort[] }>) {
		isDragging = false;
		const cleanItems = event.detail.items.filter(
			(item) => !(item as unknown as Record<string, unknown>)[SHADOW_ITEM_MARKER_PROPERTY_NAME]
		);
		table.setSorting(cleanItems);
	}

	function setFieldSelectorOpen(sortId: string, isOpen: boolean) {
		const nextOpenSelectors = new Set(openFieldSelectors);
		if (isOpen) {
			nextOpenSelectors.add(sortId);
		} else {
			nextOpenSelectors.delete(sortId);
		}
		openFieldSelectors = nextOpenSelectors;
	}

	function setDirectionSelectorOpen(sortId: string, isOpen: boolean) {
		const nextOpenSelectors = new Set(openDirectionSelectors);
		if (isOpen) {
			nextOpenSelectors.add(sortId);
		} else {
			nextOpenSelectors.delete(sortId);
		}
		openDirectionSelectors = nextOpenSelectors;
	}

	function onSortItemKeyDown(event: KeyboardEvent, sortId: string) {
		if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
			return;
		}

		if (openFieldSelectors.has(sortId) || openDirectionSelectors.has(sortId)) {
			return;
		}

		if (REMOVE_SORT_SHORTCUTS.includes(event.key.toLowerCase())) {
			event.preventDefault();
			onSortRemove(sortId);
		}
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
				class="font-normal"
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
		aria-labelledby={labelId}
		aria-describedby={descriptionId}
		class={cn(
			'flex w-full max-w-[var(--bits-popover-content-available-width)] flex-col gap-3.5 p-4 sm:min-w-[380px]',
			className
		)}
		{...contentProps}
	>
		<div class="flex flex-col gap-1">
			<h4 id={labelId} class="font-medium leading-none">
				{sorting.length > 0 ? 'Sort by' : 'No sorting applied'}
			</h4>
			<p
				id={descriptionId}
				class={cn('text-muted-foreground text-sm', sorting.length > 0 && 'sr-only')}
			>
				{sorting.length > 0
					? 'Modify sorting to organize your rows.'
					: 'Add sorting to organize your rows.'}
			</p>
		</div>
		{#if sortingItems.length > 0}
			<ul
				role="list"
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
					{@const sortItemId = `${id}-sort-${sort.id}`}
					{@const fieldListboxId = `${sortItemId}-field-listbox`}
					{@const fieldTriggerId = `${sortItemId}-field-trigger`}
					{@const directionListboxId = `${sortItemId}-direction-listbox`}
					<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
					<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
					<li
						role="listitem"
						id={sortItemId}
						tabindex={-1}
						class="flex items-center gap-2"
						onkeydown={(event) => onSortItemKeyDown(event, sort.id)}
					>
						<Popover
							open={openFieldSelectors.has(sort.id)}
							onOpenChange={(isOpen) => setFieldSelectorOpen(sort.id, isOpen)}
						>
							<PopoverTrigger>
								{#snippet child({ props })}
									<Button
										{...props}
										id={fieldTriggerId}
										aria-controls={fieldListboxId}
										variant="outline"
										size="sm"
										class="w-44 justify-between rounded font-normal"
									>
										<span class="truncate">{columnLabels.get(sort.id)}</span>
										<ChevronsUpDown class="opacity-50" />
									</Button>
								{/snippet}
							</PopoverTrigger>
							<PopoverContent
								id={fieldListboxId}
								class="w-[var(--bits-popover-anchor-width)] p-0"
							>
								<Command>
									<CommandInput placeholder="Search fields..." />
									<CommandList>
										<CommandEmpty>No fields found.</CommandEmpty>
										<CommandGroup>
											{#each columns as column (column.id)}
												<CommandItem
													value={column.id}
													onSelect={() => onSortUpdate(sort.id, { id: column.id })}
												>
													<span class="truncate">{column.label}</span>
												</CommandItem>
											{/each}
										</CommandGroup>
									</CommandList>
								</Command>
							</PopoverContent>
						</Popover>
						<Select
							type="single"
							open={openDirectionSelectors.has(sort.id)}
							value={sort.desc ? 'desc' : 'asc'}
							onOpenChange={(isOpen) => setDirectionSelectorOpen(sort.id, isOpen)}
							onValueChange={(value: string) => onSortUpdate(sort.id, { desc: value === 'desc' })}
						>
							<SelectTrigger
								aria-controls={directionListboxId}
								size="sm"
								class="w-24 rounded"
							>
								<span data-slot="select-value">{sort.desc ? 'Desc' : 'Asc'}</span>
							</SelectTrigger>
							<SelectContent
								id={directionListboxId}
								class="min-w-[var(--bits-select-anchor-width)]"
							>
								{#each SORT_ORDERS as order (order.value)}
									<SelectItem value={order.value}>{order.label}</SelectItem>
								{/each}
							</SelectContent>
						</Select>
						<Button
							aria-controls={sortItemId}
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
							class="inline-flex size-8 shrink-0 cursor-grab items-center justify-center gap-2 whitespace-nowrap rounded border bg-background text-sm font-medium shadow-xs outline-none transition-all hover:bg-accent hover:text-accent-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 dark:border-input dark:bg-input/30 dark:hover:bg-input/50 [&_svg]:pointer-events-none [&_svg]:shrink-0"
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
