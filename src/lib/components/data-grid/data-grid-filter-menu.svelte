<script lang="ts" generics="TData">
	import type { Table, ColumnFilter, Column } from '@tanstack/table-core';
	import type { Option, FilterOperator, FilterValue, CellSelectOption } from '$lib/types/data-grid.js';
	import { dndzone, SHADOW_ITEM_MARKER_PROPERTY_NAME } from 'svelte-dnd-action';
	import { cn } from '$lib/utils.js';
	import { getDefaultOperator, getOperatorsForVariant } from '$lib/data-grid-filters.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import {
		Popover,
		PopoverContent,
		PopoverTrigger
	} from '$lib/components/ui/popover/index.js';
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
	import { Calendar } from '$lib/components/ui/calendar/index.js';
	import { CalendarDate, type DateValue, parseDate } from '@internationalized/date';

	// Icons
	import ListFilter from '@lucide/svelte/icons/list-filter';
	import ChevronsUpDown from '@lucide/svelte/icons/chevrons-up-down';
	import GripVertical from '@lucide/svelte/icons/grip-vertical';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import Check from '@lucide/svelte/icons/check';
	import CalendarIcon from '@lucide/svelte/icons/calendar';

	const FILTER_SHORTCUT_KEY = 'f';
	const REMOVE_FILTER_SHORTCUTS = ['backspace', 'delete'];

	interface Props {
		table: Table<TData>;
		align?: 'start' | 'center' | 'end';
		class?: string;
	}

	let { table, align = 'start', class: className }: Props = $props();

	let open = $state(false);

	const columnFilters = $derived(table.getState().columnFilters);

	// Create a mutable copy for DnD
	let filterItems = $state<ColumnFilter[]>([]);

	$effect(() => {
		filterItems = [...columnFilters];
	});

	const { columnLabels, columns, columnVariants } = $derived.by(() => {
		const labels = new Map<string, string>();
		const variants = new Map<string, string>();
		const filteringIds = new Set(columnFilters.map((f) => f.id));
		const availableColumns: Option[] = [];

		for (const column of table.getAllColumns()) {
			if (!column.getCanFilter()) continue;

			const label = column.columnDef.meta?.label ?? column.id;
			const variant = column.columnDef.meta?.cell?.variant ?? 'short-text';
			labels.set(column.id, label);
			variants.set(column.id, variant);

			if (!filteringIds.has(column.id)) {
				availableColumns.push({ label, value: column.id });
			}
		}

		return {
			columnLabels: labels,
			columns: availableColumns,
			columnVariants: variants
		};
	});

	function onFilterAdd() {
		const firstColumn = columns[0];
		if (!firstColumn) return;

		const variant = columnVariants.get(firstColumn.value) ?? 'short-text';
		const defaultOperator = getDefaultOperator(variant);

		table.setColumnFilters((prevFilters) => [
			...prevFilters,
			{
				id: firstColumn.value,
				value: {
					operator: defaultOperator,
					value: ''
				}
			}
		]);
	}

	function onFilterUpdate(filterId: string, updates: Partial<ColumnFilter>) {
		table.setColumnFilters((prevFilters) => {
			if (!prevFilters) return prevFilters;
			return prevFilters.map((filter) =>
				filter.id === filterId ? { ...filter, ...updates } : filter
			);
		});
	}

	function onFilterRemove(filterId: string) {
		table.setColumnFilters((prevFilters) =>
			prevFilters.filter((item) => item.id !== filterId)
		);
	}

	function onFiltersReset() {
		table.setColumnFilters(table.initialState.columnFilters ?? []);
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (
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
			onFiltersReset();
		}
	}

	function handleDndConsider(e: CustomEvent<{ items: ColumnFilter[] }>) {
		filterItems = e.detail.items;
	}

	function handleDndFinalize(e: CustomEvent<{ items: ColumnFilter[] }>) {
		filterItems = e.detail.items;
		// Filter out shadow items and update table filters
		const cleanItems = filterItems.filter((item) => !(item as unknown as Record<string, unknown>)[SHADOW_ITEM_MARKER_PROPERTY_NAME]);
		table.setColumnFilters(cleanItems);
	}

	function getColumnOptions(columnId: string): CellSelectOption[] {
		const column = table.getColumn(columnId);
		const cellVariant = column?.columnDef.meta?.cell;
		if (cellVariant?.variant === 'select' || cellVariant?.variant === 'multi-select') {
			return cellVariant.options;
		}
		return [];
	}

	function parseISOToCalendarDate(isoString: string | undefined): DateValue | undefined {
		if (!isoString) return undefined;
		try {
			// Extract just the date part (YYYY-MM-DD)
			const dateStr = isoString.split('T')[0];
			if (dateStr) {
				return parseDate(dateStr);
			}
		} catch {
			return undefined;
		}
		return undefined;
	}

	function calendarDateToISO(date: DateValue | undefined): string | undefined {
		if (!date) return undefined;
		return `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}T00:00:00.000Z`;
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
		class="flex w-full max-w-[var(--radix-popover-content-available-width)] flex-col gap-3.5 p-4 sm:min-w-[480px]"
	>
		<div class="flex flex-col gap-1">
			<h4 class="font-medium leading-none">
				{columnFilters.length > 0 ? 'Filter by' : 'No filters applied'}
			</h4>
			<p class={cn('text-muted-foreground text-sm', columnFilters.length > 0 && 'sr-only')}>
				{columnFilters.length > 0
					? 'Modify filters to narrow down your data.'
					: 'Add filters to narrow down your data.'}
			</p>
		</div>
		{#if filterItems.length > 0}
			<ul
				class="flex max-h-[400px] flex-col gap-2 overflow-y-auto p-1"
				use:dndzone={{
					items: filterItems,
					flipDurationMs: 150,
					dropTargetStyle: {},
					type: 'filter-items'
				}}
				onconsider={handleDndConsider}
				onfinalize={handleDndFinalize}
			>
				{#each filterItems as filter, index (filter.id)}
					{@const variant = columnVariants.get(filter.id) ?? 'short-text'}
					{@const filterValue = filter.value as FilterValue | undefined}
					{@const operator = filterValue?.operator ?? getDefaultOperator(variant)}
					{@const operators = getOperatorsForVariant(variant)}
					{@const needsValue = !['isEmpty', 'isNotEmpty', 'isTrue', 'isFalse'].includes(operator)}
					{@const selectOptions = getColumnOptions(filter.id)}
					<li class="flex items-center gap-2">
						<div class="min-w-[72px] text-center">
							{#if index === 0}
								<span class="text-muted-foreground text-sm">Where</span>
							{:else}
								<span class="text-muted-foreground text-sm">And</span>
							{/if}
						</div>
						<!-- Column selector -->
						<Popover>
							<PopoverTrigger>
								{#snippet child({ props })}
									<Button
										{...props}
										variant="outline"
										size="sm"
										class="w-32 justify-between rounded font-normal"
									>
										<span class="truncate">{columnLabels.get(filter.id)}</span>
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
											{#each columns as col (col.value)}
												<CommandItem
													value={col.value}
													onSelect={() => {
														const newVariant = columnVariants.get(col.value) ?? 'short-text';
														const newOperator = getDefaultOperator(newVariant);

														table.setColumnFilters((prevFilters) =>
															prevFilters.map((f) =>
																f.id === filter.id
																	? {
																			id: col.value,
																			value: {
																				operator: newOperator,
																				value: ''
																			}
																		}
																	: f
															)
														);
													}}
												>
													<span class="truncate">{col.label}</span>
													<Check
														class={cn(
															'ml-auto',
															col.value === filter.id ? 'opacity-100' : 'opacity-0'
														)}
													/>
												</CommandItem>
											{/each}
										</CommandGroup>
									</CommandList>
								</Command>
							</PopoverContent>
						</Popover>
						<!-- Operator selector -->
						<Select
							type="single"
							value={operator}
							onValueChange={(newOperator: string) => {
								const currentValue = filterValue?.value;
								const currentValue2 = filterValue?.value2;

								onFilterUpdate(filter.id, {
									value: {
										operator: newOperator as FilterOperator,
										value: currentValue,
										value2: currentValue2
									}
								});
							}}
						>
							<SelectTrigger size="sm" class="w-32 rounded lowercase">
								<span data-slot="select-value" class="truncate">
									{operators.find((op) => op.value === operator)?.label ?? operator}
								</span>
							</SelectTrigger>
							<SelectContent>
								{#each operators as op (op.value)}
									<SelectItem value={op.value} class="lowercase">
										{op.label}
									</SelectItem>
								{/each}
							</SelectContent>
						</Select>
						<!-- Value input -->
						<div class="min-w-36 flex-1">
							{#if needsValue}
								{#if variant === 'number'}
									<Input
										type="number"
										inputmode="numeric"
										placeholder="Value"
										value={String(filterValue?.value ?? '')}
										oninput={(event) => {
											const val = (event.target as HTMLInputElement).value;
											const newValue = val === '' ? undefined : Number(val);
											onFilterUpdate(filter.id, {
												value: {
													operator,
													value: newValue,
													value2: filterValue?.value2
												}
											});
										}}
										class="h-8 w-full rounded"
									/>
								{:else if variant === 'date'}
									{@const calendarValue = parseISOToCalendarDate(filterValue?.value as string | undefined)}
									<Popover>
										<PopoverTrigger>
											{#snippet child({ props })}
												<Button
													{...props}
													variant="outline"
													size="sm"
													class={cn(
														'h-8 w-full justify-start rounded font-normal',
														!calendarValue && 'text-muted-foreground'
													)}
												>
													<CalendarIcon />
													<span class="truncate">
														{calendarValue
															? `${calendarValue.month}/${calendarValue.day}/${calendarValue.year}`
															: 'Select date'}
													</span>
												</Button>
											{/snippet}
										</PopoverTrigger>
										<PopoverContent align="start" class="w-auto p-0">
											<Calendar
												type="single"
												value={calendarValue}
												onValueChange={(date: DateValue | undefined) => {
													const newValue = calendarDateToISO(date);
													onFilterUpdate(filter.id, {
														value: {
															operator,
															value: newValue,
															value2: filterValue?.value2
														}
													});
												}}
											/>
										</PopoverContent>
									</Popover>
								{:else if (variant === 'select' || variant === 'multi-select') && selectOptions.length > 0}
									{#if operator === 'isAnyOf' || operator === 'isNoneOf'}
										{@const selectedValues = Array.isArray(filterValue?.value) ? filterValue.value : []}
										{@const selectedOptions = selectOptions.filter((option) =>
											selectedValues.includes(option.value)
										)}
										<Popover>
											<PopoverTrigger>
												{#snippet child({ props })}
													<Button
														{...props}
														variant="outline"
														size="sm"
														class="h-8 w-full justify-start rounded font-normal"
													>
														{#if selectedOptions.length === 0}
															<span class="text-muted-foreground">Select values</span>
														{:else}
															<span class="truncate">
																{selectedOptions.length > 1
																	? `${selectedOptions.length} selected`
																	: selectedOptions[0]?.label}
															</span>
														{/if}
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
																{@const isSelected = selectedValues.includes(option.value)}
																<CommandItem
																	value={option.value}
																	onSelect={() => {
																		const newValues = isSelected
																			? selectedValues.filter((v) => v !== option.value)
																			: [...selectedValues, option.value];
																		onFilterUpdate(filter.id, {
																			value: {
																				operator,
																				value: newValues.length > 0 ? newValues : undefined,
																				value2: filterValue?.value2
																			}
																		});
																	}}
																>
																	<span class="truncate">{option.label}</span>
																	{#if option.count !== undefined}
																		<span class="ml-auto font-mono text-xs">
																			{option.count}
																		</span>
																	{/if}
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
										{@const selectedOption = selectOptions.find((opt) => opt.value === (filterValue?.value as string))}
										<Popover>
											<PopoverTrigger>
												{#snippet child({ props })}
													<Button
														{...props}
														variant="outline"
														size="sm"
														class="h-8 w-full justify-start rounded font-normal"
													>
														{#if selectedOption}
															<span class="truncate">{selectedOption.label}</span>
														{:else}
															<span class="text-muted-foreground">Select value</span>
														{/if}
													</Button>
												{/snippet}
											</PopoverTrigger>
											<PopoverContent align="start" class="w-[200px] p-0">
												<Command>
													<CommandInput placeholder="Search options..." />
													<CommandList>
														<CommandEmpty>No options found.</CommandEmpty>
														<CommandGroup>
															{#each selectOptions as option (option.value)}
																<CommandItem
																	value={option.value}
																	onSelect={() => {
																		onFilterUpdate(filter.id, {
																			value: {
																				operator,
																				value: option.value,
																				value2: filterValue?.value2
																			}
																		});
																	}}
																>
																	<span class="truncate">{option.label}</span>
																	{#if option.count !== undefined}
																		<span class="ml-auto font-mono text-xs">
																			{option.count}
																		</span>
																	{/if}
																	<Check
																		class={cn(
																			'ml-auto',
																			filterValue?.value === option.value ? 'opacity-100' : 'opacity-0'
																		)}
																	/>
																</CommandItem>
															{/each}
														</CommandGroup>
													</CommandList>
												</Command>
											</PopoverContent>
										</Popover>
									{/if}
								{:else}
									<Input
										type="text"
										placeholder="Value"
										class="h-8 w-full rounded"
										value={(filterValue?.value as string | undefined) ?? ''}
										oninput={(event) => {
											const val = (event.target as HTMLInputElement).value;
											const newValue = val === '' ? undefined : val;
											onFilterUpdate(filter.id, {
												value: {
													operator,
													value: newValue,
													value2: filterValue?.value2
												}
											});
										}}
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
							onclick={() => onFilterRemove(filter.id)}
						>
							<Trash2 />
						</Button>
						<Button variant="outline" size="icon" class="size-8 shrink-0 cursor-grab rounded">
							<GripVertical />
						</Button>
					</li>
				{/each}
			</ul>
		{/if}
		<div class="flex w-full items-center gap-2">
			<Button size="sm" class="rounded" onclick={onFilterAdd} disabled={columns.length === 0}>
				Add filter
			</Button>
			{#if columnFilters.length > 0}
				<Button variant="outline" size="sm" class="rounded" onclick={onFiltersReset}>
					Reset filters
				</Button>
			{/if}
		</div>
	</PopoverContent>
</Popover>
