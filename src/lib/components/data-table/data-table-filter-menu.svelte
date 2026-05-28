<script lang="ts" generics="TData">
	import type { ColumnFilter, ColumnFiltersState, Table, Updater } from '@tanstack/table-core';
	import type { Component, ComponentProps } from 'svelte';
	import type {
		DataTableOption,
		ExtendedColumnFilter,
		FilterOperator,
		FilterVariant
	} from '$lib/types/data-table.js';
	import { CalendarDate, parseDate, type DateValue } from '@internationalized/date';
	import { getDefaultFilterOperator, getFilterOperators } from '$lib/types/data-table.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Calendar as CalendarPicker } from '$lib/components/ui/calendar/index.js';
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
	import DataTableRangeFilter from './data-table-range-filter.svelte';
	import DataGridRangeCalendar from '$lib/components/data-grid/data-grid-range-calendar.svelte';
	import { cn } from '$lib/utils.js';
	import { generateId } from '$lib/id.js';
	import { formatDate } from '$lib/format.js';

	import BadgeCheck from '@lucide/svelte/icons/badge-check';
	import CalendarIcon from '@lucide/svelte/icons/calendar';
	import Check from '@lucide/svelte/icons/check';
	import FilterIcon from '@lucide/svelte/icons/list-filter';
	import Text from '@lucide/svelte/icons/text';
	import X from '@lucide/svelte/icons/x';

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

	interface Props extends ComponentProps<typeof PopoverContent> {
		table: Table<TData>;
		setColumnFilters?: (updater: Updater<ColumnFiltersState>) => void;
		disabled?: boolean;
	}

	let {
		table,
		setColumnFilters: setColumnFiltersProp,
		disabled = false,
		class: className,
		...contentProps
	}: Props = $props();

	const id = useId();

	function setColumnFilters(updater: Updater<ColumnFiltersState>) {
		if (setColumnFiltersProp) {
			setColumnFiltersProp(updater);
			return;
		}
		table.setColumnFilters(updater);
	}

	let open = $state(false);
	let selectedColumnId = $state<string | null>(null);
	let draftValue = $state('');
	let draftSecondaryValue = $state('');
	let triggerRef = $state<HTMLButtonElement | null>(null);
	let draftInputRef = $state<HTMLInputElement | null>(null);
	let openFieldSelectors = $state<Set<string>>(new Set());
	let openOperatorSelectors = $state<Set<string>>(new Set());
	let openValueSelectors = $state<Set<string>>(new Set());

	const filters = $derived(table.getState().columnFilters as FilterItem[]);
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
	const selectedColumn = $derived(columns.find((column) => column.id === selectedColumnId) ?? null);

	function castColumnId(value: string): Extract<keyof TData, string> {
		return value as Extract<keyof TData, string>;
	}

	function getFilterKey(filter: FilterItem, index: number): string {
		return filter.filterId ?? `${filter.id}-${index}`;
	}

	function getColumnVariant(columnId: string): FilterVariant {
		return columns.find((column) => column.id === columnId)?.variant ?? 'text';
	}

	function getColumnOptions(columnId: string): DataTableOption[] {
		return columns.find((column) => column.id === columnId)?.options ?? [];
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
				getFilterKey(filter, index) === filterKey ? { ...filter, ...updates } : filter
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
				(filter, index) => getFilterKey(filter, index) !== filterKey
			)
		);
		requestAnimationFrame(() => triggerRef?.focus());
	}

	function resetFilters() {
		setColumnFilters([]);
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

	function resetDraft() {
		selectedColumnId = null;
		draftValue = '';
		draftSecondaryValue = '';
	}

	function getDraftValue() {
		return draftValue;
	}

	function setDraftValue(value: string | number | undefined) {
		draftValue = value == null ? '' : String(value);
	}

	function getDraftSecondaryValue() {
		return draftSecondaryValue;
	}

	function setDraftSecondaryValue(value: string | number | undefined) {
		draftSecondaryValue = value == null ? '' : String(value);
	}

	function calendarDateToString(value: DateValue): string {
		return value.toString();
	}

	function toCalendarDate(value: string | undefined): DateValue | undefined {
		if (!value) return undefined;

		try {
			if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
				return parseDate(value.split('T')[0] ?? value);
			}

			const date = new Date(Number(value));
			if (Number.isNaN(date.getTime())) return undefined;

			return new CalendarDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
		} catch {
			return undefined;
		}
	}

	function selectColumnForDraft(column: AvailableColumn) {
		selectedColumnId = column.id;
		draftValue = '';
		draftSecondaryValue = '';
		requestAnimationFrame(() => draftInputRef?.focus());
	}

	function onOpenChange(nextOpen: boolean) {
		open = nextOpen;
		if (!nextOpen) {
			setTimeout(resetDraft, 100);
		}
	}

	function onDraftInputKeyDown(event: KeyboardEvent) {
		const inputValue =
			event.currentTarget instanceof HTMLInputElement ? event.currentTarget.value : draftValue;
		if (
			selectedColumnId &&
			REMOVE_FILTER_SHORTCUTS.includes(event.key.toLowerCase()) &&
			!inputValue &&
			!draftSecondaryValue
		) {
			event.preventDefault();
			selectedColumnId = null;
		}
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
		if (REMOVE_FILTER_SHORTCUTS.includes(event.key.toLowerCase()) && filters.length > 0) {
			event.preventDefault();
			const lastFilter = filters[filters.length - 1];
			if (lastFilter) {
				removeFilter(getFilterKey(lastFilter, filters.length - 1));
			}
		}
	}

	function addFilterForColumn(column: AvailableColumn, value?: string, secondaryValue = draftSecondaryValue) {
		const nextValue = value ?? draftValue;
		const filterValue =
			column.variant === 'multiSelect'
				? nextValue
					? [nextValue]
					: []
				: column.variant === 'range' || column.variant === 'dateRange'
					? [nextValue, secondaryValue].filter(Boolean)
					: nextValue;

		if (
			(typeof filterValue === 'string' && filterValue.trim() === '') ||
			(Array.isArray(filterValue) && filterValue.length === 0)
		) {
			return;
		}

		setColumnFilters((prevFilters) => [
			...prevFilters,
			{
				id: castColumnId(column.id),
				value: filterValue,
				variant: column.variant,
				operator: getDefaultFilterOperator(column.variant),
				filterId: generateId({ length: 8 })
			} as unknown as ColumnFilter
		]);

		onOpenChange(false);
	}

	function getFilterDisplayValue(filter: FilterItem): string {
		const variant = getFilterVariant(filter);
		const optionLabels = new Map(
			getColumnOptions(filter.id).map((option) => [option.value, option.label] as const)
		);

		if (Array.isArray(filter.value)) {
			if (variant === 'select' || variant === 'multiSelect' || variant === 'boolean') {
				return filter.value
					.map((value) => optionLabels.get(String(value)) ?? String(value))
					.join(', ');
			}

			if (
				(filter.variant === 'date' || filter.variant === 'dateRange') &&
				filter.value.length > 0
			) {
				return filter.value
					.map((value) => formatDate(value, { month: 'short', day: 'numeric' }))
					.join(' to ');
			}

			return filter.value.join(', ');
		}

		if (variant === 'boolean') {
			return filter.value === 'false' ? 'False' : 'True';
		}

		if (variant === 'select' || variant === 'multiSelect') {
			return optionLabels.get(String(filter.value)) ?? String(filter.value ?? '');
		}

		if (
			typeof filter.value === 'string' &&
			(filter.variant === 'date' || filter.variant === 'dateRange')
		) {
			return formatDate(filter.value, { month: 'short', day: 'numeric' });
		}

		return typeof filter.value === 'string' ? filter.value : '';
	}

	function getDateDisplayValue(
		filterValues: ReturnType<typeof getFilterValues>,
		operator: FilterOperator
	): string {
		const dateValues = filterValues.values.filter(Boolean);
		const startDate = dateValues[0];
		const endDate = dateValues[1];
		const isSameDate = startDate && endDate && startDate === endDate;

		if (operator === 'isBetween' && startDate && endDate && !isSameDate) {
			return `${formatDate(startDate, { month: 'short', day: 'numeric' })} - ${formatDate(endDate, { month: 'short', day: 'numeric' })}`;
		}

		return startDate ? formatDate(startDate, { month: 'short', day: 'numeric' }) : 'Pick date...';
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

<div role="list" class="flex flex-wrap items-center gap-2">
	{#each filters as filter, index (getFilterKey(filter, index))}
		{@const filterKey = getFilterKey(filter, index)}
		{@const filterItemId = `${id}-filter-${filterKey}`}
		{@const operatorListboxId = `${filterItemId}-operator-listbox`}
		{@const inputId = `${filterItemId}-input`}
		{@const inputListboxId = `${inputId}-listbox`}
		{@const variant = getFilterVariant(filter)}
		{@const operator = getFilterOperator(filter)}
		{@const filterValues = getFilterValues(filter)}
		{@const allowsMultiple =
			variant === 'multiSelect' || operator === 'isAnyOf' || operator === 'isNoneOf'}
		{@const needsValue = !['isEmpty', 'isNotEmpty', 'isTrue', 'isFalse'].includes(operator)}
		{@const filterColumn = columns.find((column) => column.id === filter.id)}
		{@const selectOptions = getColumnOptions(filter.id)}
		{@const selectedOptions = selectOptions.filter((option) =>
			filterValues.values.includes(option.value)
		)}

		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<div
			role="listitem"
			id={filterItemId}
			class="flex h-8 items-center rounded-md bg-background"
			onkeydown={(event) => onFilterItemKeyDown(event, filterKey)}
		>
			<Popover
				open={openFieldSelectors.has(filterKey)}
				onOpenChange={(isOpen) => setFieldSelectorOpen(filterKey, isOpen)}
			>
				<PopoverTrigger>
					{#snippet child({ props })}
						<Button
							{...props}
							variant="ghost"
							size="sm"
							class="rounded-none rounded-l-md border border-r-0 font-normal dark:bg-input/30"
						>
							{#if filterColumn?.icon}
								{@const Icon = filterColumn.icon}
								<Icon class="size-3.5 text-muted-foreground" />
							{/if}
							<span class="max-w-28 truncate">{filterColumn?.label ?? filter.id}</span>
						</Button>
					{/snippet}
				</PopoverTrigger>
				<PopoverContent align="start" class="w-48 p-0">
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
										{#if column.icon}
											{@const Icon = column.icon}
											<Icon />
										{/if}
										<span class="truncate">{column.label}</span>
										<Check
											class={cn('ml-auto', column.id === filter.id ? 'opacity-100' : 'opacity-0')}
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
				<SelectTrigger
					aria-controls={operatorListboxId}
					size="sm"
					class="h-8 rounded-none border-r-0 px-2.5 lowercase data-size:h-8 [&_svg]:hidden"
				>
					<span data-slot="select-value" class="truncate">
						{getFilterOperators(variant).find((item) => item.value === operator)?.label ?? operator}
					</span>
				</SelectTrigger>
				<SelectContent id={operatorListboxId}>
					{#each getFilterOperators(variant) as item (item.value)}
						<SelectItem value={item.value} class="lowercase">{item.label}</SelectItem>
					{/each}
				</SelectContent>
			</Select>

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
						{inputId}
						showSlider={false}
						onFilterUpdate={(nextFilterId, updates) => updateFilter(nextFilterId, updates)}
						class="size-full max-w-28 gap-0 **:data-[slot='range-min']:border-r-0 [&_input]:rounded-none [&_input]:px-1.5"
					/>
				{:else if variant === 'number'}
					<Input
						id={inputId}
						type="number"
						inputmode="numeric"
						value={filterValues.primary}
						oninput={(event) =>
							updateFilter(filterKey, { value: (event.currentTarget as HTMLInputElement).value })}
						class="h-full w-24 rounded-none px-1.5"
					/>
				{:else if variant === 'boolean'}
					<Select
						type="single"
						open={openValueSelectors.has(filterKey)}
						value={filterValues.primary || 'true'}
						onOpenChange={(isOpen) => setValueSelectorOpen(filterKey, isOpen)}
						onValueChange={(value: string) => updateFilter(filterKey, { value })}
					>
						<SelectTrigger
							id={inputId}
							aria-controls={inputListboxId}
							class="rounded-none bg-transparent px-1.5 py-0.5 [&_svg]:hidden"
						>
							<span data-slot="select-value"
								>{filterValues.primary === 'false' ? 'False' : 'True'}</span
							>
						</SelectTrigger>
						<SelectContent id={inputListboxId}>
							<SelectItem value="true">True</SelectItem>
							<SelectItem value="false">False</SelectItem>
						</SelectContent>
					</Select>
				{:else if variant === 'select' || variant === 'multiSelect'}
					<Popover
						open={openValueSelectors.has(filterKey)}
						onOpenChange={(isOpen) => setValueSelectorOpen(filterKey, isOpen)}
					>
						<PopoverTrigger>
							{#snippet child({ props })}
								<Button
									{...props}
									id={inputId}
									aria-controls={inputListboxId}
									aria-label={`Change ${filterColumn?.label ?? filter.id} value`}
									variant="ghost"
									size="sm"
									class="h-full min-w-16 rounded-none border px-1.5 font-normal dark:bg-input/30"
								>
									{#if selectedOptions.length === 0}
										{variant === 'multiSelect' ? 'Select options...' : 'Select option...'}
									{:else}
										<div class="flex items-center -space-x-2 rtl:space-x-reverse">
											{#each selectedOptions as selectedOption (selectedOption.value)}
												{#if selectedOption.icon}
													{@const Icon = selectedOption.icon}
													<div class="rounded-full border bg-background p-0.5">
														<Icon class="size-3.5" />
													</div>
												{/if}
											{/each}
										</div>
										<span class="truncate">
											{selectedOptions.length > 1
												? `${selectedOptions.length} selected`
												: selectedOptions[0]?.label}
										</span>
									{/if}
								</Button>
							{/snippet}
						</PopoverTrigger>
						<PopoverContent id={inputListboxId} align="start" class="w-48 p-0">
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
																? filterValues.values.filter((value) => value !== option.value)
																: [...filterValues.values, option.value]
															: option.value
													})}
											>
												{#if option.icon}
													{@const Icon = option.icon}
													<Icon />
												{/if}
												<span class="truncate">{option.label}</span>
												<Check class={cn('ml-auto', isSelected ? 'opacity-100' : 'opacity-0')} />
											</CommandItem>
										{/each}
									</CommandGroup>
								</CommandList>
							</Command>
						</PopoverContent>
					</Popover>
				{:else if variant === 'date' || variant === 'dateRange'}
					<Popover
						open={openValueSelectors.has(filterKey)}
						onOpenChange={(isOpen) => setValueSelectorOpen(filterKey, isOpen)}
					>
						<PopoverTrigger>
							{#snippet child({ props })}
								<Button
									{...props}
									id={inputId}
									aria-controls={inputListboxId}
									aria-label={`Change ${filterColumn?.label ?? filter.id} date`}
									variant="ghost"
									size="sm"
									class={cn(
										'h-full rounded-none border px-1.5 font-normal dark:bg-input/30',
										filterValues.values.length === 0 && 'text-muted-foreground'
									)}
								>
									<CalendarIcon class="size-3.5" />
									<span class="truncate">{getDateDisplayValue(filterValues, operator)}</span>
								</Button>
							{/snippet}
						</PopoverTrigger>
						<PopoverContent id={inputListboxId} align="start" class="w-auto p-0">
							{#if variant === 'dateRange' || operator === 'isBetween'}
								<DataGridRangeCalendar
									aria-label={`Select ${filterColumn?.label ?? filter.id} date range`}
									value={{
										start: toCalendarDate(filterValues.primary),
										end: toCalendarDate(filterValues.secondary)
									}}
									onValueChange={(range) =>
										updateFilter(filterKey, {
											value: [range.start, range.end]
												.map((value) => (value ? calendarDateToString(value) : undefined))
												.filter((value): value is string => value !== undefined)
										})}
									captionLayout="dropdown"
									initialFocus
								/>
							{:else}
								<CalendarPicker
									aria-label={`Select ${filterColumn?.label ?? filter.id} date`}
									type="single"
									value={toCalendarDate(filterValues.primary)}
									initialFocus
									onValueChange={(value: DateValue | undefined) =>
										setDateFilterValue(
											filterKey,
											filterValues,
											variant,
											operator,
											value ? calendarDateToString(value) : ''
										)}
									captionLayout="dropdown"
								/>
							{/if}
						</PopoverContent>
					</Popover>
				{:else}
					<Input
						id={inputId}
						type="text"
						bind:value={
							() => filterValues.primary, (value) => setScalarFilterValue(filterKey, value)
						}
						class="h-full w-28 rounded-none px-1.5"
					/>
				{/if}
			{:else}
				<div
					id={inputId}
					role="status"
					aria-label={`${filterColumn?.label ?? filter.id} filter is ${
						operator === 'isEmpty' ? 'empty' : 'not empty'
					}`}
					aria-live="polite"
					class="h-full min-w-16 rounded-none border border-l-0 bg-transparent px-2.5 py-1.5 text-muted-foreground text-sm dark:bg-input/30"
				>
					{operator === 'isTrue'
						? 'True'
						: operator === 'isFalse'
							? 'False'
							: getFilterDisplayValue(filter)}
				</div>
			{/if}

			<Button
				aria-controls={filterItemId}
				aria-label={`Remove ${filterColumn?.label ?? filter.id} filter`}
				variant="ghost"
				size="sm"
				class="h-full rounded-none rounded-r-md border border-l-0 px-1.5 dark:bg-input/30"
				onclick={() => removeFilter(filterKey)}
			>
				<X class="size-3.5" />
			</Button>
		</div>
	{/each}

	{#if filters.length > 0}
		<Button
			aria-label="Reset all filters"
			variant="outline"
			size="icon"
			class="size-8"
			onclick={resetFilters}
		>
			<X />
		</Button>
	{/if}

	<Popover bind:open {onOpenChange}>
		<PopoverTrigger>
			{#snippet child({ props })}
				<Button
					{...props}
					bind:ref={triggerRef}
					aria-label="Open filter command menu"
					variant="outline"
					size={filters.length > 0 ? 'icon' : 'sm'}
					class={cn(filters.length > 0 && 'size-8', 'h-8 font-normal')}
					onkeydown={onTriggerKeyDown}
					{disabled}
				>
					<FilterIcon class="text-muted-foreground" />
					{#if filters.length === 0}
						Filter
					{/if}
				</Button>
			{/snippet}
		</PopoverTrigger>
		<PopoverContent
			class={cn('w-full max-w-[var(--bits-popover-content-available-width)] p-0', className)}
			{...contentProps}
		>
			{#if !selectedColumn}
				<Command loop class="[&_[data-slot=command-input-wrapper]_svg]:hidden">
					<CommandInput placeholder="Search fields..." />
					<CommandList>
						<CommandEmpty>No fields found.</CommandEmpty>
						<CommandGroup>
							{#each columns as column (column.id)}
								<CommandItem value={column.id} onSelect={() => selectColumnForDraft(column)}>
									{#if column.icon}
										{@const Icon = column.icon}
										<Icon />
									{/if}
									<span class="truncate">{column.label}</span>
								</CommandItem>
							{/each}
						</CommandGroup>
					</CommandList>
				</Command>
			{:else if selectedColumn.variant === 'boolean'}
				<Command loop class="[&_[data-slot=command-input-wrapper]_svg]:hidden">
					<CommandInput
						bind:ref={draftInputRef}
						bind:value={getDraftValue, setDraftValue}
						onkeydown={onDraftInputKeyDown}
						placeholder={selectedColumn.label}
					/>
					<CommandList>
						<CommandGroup>
							<CommandItem value="true" onSelect={() => addFilterForColumn(selectedColumn, 'true')}>
								True
							</CommandItem>
							<CommandItem
								value="false"
								onSelect={() => addFilterForColumn(selectedColumn, 'false')}
							>
								False
							</CommandItem>
						</CommandGroup>
					</CommandList>
				</Command>
			{:else if selectedColumn.variant === 'select' || selectedColumn.variant === 'multiSelect'}
				<Command loop class="[&_[data-slot=command-input-wrapper]_svg]:hidden">
					<CommandInput
						bind:ref={draftInputRef}
						bind:value={getDraftValue, setDraftValue}
						onkeydown={onDraftInputKeyDown}
						placeholder={selectedColumn.label}
					/>
					<CommandList>
						<CommandEmpty>No options found.</CommandEmpty>
						<CommandGroup>
							{#each selectedColumn.options ?? [] as option (option.value)}
								<CommandItem
									value={option.value}
									onSelect={() => addFilterForColumn(selectedColumn, option.value)}
								>
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
					</CommandList>
				</Command>
			{:else if selectedColumn.variant === 'text' || selectedColumn.variant === 'number'}
				<Command loop class="[&_[data-slot=command-input-wrapper]_svg]:hidden">
					<CommandInput
						bind:ref={draftInputRef}
						bind:value={getDraftValue, setDraftValue}
						onkeydown={onDraftInputKeyDown}
						placeholder={selectedColumn.label}
					/>
					<CommandList>
						<CommandGroup>
							{@const isEmpty = !draftValue.trim()}
							<CommandItem
								value={draftValue}
								disabled={isEmpty}
								onSelect={() => addFilterForColumn(selectedColumn)}
							>
								{#if isEmpty}
									<Text />
									<span>Type to add filter...</span>
								{:else}
									<BadgeCheck />
									<span class="truncate">Filter by "{draftValue}"</span>
								{/if}
							</CommandItem>
						</CommandGroup>
					</CommandList>
				</Command>
			{:else if selectedColumn.variant === 'date'}
				<Command loop class="[&_[data-slot=command-input-wrapper]_svg]:hidden">
					<CommandInput
						bind:ref={draftInputRef}
						bind:value={getDraftValue, setDraftValue}
						onkeydown={onDraftInputKeyDown}
						placeholder={selectedColumn.label}
					/>
					<CommandList>
						<CalendarPicker
							aria-label={`Select ${selectedColumn.label} date`}
							type="single"
							value={toCalendarDate(draftValue)}
							initialFocus
							onValueChange={(value: DateValue | undefined) => {
								if (!value) return;
								addFilterForColumn(selectedColumn, calendarDateToString(value));
							}}
							captionLayout="dropdown"
						/>
					</CommandList>
				</Command>
			{:else if selectedColumn.variant === 'dateRange'}
				<Command loop class="[&_[data-slot=command-input-wrapper]_svg]:hidden">
					<CommandInput
						bind:ref={draftInputRef}
						bind:value={getDraftValue, setDraftValue}
						onkeydown={onDraftInputKeyDown}
						placeholder={selectedColumn.label}
					/>
					<CommandList>
						<DataGridRangeCalendar
							aria-label={`Select ${selectedColumn.label} date range`}
							value={{
								start: toCalendarDate(draftValue),
								end: toCalendarDate(draftSecondaryValue)
							}}
							onValueChange={(range) => {
								const start = range.start ? calendarDateToString(range.start) : '';
								const end = range.end ? calendarDateToString(range.end) : '';

								draftValue = start;
								draftSecondaryValue = end;

								if (start && end) {
									addFilterForColumn(selectedColumn, start, end);
								}
							}}
							captionLayout="dropdown"
							initialFocus
						/>
					</CommandList>
				</Command>
			{:else}
				<div class="space-y-3 p-4">
					<div class="space-y-1">
						<div class="font-medium text-sm">Add filter</div>
						<div class="text-muted-foreground text-sm">{selectedColumn.label}</div>
					</div>

					<div class="space-y-2">
						{#if selectedColumn.variant === 'range'}
							<div class="grid gap-2 sm:grid-cols-2">
								<Input
									bind:ref={draftInputRef}
									type="number"
									bind:value={getDraftValue, setDraftValue}
									onkeydown={onDraftInputKeyDown}
									placeholder="From"
								/>
								<Input
									type="number"
									bind:value={getDraftSecondaryValue, setDraftSecondaryValue}
									placeholder="To"
								/>
							</div>
						{:else}
							<Input
								bind:ref={draftInputRef}
								type="text"
								bind:value={getDraftValue, setDraftValue}
								onkeydown={onDraftInputKeyDown}
								placeholder="Enter value..."
							/>
						{/if}

						<Button
							variant="outline"
							size="sm"
							class="justify-start"
							onclick={() => addFilterForColumn(selectedColumn)}
							disabled={selectedColumn.variant === 'range'
								? !draftValue || !draftSecondaryValue
								: !draftValue}
						>
							<Text class="size-4 text-muted-foreground" />
							Add filter
						</Button>
					</div>

					<div class="flex justify-between gap-2">
						<Button variant="ghost" size="sm" onclick={resetDraft}>Back</Button>
						<Button variant="ghost" size="sm" onclick={() => onOpenChange(false)}>Close</Button>
					</div>
				</div>
			{/if}
		</PopoverContent>
	</Popover>
</div>
