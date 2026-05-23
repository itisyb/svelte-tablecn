<script lang="ts" generics="TData">
	import type { Table, ColumnFilter, Column } from '@tanstack/table-core';
	import type {
		Direction,
		Option,
		FilterOperator,
		FilterValue,
		CellSelectOption
	} from '$lib/types/data-grid.js';
	import { dragHandleZone, dragHandle, SHADOW_ITEM_MARKER_PROPERTY_NAME } from 'svelte-dnd-action';
	import { cn } from '$lib/utils.js';
	import { getDefaultOperator, getOperatorsForVariant } from '$lib/data-grid-filters.js';
	import { useDebouncedCallback } from '$lib/hooks/use-debounced-callback.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
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
		disabled?: boolean;
		dir?: Direction;
		align?: 'start' | 'center' | 'end';
		class?: string;
	}

	let { table, disabled = false, dir = 'ltr', align = 'start', class: className }: Props =
		$props();

	let open = $state(false);

	const columnFilters = $derived(table.getState().columnFilters);

	let isDragging = $state(false);
	let dragItems = $state<ColumnFilter[]>([]);
	let openFieldSelectors = $state<Set<string>>(new Set());
	let openOperatorSelectors = $state<Set<string>>(new Set());
	const filterItems = $derived(isDragging ? dragItems : columnFilters);

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

	const debouncedFilterUpdate = useDebouncedCallback(
		(filterId: string, updates: Partial<ColumnFilter>) => onFilterUpdate(filterId, updates),
		250
	);

	function getTextFilterValue(filterValue: FilterValue | undefined) {
		return (filterValue?.value as string | undefined) ?? '';
	}

	function setTextFilterValue(
		filterId: string,
		operator: FilterOperator,
		filterValue: FilterValue | undefined,
		value: string
	) {
		debouncedFilterUpdate(filterId, {
			value: {
				operator,
				value: value === '' ? undefined : value,
				endValue: filterValue?.endValue
			}
		});
	}

	function onFilterRemove(filterId: string) {
		table.setColumnFilters((prevFilters) => prevFilters.filter((item) => item.id !== filterId));
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
		isDragging = true;
		dragItems = e.detail.items;
	}

	function handleDndFinalize(e: CustomEvent<{ items: ColumnFilter[] }>) {
		isDragging = false;
		const cleanItems = e.detail.items.filter(
			(item) => !(item as unknown as Record<string, unknown>)[SHADOW_ITEM_MARKER_PROPERTY_NAME]
		);
		table.setColumnFilters(cleanItems);
	}

	function setFieldSelectorOpen(filterId: string, isOpen: boolean) {
		const nextOpenSelectors = new Set(openFieldSelectors);
		if (isOpen) {
			nextOpenSelectors.add(filterId);
		} else {
			nextOpenSelectors.delete(filterId);
		}
		openFieldSelectors = nextOpenSelectors;
	}

	function setOperatorSelectorOpen(filterId: string, isOpen: boolean) {
		const nextOpenSelectors = new Set(openOperatorSelectors);
		if (isOpen) {
			nextOpenSelectors.add(filterId);
		} else {
			nextOpenSelectors.delete(filterId);
		}
		openOperatorSelectors = nextOpenSelectors;
	}

	function onFilterItemKeyDown(event: KeyboardEvent, filterId: string) {
		if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
			return;
		}

		if (openFieldSelectors.has(filterId) || openOperatorSelectors.has(filterId)) {
			return;
		}

		if (REMOVE_FILTER_SHORTCUTS.includes(event.key.toLowerCase())) {
			event.preventDefault();
			onFilterRemove(filterId);
		}
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
				{dir}
				variant="outline"
				size="sm"
				class="font-normal"
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
		{dir}
		{align}
		class={cn(
			'flex w-full max-w-[var(--bits-popover-content-available-width)] flex-col gap-3.5 p-4 sm:min-w-[480px]',
			className
		)}
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
				role="list"
				class="flex max-h-[400px] flex-col gap-2 overflow-y-auto p-1"
				use:dragHandleZone={{
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
					<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
					<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
					<li
						role="listitem"
						tabindex={-1}
						class="flex items-center gap-2"
						onkeydown={(event) => onFilterItemKeyDown(event, filter.id)}
					>
						<div class="min-w-[72px] text-center">
							{#if index === 0}
								<span class="text-muted-foreground text-sm">Where</span>
							{:else}
								<span class="text-muted-foreground text-sm">And</span>
							{/if}
						</div>
						<!-- Column selector -->
						<Popover
							open={openFieldSelectors.has(filter.id)}
							onOpenChange={(isOpen) => setFieldSelectorOpen(filter.id, isOpen)}
						>
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
														setFieldSelectorOpen(filter.id, false);
													}}
												>
													<span class="truncate">{col.label}</span>
													<Check
														class={cn(
															'ms-auto',
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
							open={openOperatorSelectors.has(filter.id)}
							value={operator}
							onOpenChange={(isOpen) => setOperatorSelectorOpen(filter.id, isOpen)}
							onValueChange={(newOperator: string) => {
								const currentValue = filterValue?.value;
								const currentEndValue = filterValue?.endValue;

								onFilterUpdate(filter.id, {
									value: {
										operator: newOperator as FilterOperator,
										value: currentValue,
										endValue: currentEndValue
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
						<div class="min-w-36 max-w-60 flex-1">
							{#if needsValue}
								{#if variant === 'number'}
									{#if operator === 'isBetween'}
										<div class="flex gap-2">
											<Input
												type="number"
												inputmode="numeric"
												placeholder="Start"
												value={String(filterValue?.value ?? '')}
												oninput={(event) => {
													const val = (event.target as HTMLInputElement).value;
													const newValue = val === '' ? undefined : Number(val);
													debouncedFilterUpdate(filter.id, {
														value: {
															operator,
															value: newValue,
															endValue: filterValue?.endValue
														}
													});
												}}
												class="h-8 w-full flex-1 rounded"
											/>
											<Input
												type="number"
												inputmode="numeric"
												placeholder="End"
												value={String(filterValue?.endValue ?? '')}
												oninput={(event) => {
													const val = (event.target as HTMLInputElement).value;
													const newValue = val === '' ? undefined : Number(val);
													debouncedFilterUpdate(filter.id, {
														value: {
															operator,
															value: filterValue?.value,
															endValue: newValue
														}
													});
												}}
												class="h-8 w-full flex-1 rounded"
											/>
										</div>
									{:else}
										<Input
											type="number"
											inputmode="numeric"
											placeholder="Value"
											value={String(filterValue?.value ?? '')}
											oninput={(event) => {
												const val = (event.target as HTMLInputElement).value;
												const newValue = val === '' ? undefined : Number(val);
												debouncedFilterUpdate(filter.id, {
													value: {
														operator,
														value: newValue,
														endValue: filterValue?.endValue
													}
												});
											}}
											class="h-8 w-full rounded"
										/>
									{/if}
								{:else if variant === 'date'}
									{@const calendarValue = parseISOToCalendarDate(
										filterValue?.value as string | undefined
									)}
									{@const endCalendarValue = parseISOToCalendarDate(
										filterValue?.endValue as string | undefined
									)}
									{#if operator === 'isBetween'}
										<div class="flex gap-2">
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
																	: 'Start'}
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
																	endValue: filterValue?.endValue
																}
															});
														}}
													/>
												</PopoverContent>
											</Popover>
											<Popover>
												<PopoverTrigger>
													{#snippet child({ props })}
														<Button
															{...props}
															variant="outline"
															size="sm"
															class={cn(
																'h-8 w-full justify-start rounded font-normal',
																!endCalendarValue && 'text-muted-foreground'
															)}
														>
															<CalendarIcon />
															<span class="truncate">
																{endCalendarValue
																	? `${endCalendarValue.month}/${endCalendarValue.day}/${endCalendarValue.year}`
																	: 'End'}
															</span>
														</Button>
													{/snippet}
												</PopoverTrigger>
												<PopoverContent align="start" class="w-auto p-0">
													<Calendar
														type="single"
														value={endCalendarValue}
														onValueChange={(date: DateValue | undefined) => {
															const newValue = calendarDateToISO(date);
															onFilterUpdate(filter.id, {
																value: {
																	operator,
																	value: filterValue?.value,
																	endValue: newValue
																}
															});
														}}
													/>
												</PopoverContent>
											</Popover>
										</div>
									{:else}
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
																endValue: filterValue?.endValue
															}
														});
													}}
												/>
											</PopoverContent>
										</Popover>
									{/if}
								{:else if (variant === 'select' || variant === 'multi-select') && selectOptions.length > 0}
									{#if operator === 'isAnyOf' || operator === 'isNoneOf'}
										{@const selectedValues = Array.isArray(filterValue?.value)
											? filterValue.value
											: []}
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
																				endValue: filterValue?.endValue
																			}
																		});
																	}}
																>
																	<span class="truncate">{option.label}</span>
																	{#if option.count}
																		<span class="ms-auto font-mono text-xs">
																			{option.count}
																		</span>
																	{/if}
																	<Check
																		class={cn('ms-auto', isSelected ? 'opacity-100' : 'opacity-0')}
																	/>
																</CommandItem>
															{/each}
														</CommandGroup>
													</CommandList>
												</Command>
											</PopoverContent>
										</Popover>
									{:else}
										{@const selectedOption = selectOptions.find(
											(opt) => opt.value === (filterValue?.value as string)
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
																				endValue: filterValue?.endValue
																			}
																		});
																	}}
																>
																	<span class="truncate">{option.label}</span>
																	{#if option.count}
																		<span class="ms-auto font-mono text-xs">
																			{option.count}
																		</span>
																	{/if}
																	<Check
																		class={cn(
																			'ms-auto',
																			filterValue?.value === option.value
																				? 'opacity-100'
																				: 'opacity-0'
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
										bind:value={
											() => getTextFilterValue(filterValue),
											(value) => setTextFilterValue(filter.id, operator, filterValue, value)
										}
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
