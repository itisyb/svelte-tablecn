<script lang="ts" generics="TData">
	import type { CellVariantProps } from '$lib/types/data-grid.js';
	import { getCellKey, getLineCount } from '$lib/types/data-grid.js';
	import { useBadgeOverflow } from '$lib/hooks/use-badge-overflow.svelte.js';
	import DataGridCellWrapper from '../data-grid-cell-wrapper.svelte';
	import { Popover as PopoverPrimitive } from 'bits-ui';
	import { PopoverContent } from '$lib/components/ui/popover/index.js';
	import {
		Command,
		CommandEmpty,
		CommandGroup,
		CommandInput,
		CommandItem,
		CommandList,
		CommandSeparator
	} from '$lib/components/ui/command/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { cn } from '$lib/utils.js';
	import Check from '@lucide/svelte/icons/check';
	import X from '@lucide/svelte/icons/x';

	let {
		cell,
		table,
		rowIndex,
		columnId,
		isEditing,
		isFocused,
		isSelected,
		readOnly = false,
		cellValue
	}: CellVariantProps<TData> = $props();

	// Use centralized cellValue prop - fine-grained reactivity is handled by DataGridCell
	const initialCellValue = $derived((cellValue as string[]) ?? []);
	const cellKey = $derived(getCellKey(rowIndex, columnId));
	let prevCellKey = $state('');

	// Track local edits separately
	let localEditValues = $state<string[] | null>(null);
	
	// Selected values - use localEditValues if set, otherwise initialCellValue
	const selectedValues = $derived(localEditValues ?? initialCellValue);
	
	let searchValue = $state('');
	let containerRef = $state<HTMLDivElement | null>(null);
	let inputRef = $state<HTMLInputElement | null>(null);
	const cellOpts = $derived(cell.column.columnDef.meta?.cell);
	const options = $derived(cellOpts?.variant === 'multi-select' ? cellOpts.options : []);
	const sideOffset = $derived(-(containerRef?.clientHeight ?? 0));

	// Reset local edit value when editing stops
	$effect(() => {
		if (!isEditing) {
			localEditValues = null;
		}
	});

	// Reset search when cell changes
	$effect(() => {
		if (prevCellKey !== cellKey) {
			prevCellKey = cellKey;
			searchValue = '';
		}
	});

	function handleValueChange(value: string) {
		if (readOnly) return;
		const currentValues = localEditValues ?? initialCellValue;
		const newValues = currentValues.includes(value)
			? currentValues.filter((v) => v !== value)
			: [...currentValues, value];

		localEditValues = newValues;
		table.options.meta?.onDataUpdate?.({ rowIndex, columnId, value: newValues });
		searchValue = '';
		queueMicrotask(() => inputRef?.focus());
	}

	function removeValue(valueToRemove: string, event?: MouseEvent) {
		if (readOnly) return;
		event?.stopPropagation();
		event?.preventDefault();
		const currentValues = localEditValues ?? initialCellValue;
		const newValues = currentValues.filter((v) => v !== valueToRemove);
		localEditValues = newValues;
		table.options.meta?.onDataUpdate?.({ rowIndex, columnId, value: newValues });
		setTimeout(() => inputRef?.focus(), 0);
	}

	function clearAll() {
		if (readOnly) return;
		localEditValues = [];
		table.options.meta?.onDataUpdate?.({ rowIndex, columnId, value: [] });
		queueMicrotask(() => inputRef?.focus());
	}

	function handleOpenChange(isOpen: boolean) {
		const meta = table.options.meta;
		if (isOpen && !readOnly) {
			meta?.onCellEditingStart?.(rowIndex, columnId);
		} else {
			searchValue = '';
			meta?.onCellEditingStop?.();
		}
	}

	function handleOpenAutoFocus(event: Event) {
		event.preventDefault();
		inputRef?.focus();
	}

	function handleWrapperKeyDown(event: KeyboardEvent) {
		const meta = table.options.meta;
		if (isEditing && event.key === 'Escape') {
			event.preventDefault();
			localEditValues = null;
			searchValue = '';
			meta?.onCellEditingStop?.();
		} else if (!isEditing && isFocused && event.key === 'Tab') {
			event.preventDefault();
			searchValue = '';
			meta?.onCellEditingStop?.({
				direction: event.shiftKey ? 'left' : 'right'
			});
		}
	}

	function handleInputKeyDown(event: KeyboardEvent) {
		// Handle backspace when input is empty - remove last selected item
		if (event.key === 'Backspace' && searchValue === '' && selectedValues.length > 0) {
			event.preventDefault();
			const lastValue = selectedValues[selectedValues.length - 1];
			if (lastValue) {
				removeValue(lastValue);
			}
		}
		// Prevent escape from propagating to close the popover immediately
		if (event.key === 'Escape') {
			event.stopPropagation();
		}
	}

	// Build display items with labels
	const displayItems = $derived(
		selectedValues
			.map((val) => ({
				value: val,
				label: options.find((opt) => opt.value === val)?.label ?? val
			}))
			.filter((item) => item.label)
	);

	const rowHeight = $derived(table.options.meta?.rowHeight ?? 'short');
	const lineCount = $derived(getLineCount(rowHeight));

	// Use the badge overflow hook for accurate measurement
	const badgeOverflow = useBadgeOverflow(() => ({
		items: displayItems,
		getLabel: (item) => item.label,
		containerRef: containerRef,
		lineCount: lineCount,
		cacheKeyPrefix: 'multi-select'
	}));

	const visibleItems = $derived(badgeOverflow.value.visibleItems);
	const hiddenBadgeCount = $derived(badgeOverflow.value.hiddenCount);
