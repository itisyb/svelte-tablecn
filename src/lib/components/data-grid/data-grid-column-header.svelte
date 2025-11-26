<script lang="ts" generics="TData, TValue">
	import type { Header, Table, ColumnSort, SortDirection, SortingState } from '@tanstack/table-core';
	import type { CellOpts } from '$lib/types/data-grid.js';
	import { cn } from '$lib/utils.js';
	import {
		DropdownMenu,
		DropdownMenuCheckboxItem,
		DropdownMenuContent,
		DropdownMenuItem,
		DropdownMenuSeparator,
		DropdownMenuTrigger
	} from '$lib/components/ui/dropdown-menu/index.js';
	import { Tooltip, TooltipContent, TooltipTrigger } from '$lib/components/ui/tooltip/index.js';
	import type { Component } from 'svelte';

	// Icons
	import Baseline from '@lucide/svelte/icons/baseline';
	import TextInitial from '@lucide/svelte/icons/text';
	import Hash from '@lucide/svelte/icons/hash';
	import Link from '@lucide/svelte/icons/link';
	import CheckSquare from '@lucide/svelte/icons/check-square';
	import List from '@lucide/svelte/icons/list';
	import ListChecks from '@lucide/svelte/icons/list-checks';
	import Calendar from '@lucide/svelte/icons/calendar';
	import FileIcon from '@lucide/svelte/icons/file';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import ChevronUp from '@lucide/svelte/icons/chevron-up';
	import ArrowDown from '@lucide/svelte/icons/arrow-down';
	import ArrowUp from '@lucide/svelte/icons/arrow-up';
	import EyeOff from '@lucide/svelte/icons/eye-off';
	import Pin from '@lucide/svelte/icons/pin';
	import PinOff from '@lucide/svelte/icons/pin-off';
	import X from '@lucide/svelte/icons/x';

	interface Props {
		header: Header<TData, TValue>;
		table: Table<TData>;
		class?: string;
	}

	let { header, table, class: className }: Props = $props();

	const column = $derived(header.column);
	const label = $derived.by(() => {
		if (column.columnDef.meta?.label) {
			return column.columnDef.meta.label;
		}
		if (typeof column.columnDef.header === 'string') {
			return column.columnDef.header;
		}
		return column.id;
	});

	const isAnyColumnResizing = $derived(table.getState().columnSizingInfo?.isResizingColumn ?? false);

	const cellVariant = $derived(column.columnDef.meta?.cell);
	const columnVariant = $derived.by(() => getColumnVariant(cellVariant?.variant));

	const pinnedPosition = $derived(column.getIsPinned());
	const isPinnedLeft = $derived(pinnedPosition === 'left');
	const isPinnedRight = $derived(pinnedPosition === 'right');

	// Get current sort state for this column
	const currentSort = $derived.by(() => {
		const sortState = table.getState().sorting;
		return sortState.find((sort) => sort.id === column.id);
	});
	const isSorted = $derived(!!currentSort);
	const sortDirection = $derived(currentSort ? (currentSort.desc ? 'desc' : 'asc') : null);

	// Check if this column has an active filter
	const hasActiveFilter = $derived.by(() => {
		const filters = table.getState().columnFilters;
		return filters.some((f) => f.id === column.id);
	});

	// Safe getter for column size that handles SSR edge cases
	const columnSize = $derived.by(() => {
		try {
			return column.getSize();
		} catch {
			return column.columnDef.size ?? 150;
		}
	});

	// Safe getter for resizing state that handles SSR edge cases
	const isColumnResizing = $derived.by(() => {
		try {
			return header.column.getIsResizing();
		} catch {
			return false;
		}
	});

	// Safe getter for canResize that handles SSR edge cases
	const canResize = $derived.by(() => {
		try {
			return header.column.getCanResize();
		} catch {
			return false;
		}
	});

	function getColumnVariant(variant?: CellOpts['variant']): {
		icon: Component<{ class?: string }>;
		label: string;
	} | null {
		switch (variant) {
			case 'short-text':
				return { icon: Baseline, label: 'Short text' };
			case 'long-text':
				return { icon: TextInitial, label: 'Long text' };
			case 'number':
				return { icon: Hash, label: 'Number' };
			case 'url':
				return { icon: Link, label: 'URL' };
			case 'checkbox':
				return { icon: CheckSquare, label: 'Checkbox' };
			case 'select':
				return { icon: List, label: 'Select' };
			case 'multi-select':
				return { icon: ListChecks, label: 'Multi-select' };
			case 'date':
				return { icon: Calendar, label: 'Date' };
			case 'file':
				return { icon: FileIcon, label: 'File' };
			default:
				return null;
		}
	}

	function onSortingChange(direction: SortDirection) {
		table.setSorting((prev: SortingState) => {
			const existingSortIndex = prev.findIndex((sort) => sort.id === column.id);
			const newSort: ColumnSort = {
				id: column.id,
				desc: direction === 'desc'
			};

			if (existingSortIndex >= 0) {
				const updated = [...prev];
				updated[existingSortIndex] = newSort;
				return updated;
			} else {
				return [...prev, newSort];
			}
		});
	}

	function onSortRemove() {
		table.setSorting((prev: SortingState) => prev.filter((sort) => sort.id !== column.id));
	}

	function onLeftPin() {
		column.pin('left');
	}

	function onRightPin() {
		column.pin('right');
	}

	function onUnpin() {
		column.pin(false);
	}

	function onTriggerPointerDown(event: PointerEvent) {
		if (event.defaultPrevented) return;

		if (event.button !== 0) {
			return;
		}
		table.options.meta?.onColumnClick?.(column.id);
	}

	// Resizer
	const defaultColumnDef = $derived(table._getDefaultColumnDef());

	function onResizerDoubleClick() {
		header.column.resetSize();
	}
