<script lang="ts" generics="TData">
	import type { Table, RowSelectionState } from '@tanstack/table-core';
	import type { UseDataGridReturn } from '$lib/hooks/use-data-grid.svelte.js';
	import type { RowHeightValue, CellPosition, SearchState, Direction } from '$lib/types/data-grid.js';
	import { getColumnBorderVisibility, getColumnPinningStyle, toPinningStyleString } from '$lib/data-grid.js';
	import { cn } from '$lib/utils.js';
	import { FlexRender } from '$lib/table';
	import DataGridRow from './data-grid-row.svelte';
	import DataGridColumnHeader from './data-grid-column-header.svelte';
	import DataGridSearch from './data-grid-search.svelte';
	import DataGridContextMenu from './data-grid-context-menu.svelte';
	import DataGridPasteDialog from './data-grid-paste-dialog.svelte';
	import { TooltipProvider } from '$lib/components/ui/tooltip/index.js';
	import Plus from '@lucide/svelte/icons/plus';
	import { onDestroy, setContext } from 'svelte';

	interface Props extends Omit<UseDataGridReturn<TData>, 'dir'> {
		height?: number;
		class?: string;
		dir?: Direction;
		stretchColumns?: boolean;
	}

	let {
		dataGridRef = $bindable(null),
		headerRef = $bindable(null),
		rowMapRef,
		footerRef = $bindable(null),
		table,
		rowVirtualizer,
		selectedCellsSet,
		selectionState,
		getSelectionVersion,
		getRowSelection,
		height = 600,
		searchState,
		columnSizeVars: _, // We compute this ourselves for reactivity
		onRowAdd,
		setDataGridRef,
		setHeaderRef,
		setFooterRef,
		dir = 'ltr',
		stretchColumns = false,
		class: className
	}: Props = $props();

	// Provide row selection getter via context for header checkbox reactivity
	setContext<() => RowSelectionState>('getRowSelection', getRowSelection);

	// Selection version - read from the reactive getter in selectionState
	const selectionVersion = $derived(selectionState?.version ?? 0);

	// Visibility key for {#key} block - forces re-render when visibility changes
	// This is computed locally from table state
	const visibilityKey = $derived.by(() => {
		const visibility = table.getState().columnVisibility;
		return Object.entries(visibility)
			.filter(([_, visible]) => visible === false)
			.map(([id]) => id)
			.sort()
			.join(',');
	});

	$effect(() => {
		setDataGridRef?.(dataGridRef);
	});

	$effect(() => {
		setHeaderRef?.(headerRef);
	});

	$effect(() => {
		setFooterRef?.(footerRef);
	});

	onDestroy(() => {
		setDataGridRef?.(null);
		setHeaderRef?.(null);
		setFooterRef?.(null);
	});

	const rows = $derived(table.getRowModel().rows);
	const columns = $derived(table.getAllColumns());

	const meta = $derived(table.options.meta);
	const readOnly = $derived(meta?.readOnly ?? false);
	const rowHeight = $derived<RowHeightValue>(meta?.rowHeight ?? 'short');
	const focusedCell = $derived<CellPosition | null>(meta?.focusedCell ?? null);
	// selectedCellsSet and selectionVersion are now received as props from hook return

	// Get table state reactively for pinning/visibility/sizing
	const tableState = $derived(table.getState());
	const columnPinning = $derived(tableState.columnPinning);
	const columnVisibility = $derived(tableState.columnVisibility);
	const columnSizing = $derived(tableState.columnSizing);
	const columnSizingInfo = $derived(tableState.columnSizingInfo);

	// Get visible headers reactively
	const visibleLeafColumns = $derived(table.getVisibleLeafColumns());

	// Compute total visible width (only visible columns)
	const totalVisibleWidth = $derived.by(() => {
		// Read column sizing to create reactive dependency
		const _ = columnSizing;
		const __ = columnSizingInfo;
		const ___ = columnVisibility;

		let total = 0;
		for (const col of visibleLeafColumns) {
			total += col.getSize();
		}
		return total;
	});

	const tableTotalSize = $derived.by(() => {
		const _ = columnSizing;
		const __ = columnSizingInfo;
		try {
			return table.getTotalSize();
		} catch {
			return totalVisibleWidth;
		}
	});

	const addRowWidth = $derived(Math.max(totalVisibleWidth, tableTotalSize));

	function onGridContextMenu(event: MouseEvent) {
		event.preventDefault();
	}

	function onAddRowKeyDown(event: KeyboardEvent) {
		if (!onRowAdd) return;

		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			onRowAdd();
		}
	}

	// Handle mouseup anywhere to end drag selection
	function handleGridMouseUp() {
		meta?.onCellMouseUp?.();
	}

	// Compute column size CSS variables reactively from table state
	// We read both columnSizing and columnSizingInfo to create reactive dependencies
	// columnSizingInfo updates during resize drag, columnSizing updates on release
	const columnSizeStyle = $derived.by(() => {
		// Read both states to ensure reactivity when columns are resized
		const _ = columnSizing;
		const __ = columnSizingInfo;

		const vars: string[] = [];
		try {
			const headers = table.getFlatHeaders();
			for (const header of headers) {
				const size = header.getSize();
				vars.push(`--header-${header.id}-size: ${size}`);
				vars.push(`--col-${header.column.id}-size: ${size}`);
			}
		} catch {
			// Table not ready yet
		}
		return vars.join('; ');
	});

	// Get virtual items - use getters for reactive access
	const virtualItems = $derived(rowVirtualizer.virtualItems);
	const totalSize = $derived(rowVirtualizer.totalSize);

	// Handler for global mouseup - ends drag selection even when mouse leaves grid
	function handleWindowMouseUp() {
		meta?.onCellMouseUp?.();
	}
