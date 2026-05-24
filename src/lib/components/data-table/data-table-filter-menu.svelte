<script lang="ts" generics="TData">
	import type { ColumnFilter, ColumnFiltersState, Table, Updater } from '@tanstack/table-core';
	import type { Component } from 'svelte';
	import type {
		DataTableOption,
		ExtendedColumnFilter,
		FilterOperator,
		FilterVariant
	} from '$lib/types/data-table.js';
	import { getDefaultFilterOperator, getFilterOperators } from '$lib/types/data-table.js';
	import { Button } from '$lib/components/ui/button/index.js';
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
	import { useId } from 'bits-ui';
	import DataTableRangeFilter from './data-table-range-filter.svelte';
	import { cn } from '$lib/utils.js';
	import { generateId } from '$lib/id.js';
	import { formatDate } from '$lib/format.js';

	import Check from '@lucide/svelte/icons/check';
	import ChevronsUpDown from '@lucide/svelte/icons/chevrons-up-down';
	import FilterIcon from '@lucide/svelte/icons/list-filter';
	import Text from '@lucide/svelte/icons/text';
	import X from '@lucide/svelte/icons/x';

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
	let openFieldSelectors = $state<Set<string>>(new Set());

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

	function onOpenChange(nextOpen: boolean) {
		open = nextOpen;
		if (!nextOpen) {
			resetDraft();
		}
	}

	function addFilterForColumn(column: AvailableColumn, value?: string) {
		const nextValue = value ?? draftValue;
		const filterValue =
			column.variant === 'multiSelect'
				? nextValue
					? [nextValue]
					: []
				: column.variant === 'range' || column.variant === 'dateRange'
					? [nextValue, draftSecondaryValue].filter(Boolean)
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
</script>

<div role="list" class={cn('flex flex-wrap items-center gap-2', className)}>
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
		{@const isSingleSelect = variant === 'select' && !allowsMultiple}
		{@const needsValue = !['isEmpty', 'isNotEmpty', 'isTrue', 'isFalse'].includes(operator)}
		{@const filterColumn = columns.find((column) => column.id === filter.id)}
		{@const selectOptions = getColumnOptions(filter.id)}

		<div
			role="listitem"
			id={filterItemId}
			class="flex h-8 items-center rounded-md bg-background"
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
							<ChevronsUpDown class="opacity-50" />
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
				value={operator}
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
						value={filterValues.primary || 'true'}
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
				{:else if isSingleSelect}
					<Select
						type="single"
						value={filterValues.primary}
						onValueChange={(value: string) => updateFilter(filterKey, { value })}
					>
						<SelectTrigger
							id={inputId}
							aria-controls={inputListboxId}
							aria-label={`Change ${filterColumn?.label ?? filter.id} value`}
							class="h-8 min-w-16 rounded-none border-l-0 px-2.5 data-size:h-8"
						>
							<span data-slot="select-value" class="truncate">
								{selectOptions.find((option) => option.value === filterValues.primary)?.label ??
									'Select value'}
							</span>
						</SelectTrigger>
						<SelectContent id={inputListboxId}>
							{#each selectOptions as option (option.value)}
								<SelectItem value={option.value}>{option.label}</SelectItem>
							{/each}
						</SelectContent>
					</Select>
				{:else if variant === 'select' || variant === 'multiSelect'}
					<Popover>
						<PopoverTrigger>
							{#snippet child({ props })}
								<Button
									{...props}
									id={inputId}
									aria-controls={inputListboxId}
									variant="ghost"
									size="sm"
									class="h-full min-w-16 rounded-none border border-l-0 px-2.5 font-normal dark:bg-input/30"
								>
									<span class="max-w-28 truncate">
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
					<div
						class={cn(
							'grid gap-2 border-l-0',
							(variant === 'dateRange' || operator === 'isBetween') && 'sm:grid-cols-2'
						)}
					>
						<Input
							id={inputId}
							type="date"
							bind:value={
								() => filterValues.primary,
								(value) => setDateFilterValue(filterKey, filterValues, variant, operator, value)
							}
							class="h-full rounded-none px-1.5"
						/>
						{#if variant === 'dateRange' || operator === 'isBetween'}
							<Input
								id={`${inputId}-end`}
								type="date"
								bind:value={
									() => filterValues.secondary,
									(value) =>
										setDateFilterValue(filterKey, filterValues, variant, operator, value, true)
								}
								class="h-full rounded-none px-1.5"
							/>
						{/if}
					</div>
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
					aria-label="Open filter command menu"
					variant="outline"
					size={filters.length > 0 ? 'icon' : 'sm'}
					class={cn(filters.length > 0 && 'size-8', 'h-8 font-normal')}
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
			{align}
			class="w-full max-w-[var(--bits-popover-content-available-width)] p-0 sm:w-80"
		>
			{#if !selectedColumn}
				<Command>
					<CommandInput placeholder="Search fields..." />
					<CommandList>
						<CommandEmpty>No fields found.</CommandEmpty>
						<CommandGroup>
							{#each columns as column (column.id)}
								<CommandItem value={column.id} onSelect={() => (selectedColumnId = column.id)}>
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
			{:else}
				<div class="space-y-3 p-4">
					<div class="space-y-1">
						<div class="font-medium text-sm">Add filter</div>
						<div class="text-muted-foreground text-sm">{selectedColumn.label}</div>
					</div>

					{#if selectedColumn.variant === 'boolean'}
						<div class="grid gap-2">
							<Button
								variant="outline"
								size="sm"
								class="justify-start"
								onclick={() => addFilterForColumn(selectedColumn, 'true')}
							>
								<Check class="size-4 text-muted-foreground" />
								True
							</Button>
							<Button
								variant="outline"
								size="sm"
								class="justify-start"
								onclick={() => addFilterForColumn(selectedColumn, 'false')}
							>
								<Check class="size-4 text-muted-foreground opacity-0" />
								False
							</Button>
						</div>
					{:else if selectedColumn.variant === 'select' || selectedColumn.variant === 'multiSelect'}
						<Command>
							<CommandInput placeholder="Search options..." />
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
										</CommandItem>
									{/each}
								</CommandGroup>
							</CommandList>
						</Command>
					{:else}
						<div class="space-y-2">
							{#if selectedColumn.variant === 'range' || selectedColumn.variant === 'dateRange'}
								<div class="grid gap-2 sm:grid-cols-2">
									<Input
										type={selectedColumn.variant === 'range' ? 'number' : 'date'}
										bind:value={getDraftValue, setDraftValue}
										placeholder="From"
									/>
									<Input
										type={selectedColumn.variant === 'range' ? 'number' : 'date'}
										bind:value={getDraftSecondaryValue, setDraftSecondaryValue}
										placeholder="To"
									/>
								</div>
							{:else}
								<Input
									type={selectedColumn.variant === 'number'
										? 'number'
										: selectedColumn.variant === 'date'
											? 'date'
											: 'text'}
									bind:value={getDraftValue, setDraftValue}
									placeholder={selectedColumn.variant === 'number'
										? 'Enter number...'
										: 'Enter value...'}
								/>
							{/if}

							<Button
								variant="outline"
								size="sm"
								class="justify-start"
								onclick={() => addFilterForColumn(selectedColumn)}
								disabled={selectedColumn.variant === 'range' ||
								selectedColumn.variant === 'dateRange'
									? !draftValue || !draftSecondaryValue
									: !draftValue}
							>
								<Text class="size-4 text-muted-foreground" />
								Add filter
							</Button>
						</div>
					{/if}

					<div class="flex justify-between gap-2">
						<Button variant="ghost" size="sm" onclick={resetDraft}>Back</Button>
						<Button variant="ghost" size="sm" onclick={() => onOpenChange(false)}>Close</Button>
					</div>
				</div>
			{/if}
		</PopoverContent>
	</Popover>
</div>