</script>

<DropdownMenu>
	<DropdownMenuTrigger
		class={cn(
			'flex size-full items-center justify-between gap-2 p-2 text-sm hover:bg-accent/40 data-[state=open]:bg-accent/40 [&_svg]:size-4',
			isAnyColumnResizing && 'pointer-events-none',
			className
		)}
		onpointerdown={onTriggerPointerDown}
	>
		<!-- Left side: icon + label -->
		<div class="flex min-w-0 flex-1 items-center gap-1.5">
			{#if columnVariant}
				{@const Icon = columnVariant.icon}
				<Tooltip delayDuration={100}>
					<TooltipTrigger>
						{#snippet child({ props })}
							<span {...props}>
								<Icon class="size-3.5 shrink-0 text-muted-foreground" />
							</span>
						{/snippet}
					</TooltipTrigger>
					<TooltipContent side="top">
						<p>{columnVariant.label}</p>
					</TooltipContent>
				</Tooltip>
			{/if}
			<span class="truncate">{label}</span>
			{#if hasActiveFilter}
				<span class="ml-1 size-1.5 shrink-0 rounded-full bg-primary" aria-label="Filtered"></span>
			{/if}
			{#if isSorted}
				{#if sortDirection === 'asc'}
					<ArrowUp class="size-3.5 shrink-0 text-foreground" />
				{:else}
					<ArrowDown class="size-3.5 shrink-0 text-foreground" />
				{/if}
			{/if}
		</div>
		<!-- Right side: chevron -->
		<ChevronDown class="shrink-0 text-muted-foreground" />
	</DropdownMenuTrigger>
	<DropdownMenuContent align="start" sideOffset={0} class="w-60">
		{#if column.getCanSort()}
			<DropdownMenuCheckboxItem
				class="relative pr-8 pl-2 [&>span:first-child]:right-2 [&>span:first-child]:left-auto [&_svg]:text-muted-foreground"
				checked={column.getIsSorted() === 'asc'}
				onCheckedChange={() => onSortingChange('asc')}
			>
				<ChevronUp class="mr-2 size-4" />
				Sort asc
			</DropdownMenuCheckboxItem>
			<DropdownMenuCheckboxItem
				class="relative pr-8 pl-2 [&>span:first-child]:right-2 [&>span:first-child]:left-auto [&_svg]:text-muted-foreground"
				checked={column.getIsSorted() === 'desc'}
				onCheckedChange={() => onSortingChange('desc')}
			>
				<ChevronDown class="mr-2 size-4" />
				Sort desc
			</DropdownMenuCheckboxItem>
			{#if column.getIsSorted()}
				<DropdownMenuItem onclick={onSortRemove}>
					<X class="mr-2 size-4" />
					Remove sort
				</DropdownMenuItem>
			{/if}
		{/if}
		{#if column.getCanPin()}
			{#if column.getCanSort()}
				<DropdownMenuSeparator />
			{/if}

			{#if isPinnedLeft}
				<DropdownMenuItem class="[&_svg]:text-muted-foreground" onclick={onUnpin}>
					<PinOff class="mr-2 size-4" />
					Unpin from left
				</DropdownMenuItem>
			{:else}
				<DropdownMenuItem class="[&_svg]:text-muted-foreground" onclick={onLeftPin}>
					<Pin class="mr-2 size-4" />
					Pin to left
				</DropdownMenuItem>
			{/if}
			{#if isPinnedRight}
				<DropdownMenuItem class="[&_svg]:text-muted-foreground" onclick={onUnpin}>
					<PinOff class="mr-2 size-4" />
					Unpin from right
				</DropdownMenuItem>
			{:else}
				<DropdownMenuItem class="[&_svg]:text-muted-foreground" onclick={onRightPin}>
					<Pin class="mr-2 size-4" />
					Pin to right
				</DropdownMenuItem>
			{/if}
		{/if}
		{#if column.getCanHide()}
			<DropdownMenuSeparator />
			<DropdownMenuCheckboxItem
				class="relative pr-8 pl-2 [&>span:first-child]:right-2 [&>span:first-child]:left-auto [&_svg]:text-muted-foreground"
				checked={!column.getIsVisible()}
				onCheckedChange={() => column.toggleVisibility(false)}
			>
				<EyeOff class="mr-2 size-4" />
				Hide column
			</DropdownMenuCheckboxItem>
		{/if}
	</DropdownMenuContent>
</DropdownMenu>

{#if canResize}
	<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<div
		role="separator"
		aria-orientation="vertical"
		aria-label={`Resize ${label} column`}
		aria-valuenow={columnSize}
		aria-valuemin={defaultColumnDef.minSize}
		aria-valuemax={defaultColumnDef.maxSize}
		tabindex={0}
		class={cn(
			'group-hover:opacity-100 -right-px absolute top-0 z-50 h-full w-1 cursor-col-resize touch-none select-none bg-border transition-opacity after:absolute after:inset-y-0 after:-left-1 after:h-full after:w-3 after:content-[\'\'] hover:bg-primary focus:bg-primary focus:outline-none',
			isColumnResizing ? 'bg-primary opacity-100' : 'opacity-0 hover:opacity-100'
		)}
		ondblclick={onResizerDoubleClick}
		onmousedown={header.getResizeHandler()}
		ontouchstart={header.getResizeHandler()}
	></div>
{/if}
