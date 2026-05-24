<script lang="ts" generics="TData">
	import type {
		Column,
		ColumnFilter,
		ColumnFiltersState,
		Table,
		Updater
	} from '@tanstack/table-core';
	import type { Component } from 'svelte';
	import type {
		DataTableOption,
		ExtendedColumnFilter,
		FilterOperator,
		FilterVariant,
		JoinOperator
	} from '$lib/types/data-table.js';
	import { dragHandleZone, dragHandle, SHADOW_ITEM_MARKER_PROPERTY_NAME } from 'svelte-dnd-action';
	import { cn } from '$lib/utils.js';
	import { getDefaultFilterOperator, getFilterOperators } from '$lib/types/data-table.js';
	import { generateId } from '$lib/id.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import DataTableRangeFilter from './data-table-range-filter.svelte';
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

	import ListFilter from '@lucide/svelte/icons/list-filter';
	import ChevronsUpDown from '@lucide/svelte/icons/chevrons-up-down';
	import GripVertical from '@lucide/svelte/icons/grip-vertical';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import Check from '@lucide/svelte/icons/check';

	const FILTER_SHORTCUT_KEY = 'f';
	const REMOVE_FILTER_SHORTCUTS = ['backspace', 'delete'];

	type FilterItem = ColumnFilter & Partial<ExtendedColumnFilter<TData>>;

	interface AvailableColumn {
		id: string;
		label: string;
		variant: FilterVariant;
		icon?: Component<{ class?: string }>;
		options?: DataTableOption[];
	}

	interface Props {
		table: Table<TData>;
		/** Pass `dataTable.setColumnFilters` from useDataTable — keeps Svelte state in sync */
		setColumnFilters?: (updater: Updater<ColumnFiltersState>) => void;
		disabled?: boolean;
		align?: 'start' | 'center' | 'end';
		class?: string;
	}

	let {
		table,
		setColumnFilters: setColumnFiltersProp,
		disabled = false,
		align = 'start',
		class: className
	}: Props = $props();

	function setColumnFilters(updater: Updater<ColumnFiltersState>) {
		if (setColumnFiltersProp) {
			setColumnFiltersProp(updater);
			return;
		}
		table.setColumnFilters(updater);
	}

	let open = $state(false);
	let addButtonRef = $state<HTMLButtonElement | null>(null);
	const columnFilters = $derived(table.getState().columnFilters as FilterItem[]);
	const joinOperator = $derived(table.options.meta?.joinOperator ?? 'and');
	let isDragging = $state(false);
	let dragItems = $state<FilterItem[]>([]);
	let openFieldSelectors = $state<Set<string>>(new Set());
	let openOperatorSelectors = $state<Set<string>>(new Set());
	let openValueSelectors = $state<Set<string>>(new Set());
	const listFilters = $derived(isDragging ? dragItems : columnFilters);

	const columns = $derived.by((): AvailableColumn[] => {
		return table
			.getAllColumns()
			.filter((column) => column.columnDef.enableColumnFilter)
			.map((column) => ({
				id: column.id,
				label: column.columnDef.meta?.label ?? column.id,
				variant: column.columnDef.meta?.variant ?? 'text',
				icon: column.columnDef.meta?.icon,
				options: column.columnDef.meta?.options
			}));
	});

	function getFilterKey(filter: FilterItem, index: number): string {
		return filter.filterId ?? `${filter.id}-${index}`;
	}

	function matchesFilter(filter: FilterItem, filterKey: string, index: number): boolean {
		return getFilterKey(filter, index) === filterKey;
	}

	function getColumnVariant(columnId: string): FilterVariant {
		return columns.find((column) => column.id === columnId)?.variant ?? 'text';
	}

	function getColumnOptions(columnId: string): DataTableOption[] {
		return columns.find((column) => column.id === columnId)?.options ?? [];
	}

	function castColumnId(value: string): Extract<keyof TData, string> {
		return value as Extract<keyof TData, string>;
	}

	function getFilterVariant(filter: FilterItem): FilterVariant {
		return filter.variant ?? getColumnVariant(filter.id);
	}

	function getFilterOperator(filter: FilterItem): FilterOperator {
		return filter.operator ?? getDefaultFilterOperator(getFilterVariant(filter));
	}

	function getFilterValues(filter: FilterItem): {
		primary: string;
		secondary: string;
		values: string[];
	} {
		if (Array.isArray(filter.value)) {
			const values = filter.value.map((value) => `${value}`);
			return {
				primary: values[0] ?? '',
				secondary: values[1] ?? '',
				values
			};
		}

		if (filter.value === undefined || filter.value === null) {
			return { primary: '', secondary: '', values: [] };
		}

		const value = `${filter.value}`;
		return { primary: value, secondary: '', values: value ? [value] : [] };
	}

	function updateFilter(filterKey: string, updates: Partial<FilterItem>) {
		setColumnFilters((prevFilters) =>
			(prevFilters as FilterItem[]).map((filter, index) =>
				matchesFilter(filter, filterKey, index) ? { ...filter, ...updates } : filter
			)
		);
	}

	function setScalarFilterValue(filterKey: string, value: string | number | undefined) {
		updateFilter(filterKey, { value: value == null ? '' : String(value) });
	}

	function setDateFilterValue(
		filterKey: string,
		filterValues: ReturnType<typeof getFilterValues>,
		variant: FilterVariant,
		operator: FilterOperator,
		value: string,
		isSecondary = false
	) {
		updateFilter(filterKey, {
			value:
				variant === 'dateRange' || operator === 'isBetween'
					? isSecondary
						? [filterValues.primary, value]
						: [value, filterValues.secondary]
					: value
		});
	}

	function removeFilter(filterKey: string) {
		setColumnFilters((prevFilters) =>
			(prevFilters as FilterItem[]).filter(
				(filter, index) => !matchesFilter(filter, filterKey, index)
			)
		);
		requestAnimationFrame(() => addButtonRef?.focus());
	}

	function addFilter() {
		const firstColumn = columns[0];
		if (!firstColumn) return;

		setColumnFilters((prevFilters) => [
			...prevFilters,
			{
				id: firstColumn.id,
				value: '',
				variant: firstColumn.variant,
				operator: getDefaultFilterOperator(firstColumn.variant),
				filterId: generateId({ length: 8 })
			} as FilterItem
		]);
	}

	function resetFilters() {
		setColumnFilters([]);
		table.options.meta?.setJoinOperator?.('and');
	}

	function onJoinOperatorChange(value: string) {
		table.options.meta?.setJoinOperator?.(value as JoinOperator);
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
			event.key.toLowerCase() === FILTER_SHORTCUT_KEY &&
			(event.ctrlKey || event.metaKey) &&
			event.shiftKey
		) {
			event.preventDefault();
			open = !open;
		}
	}

	function onTriggerKeyDown(event: KeyboardEvent) {
		if (REMOVE_FILTER_SHORTCUTS.includes(event.key.toLowerCase()) && columnFilters.length > 0) {
			event.preventDefault();
			const lastFilter = columnFilters[columnFilters.length - 1];
			if (lastFilter) {
				removeFilter(getFilterKey(lastFilter, columnFilters.length - 1));
			}
		}
	}

	function handleDndConsider(event: CustomEvent<{ items: FilterItem[] }>) {
		isDragging = true;
		dragItems = event.detail.items;
	}

	function handleDndFinalize(event: CustomEvent<{ items: FilterItem[] }>) {
		isDragging = false;
		const cleanItems = event.detail.items.filter(
			(item) => !(item as unknown as Record<string, unknown>)[SHADOW_ITEM_MARKER_PROPERTY_NAME]
		);
		setColumnFilters(cleanItems as ColumnFiltersState);
	}

	function setFieldSelectorOpen(filterKey: string, isOpen: boolean) {
		const nextOpenSelectors = new Set(openFieldSelectors);
		if (isOpen) {
			nextOpenSelectors.add(filterKey);
		} else {
			nextOpenSelectors.delete(filterKey);
		}
		openFieldSelectors = nextOpenSelectors;
	}

	function setOperatorSelectorOpen(filterKey: string, isOpen: boolean) {
		const nextOpenSelectors = new Set(openOperatorSelectors);
		if (isOpen) {
			nextOpenSelectors.add(filterKey);
		} else {
			nextOpenSelectors.delete(filterKey);
		}
		openOperatorSelectors = nextOpenSelectors;
	}

	function setValueSelectorOpen(filterKey: string, isOpen: boolean) {
		const nextOpenSelectors = new Set(openValueSelectors);
		if (isOpen) {
			nextOpenSelectors.add(filterKey);
		} else {
			nextOpenSelectors.delete(filterKey);
		}
		openValueSelectors = nextOpenSelectors;
	}

	function onFilterItemKeyDown(event: KeyboardEvent, filterKey: string) {
		if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
			return;
		}

		if (
			openFieldSelectors.has(filterKey) ||
			openOperatorSelectors.has(filterKey) ||
			openValueSelectors.has(filterKey)
		) {
			return;
		}

		if (REMOVE_FILTER_SHORTCUTS.includes(event.key.toLowerCase())) {
			event.preventDefault();
			removeFilter(filterKey);
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
				class={cn('font-normal', className)}
				onkeydown={onTriggerKeyDown}
				{disabled}
			>
				<ListFilter class="text-muted-foreground" />
				Filter
				{#if columnFilters.length > 0}
					<Badge
						variant="secondary"
						class="h-[18.24px] rounded-[3.2px] px-[5.12px] font-mono font-normal text-[10.4px]"
					>
						{columnFilters.length}
					</Badge>
				{/if}
			</Button>
		{/snippet}
	</PopoverTrigger>
	<PopoverContent
		{align}
		class="flex w-full max-w-[var(--bits-popover-content-available-width)] flex-col gap-3.5 p-4 sm:min-w-[380px]"
	>
		<div class="flex flex-col gap-1">
			<h4 class="font-medium leading-none">
				{columnFilters.length > 0 ? 'Filter by' : 'No filters applied'}
			</h4>
			<p class={cn('text-muted-foreground text-sm', columnFilters.length > 0 && 'sr-only')}>
				{columnFilters.length > 0
					? 'Modify filters to refine your rows.'
					: 'Add filters to refine your rows.'}
			</p>
		</div>

		{#if listFilters.length > 0}
			<ul
				class="flex max-h-[300px] flex-col gap-2 overflow-y-auto p-1"
				use:dragHandleZone={{
					items: listFilters,
					flipDurationMs: 150,
					dropTargetStyle: {},
					type: 'data-table-filter-items'
				}}
				onconsider={handleDndConsider}
				onfinalize={handleDndFinalize}
			>
				{#each listFilters as filter, index (getFilterKey(filter, index))}
					{@const filterKey = getFilterKey(filter, index)}
					{@const variant = getFilterVariant(filter)}
					{@const operator = getFilterOperator(filter)}
					{@const filterValues = getFilterValues(filter)}
					{@const allowsMultiple =
						variant === 'multiSelect' || operator === 'isAnyOf' || operator === 'isNoneOf'}
					{@const isSingleSelect = variant === 'select' && !allowsMultiple}
					{@const needsValue = !['isEmpty', 'isNotEmpty', 'isTrue', 'isFalse'].includes(operator)}
					{@const selectOptions = getColumnOptions(filter.id)}
					<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
					<li
						class="flex items-center gap-2"
						onkeydown={(event) => onFilterItemKeyDown(event, filterKey)}
					>
						<div class="min-w-[72px] text-center">
							{#if index === 0}
								<span class="text-muted-foreground text-sm">Where</span>
							{:else if index === 1}
								<Select type="single" value={joinOperator} onValueChange={onJoinOperatorChange}>
									<SelectTrigger size="sm" class="rounded lowercase">
										<span data-slot="select-value">{joinOperator}</span>
									</SelectTrigger>
									<SelectContent class="min-w-[var(--bits-select-anchor-width)] lowercase">
										<SelectItem value="and">and</SelectItem>
										<SelectItem value="or">or</SelectItem>
									</SelectContent>
								</Select>
							{:else}
								<span class="text-muted-foreground text-sm">{joinOperator}</span>
							{/if}
						</div>

						<Popover
							open={openFieldSelectors.has(filterKey)}
							onOpenChange={(isOpen) => setFieldSelectorOpen(filterKey, isOpen)}
						>
							<PopoverTrigger>
								{#snippet child({ props })}
									<Button
										{...props}
										variant="outline"
										size="sm"
										class="w-32 justify-between rounded font-normal"
									>
										<span class="truncate"
											>{columns.find((column) => column.id === filter.id)?.label ?? filter.id}</span
										>
										<ChevronsUpDown class="opacity-50" />
									</Button>
								{/snippet}
							</PopoverTrigger>
							<PopoverContent align="start" class="w-40 p-0">
								<Command>
									<CommandInput placeholder="Search fields..." />
									<CommandList>
										<CommandEmpty>No fields found.</CommandEmpty>
										<CommandGroup>
											{#each columns as column (column.id)}
												<CommandItem
													value={column.id}
													onSelect={() => {
														updateFilter(filterKey, {
															id: castColumnId(column.id),
															variant: column.variant,
															operator: getDefaultFilterOperator(column.variant),
															value: ''
														});
														setFieldSelectorOpen(filterKey, false);
													}}
												>
													<span class="truncate">{column.label}</span>
													<Check
														class={cn(
															'ml-auto',
															column.id === filter.id ? 'opacity-100' : 'opacity-0'
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
							open={openOperatorSelectors.has(filterKey)}
							value={operator}
							onOpenChange={(isOpen) => setOperatorSelectorOpen(filterKey, isOpen)}
							onValueChange={(value: string) =>
								updateFilter(filterKey, {
									operator: value as FilterOperator,
									value: ['isEmpty', 'isNotEmpty', 'isTrue', 'isFalse'].includes(value)
										? ''
										: filter.value
								})}
						>
							<SelectTrigger size="sm" class="w-32 rounded lowercase">
								<span data-slot="select-value" class="truncate"
									>{getFilterOperators(variant).find((item) => item.value === operator)?.label ??
										operator}</span
								>
							</SelectTrigger>
							<SelectContent>
								{#each getFilterOperators(variant) as item (item.value)}
									<SelectItem value={item.value} class="lowercase">{item.label}</SelectItem>
								{/each}
							</SelectContent>
						</Select>

						<div class="min-w-36 max-w-60 flex-1">
							{#if needsValue}
								{#if variant === 'range' || (variant === 'number' && operator === 'isBetween')}
									<DataTableRangeFilter
										filter={{
											id: castColumnId(filter.id),
											value: filterValues.values,
											variant,
											operator,
											filterId: filterKey
										}}
										column={table.getColumn(filter.id)!}
										inputId={filterKey}
										onFilterUpdate={(nextFilterId, updates) => updateFilter(nextFilterId, updates)}
									/>
								{:else if variant === 'number'}
									<Input
										type="number"
										inputmode="numeric"
										value={filterValues.primary}
										oninput={(event) =>
											updateFilter(filterKey, {
												value: (event.currentTarget as HTMLInputElement).value
											})}
										class="h-8 w-full rounded"
									/>
								{:else if variant === 'date' || variant === 'dateRange'}
									<div
										class={cn(
											'grid gap-2',
											(variant === 'dateRange' || operator === 'isBetween') && 'sm:grid-cols-2'
										)}
									>
										<Input
											type="date"
											bind:value={
												() => filterValues.primary,
												(value) =>
													setDateFilterValue(filterKey, filterValues, variant, operator, value)
											}
											class="h-8 w-full rounded"
										/>
										{#if variant === 'dateRange' || operator === 'isBetween'}
											<Input
												type="date"
												bind:value={
													() => filterValues.secondary,
													(value) =>
														setDateFilterValue(
															filterKey,
															filterValues,
															variant,
															operator,
															value,
															true
														)
												}
												class="h-8 w-full rounded"
											/>
										{/if}
									</div>
								{:else if variant === 'boolean'}
									<div class="h-8 w-full rounded border bg-transparent dark:bg-input/30"></div>
								{:else if isSingleSelect && selectOptions.length > 0}
									<Select
										type="single"
										open={openValueSelectors.has(filterKey)}
										value={filterValues.primary}
										onOpenChange={(isOpen) => setValueSelectorOpen(filterKey, isOpen)}
										onValueChange={(value: string) => updateFilter(filterKey, { value })}
									>
										<SelectTrigger
											aria-label={`Change ${columns.find((column) => column.id === filter.id)?.label ?? filter.id} value`}
											class="h-8 w-full rounded data-size:h-8"
										>
											<span data-slot="select-value" class="truncate">
												{selectOptions.find((option) => option.value === filterValues.primary)
													?.label ?? 'Select value'}
											</span>
										</SelectTrigger>
										<SelectContent>
											{#each selectOptions as option (option.value)}
												<SelectItem value={option.value}>{option.label}</SelectItem>
											{/each}
										</SelectContent>
									</Select>
								{:else if (variant === 'select' || variant === 'multiSelect') && selectOptions.length > 0}
									<Popover
										open={openValueSelectors.has(filterKey)}
										onOpenChange={(isOpen) => setValueSelectorOpen(filterKey, isOpen)}
									>
										<PopoverTrigger>
											{#snippet child({ props })}
												<Button
													{...props}
													variant="outline"
													size="sm"
													class="h-8 w-full justify-start rounded font-normal"
												>
													<span class="truncate">
														{#if allowsMultiple}
															{filterValues.values.length > 0
																? `${filterValues.values.length} selected`
																: 'Select values'}
														{:else}
															{selectOptions.find((option) => option.value === filterValues.primary)
																?.label ?? 'Select value'}
														{/if}
													</span>
												</Button>
											{/snippet}
										</PopoverTrigger>
										<PopoverContent align="start" class="w-48 p-0">
											<Command>
												<CommandInput placeholder="Search options..." />
												<CommandList>
													<CommandEmpty>No options found.</CommandEmpty>
													<CommandGroup>
														{#each selectOptions as option (option.value)}
															{@const isSelected = filterValues.values.includes(option.value)}
															<CommandItem
																value={option.value}
																onSelect={() =>
																	updateFilter(filterKey, {
																		value: allowsMultiple
																			? isSelected
																				? filterValues.values.filter(
																						(value) => value !== option.value
																					)
																				: [...filterValues.values, option.value]
																			: option.value
																	})}
															>
																<span class="truncate">{option.label}</span>
																<Check
																	class={cn('ml-auto', isSelected ? 'opacity-100' : 'opacity-0')}
																/>
															</CommandItem>
														{/each}
													</CommandGroup>
												</CommandList>
											</Command>
										</PopoverContent>
									</Popover>
								{:else}
									<Input
										type="text"
										bind:value={
											() => filterValues.primary, (value) => setScalarFilterValue(filterKey, value)
										}
										class="h-8 w-full rounded"
									/>
								{/if}
							{:else}
								<div class="h-8 w-full rounded border bg-transparent dark:bg-input/30"></div>
							{/if}
						</div>

						<Button
							variant="outline"
							size="icon"
							class="size-8 rounded"
							onclick={() => removeFilter(filterKey)}
						>
							<Trash2 />
						</Button>
						<button
							use:dragHandle
							aria-label="drag handle for filter"
							class="border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex size-8 shrink-0 cursor-grab items-center justify-center rounded border text-sm font-medium whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
						>
							<GripVertical class="size-4" />
						</button>
					</li>
				{/each}
			</ul>
		{/if}

		<div class="flex w-full items-center gap-2">
			<Button
				bind:ref={addButtonRef}
				size="sm"
				class="rounded"
				onclick={addFilter}
				disabled={columns.length === 0}
				>Add filter</Button
			>
			{#if columnFilters.length > 0}
				<Button variant="outline" size="sm" class="rounded" onclick={resetFilters}
					>Reset filters</Button
				>
			{/if}
		</div>
	</PopoverContent>
</Popover>