</script>

<DataGridCellWrapper
	bind:wrapperRef={containerRef}
	{cell}
	{table}
	{rowIndex}
	{columnId}
	{isEditing}
	{isFocused}
	{isSelected}
	onkeydown={handleWrapperKeyDown}
>
	{#if isEditing}
		<PopoverPrimitive.Root open={isEditing} onOpenChange={handleOpenChange}>
			<PopoverContent
				data-grid-cell-editor=""
				align="start"
				sideOffset={sideOffset}
				class="w-[300px] rounded-none p-0"
				onOpenAutoFocus={handleOpenAutoFocus}
				customAnchor={containerRef}
			>
				<Command
					class="**:data-[slot=command-input-wrapper]:h-auto **:data-[slot=command-input-wrapper]:border-none **:data-[slot=command-input-wrapper]:p-0 [&_[data-slot=command-input-wrapper]_svg]:hidden"
				>
					<div class="flex min-h-9 flex-wrap items-center gap-1 border-b px-3 py-1.5">
						{#each selectedValues as val (val)}
							{@const option = options.find((opt) => opt.value === val)}
							{@const label = option?.label ?? val}
							<Badge variant="secondary" class="h-5 gap-1 px-1.5 text-xs">
								{label}
								<button
									type="button"
									onclick={(event) => removeValue(val, event)}
									onpointerdown={(event) => {
										event.preventDefault();
										event.stopPropagation();
									}}
								>
									<X class="size-3" />
								</button>
							</Badge>
						{/each}
						<CommandInput
							bind:ref={inputRef}
							bind:value={searchValue}
							onkeydown={handleInputKeyDown}
							placeholder="Search..."
							class="h-auto flex-1 p-0"
						/>
					</div>
					<CommandList class="max-h-full">
						<CommandEmpty>No options found.</CommandEmpty>
						<CommandGroup class="max-h-[300px] scroll-py-1 overflow-y-auto overflow-x-hidden">
							{#each options as option (option.value)}
								{@const isItemSelected = selectedValues.includes(option.value)}
								<CommandItem value={option.label} onSelect={() => handleValueChange(option.value)}>
									<div
										class={cn(
											'flex size-4 items-center justify-center rounded-sm border border-primary',
											isItemSelected
												? 'bg-primary text-primary-foreground'
												: 'opacity-50 [&_svg]:invisible'
										)}
									>
										<Check class="size-3" />
									</div>
									<span>{option.label}</span>
								</CommandItem>
							{/each}
						</CommandGroup>
						{#if selectedValues.length > 0}
							<CommandSeparator />
							<CommandGroup>
								<CommandItem onSelect={clearAll} class="justify-center text-muted-foreground">
									Clear all
								</CommandItem>
							</CommandGroup>
						{/if}
					</CommandList>
				</Command>
			</PopoverContent>
		</PopoverPrimitive.Root>
	{/if}
	{#if displayItems.length > 0}
		<div class="flex flex-wrap items-center gap-1 overflow-hidden">
			{#each visibleItems as item (item.value)}
				<Badge variant="secondary" class="h-5 shrink-0 px-1.5 text-xs">
					{item.label}
				</Badge>
			{/each}
			{#if hiddenBadgeCount > 0}
				<Badge variant="outline" class="h-5 shrink-0 px-1.5 text-muted-foreground text-xs">
					+{hiddenBadgeCount}
				</Badge>
			{/if}
		</div>
	{/if}
</DataGridCellWrapper>