</script>

<svelte:window onmouseup={handleWindowMouseUp} />

<TooltipProvider>
	<div
		data-slot="grid-wrapper"
		{dir}
		class={cn('relative flex w-full min-w-0 max-w-full flex-col', className)}
	>
		{#if searchState}
			<DataGridSearch
				searchOpen={searchState.searchOpen}
				searchQuery={searchState.searchQuery}
				searchMatches={searchState.searchMatches}
				matchIndex={searchState.matchIndex}
				onSearchOpenChange={searchState.onSearchOpenChange}
				onSearchQueryChange={searchState.onSearchQueryChange}
				onSearch={searchState.onSearch}
				onNavigateToNextMatch={searchState.onNavigateToNextMatch}
				onNavigateToPrevMatch={searchState.onNavigateToPrevMatch}
			/>
		{/if}

		<DataGridContextMenu {table} />

		<DataGridPasteDialog {table} />

		<div
			data-slot="grid-shell"
			class="flex w-full min-w-0 max-w-full flex-col overflow-hidden rounded-md border bg-background"
			style="max-height: {height}px;"
		>
			<div
				role="grid"
				aria-label="Data grid"
				aria-rowcount={rows.length + (onRowAdd ? 1 : 0)}
				aria-colcount={columns.length}
				data-slot="grid"
				tabindex={0}
				bind:this={dataGridRef}
				class="relative min-h-0 w-full min-w-0 flex-1 select-none overflow-auto focus:outline-none"
				style={columnSizeStyle}
				oncontextmenu={onGridContextMenu}
				onmouseup={handleGridMouseUp}
			>
			<!-- Header -->
			<div
				role="rowgroup"
				data-slot="grid-header"
				bind:this={headerRef}
				class="sticky top-0 z-10 grid border-b bg-background"
			>
				{#each table.getHeaderGroups() as headerGroup, rowIndex (headerGroup.id)}
					<div
						role="row"
						aria-rowindex={rowIndex + 1}
						data-slot="grid-header-row"
						tabindex={-1}
						class="flex w-full"
						style="width: {totalVisibleWidth}px; min-width: {totalVisibleWidth}px;"
					>
						{#each headerGroup.headers.filter((h) => columnVisibility[h.column.id] !== false) as header, colIndex (header.id)}
							{@const sorting = tableState.sorting}
							{@const currentSort = sorting.find((sort) => sort.id === header.column.id)}
							{@const isSortable = header.column.getCanSort()}
							{@const nextHeader = headerGroup.headers.filter((h) => columnVisibility[h.column.id] !== false)[colIndex + 1]}
							{@const isLastColumn = colIndex === headerGroup.headers.filter((h) => columnVisibility[h.column.id] !== false).length - 1}
							{@const borderVisibility = getColumnBorderVisibility({
								column: header.column,
								nextColumn: nextHeader?.column,
								isLastColumn
							})}
							{@const pinningStyle = toPinningStyleString(getColumnPinningStyle({ column: header.column, dir }))}

							<div
								role="columnheader"
								aria-colindex={colIndex + 1}
								aria-sort={currentSort?.desc === false
									? 'ascending'
									: currentSort?.desc === true
										? 'descending'
										: isSortable
											? 'none'
											: undefined}
								data-slot="grid-header-cell"
								tabindex={-1}
								class={cn('group relative', {
									grow: stretchColumns && header.column.id !== 'select',
									'border-e': borderVisibility.showEndBorder && header.column.id !== 'select',
									'border-s': borderVisibility.showStartBorder && header.column.id !== 'select'
								})}
								style="{pinningStyle}; width: calc(var(--header-{header.id}-size) * 1px);"
							>
								{#if header.isPlaceholder}
									<!-- Empty -->
								{:else if typeof header.column.columnDef.header === 'function'}
									<div class="size-full px-3 py-1.5">
										<FlexRender
											content={header.column.columnDef.header}
											context={header.getContext()}
										/>
									</div>
								{:else}
									<DataGridColumnHeader {header} {table} />
								{/if}
							</div>
						{/each}
					</div>
				{/each}
			</div>

			<!-- Body -->
			<div
				role="rowgroup"
				data-slot="grid-body"
				class="relative grid"
				style="height: {totalSize}px;"
			>
				{#key visibilityKey}
					{#each virtualItems as virtualItem (virtualItem.key)}
						{@const virtualRowIndex = virtualItem.index}
						{@const row = rows[virtualRowIndex]}
						{#if row}
							<DataGridRow
								{row}
								{table}
								{columnPinning}
								{columnVisibility}
								{columnSizing}
								{selectedCellsSet}
								{selectionVersion}
								{rowMapRef}
								{virtualRowIndex}
								{rowVirtualizer}
								{rowHeight}
								{focusedCell}
								{dir}
								{stretchColumns}
								virtualStart={virtualItem.start}
							/>
						{/if}
					{/each}
				{/key}
			</div>
			</div>

			<!-- Pinned add row (always visible at bottom of the grid viewport) -->
			{#if !readOnly && onRowAdd}
				<div
					role="rowgroup"
					data-slot="grid-footer"
					bind:this={footerRef}
					class="z-10 shrink-0 grid border-t bg-background"
				>
					<div
						role="row"
						aria-rowindex={rows.length + 2}
						data-slot="grid-add-row"
						tabindex={-1}
						class="flex w-full"
					>
						<div
							role="gridcell"
							tabindex={0}
							class="relative flex h-9 w-full cursor-pointer items-center bg-muted/30 transition-colors hover:bg-muted/50 focus:bg-muted/50 focus:outline-none"
							style="width: {addRowWidth}px; min-width: {addRowWidth}px;"
							onclick={(event) => void onRowAdd?.(event)}
							onkeydown={onAddRowKeyDown}
						>
							<div class="sticky start-0 flex items-center gap-2 px-3 text-muted-foreground">
								<Plus class="size-3.5" />
								<span class="text-sm">Add row</span>
							</div>
						</div>
					</div>
				</div>
			{/if}
		</div>
	</div>
</TooltipProvider>
