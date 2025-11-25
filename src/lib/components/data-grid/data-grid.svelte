<script lang="ts" generics="TData">
	import type { Table } from '@tanstack/table-core';
	import type { UseDataGridReturn } from '$lib/hooks/use-data-grid.svelte.js';
	import type { RowHeightValue, CellPosition, SearchState } from '$lib/types/data-grid.js';
	import { getCommonPinningStyles } from '$lib/types/data-grid.js';
	import { cn } from '$lib/utils.js';
	import { FlexRender } from '$lib/table';
	import DataGridRow from './data-grid-row.svelte';
	import DataGridColumnHeader from './data-grid-column-header.svelte';
	import DataGridSearch from './data-grid-search.svelte';
	import DataGridContextMenu from './data-grid-context-menu.svelte';
	import DataGridPasteDialog from './data-grid-paste-dialog.svelte';
	import { TooltipProvider } from '$lib/components/ui/tooltip/index.js';
	import Plus from '@lucide/svelte/icons/plus';

	interface Props extends UseDataGridReturn<TData> {
		height?: number;
		class?: string;
	}

	let {
		dataGridRef = $bindable(null),
		headerRef = $bindable(null),
		rowMapRef,
		footerRef = $bindable(null),
		table,
		rowVirtualizer,
		height = 600,
		searchState,
		columnSizeVars,
		onRowAdd,
		setDataGridRef,
		setHeaderRef,
		setFooterRef,
		class: className
	}: Props = $props();

	// Notify hook when refs change - only run once per ref
	let dataGridRefSet = false;
	let headerRefSet = false;
	let footerRefSet = false;

	$effect(() => {
		if (dataGridRef && setDataGridRef && !dataGridRefSet) {
			dataGridRefSet = true;
			setDataGridRef(dataGridRef);
		}
	});

	$effect(() => {
		if (headerRef && setHeaderRef && !headerRefSet) {
			headerRefSet = true;
			setHeaderRef(headerRef);
		}
	});

	$effect(() => {
		if (footerRef && setFooterRef && !footerRefSet) {
			footerRefSet = true;
			setFooterRef(footerRef);
		}
	});

	const rows = $derived(table.getRowModel().rows);
	const columns = $derived(table.getAllColumns());

	const meta = $derived(table.options.meta);
	const rowHeight = $derived<RowHeightValue>(meta?.rowHeight ?? 'short');
	const focusedCell = $derived<CellPosition | null>(meta?.focusedCell ?? null);

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

	// Convert columnSizeVars to style string
	const columnSizeStyle = $derived.by(() => {
		return Object.entries(columnSizeVars)
			.map(([key, value]) => `${key}: ${value}`)
			.join('; ');
	});

	// Get virtual items - use getters for reactive access
	const virtualItems = $derived(rowVirtualizer.virtualItems);
	const totalSize = $derived(rowVirtualizer.totalSize);
</script>

<TooltipProvider>
<div
	data-slot="grid-wrapper"
	class={cn('relative flex w-full flex-col', className)}
>
	{#if searchState}
		<DataGridSearch {...searchState} />
	{/if}

	<DataGridContextMenu {table} />

	<DataGridPasteDialog {table} />

	<div
		role="grid"
		aria-label="Data grid"
		aria-rowcount={rows.length + (onRowAdd ? 1 : 0)}
		aria-colcount={columns.length}
		data-slot="grid"
		tabindex={0}
		bind:this={dataGridRef}
		class="relative grid select-none overflow-auto rounded-md border focus:outline-none"
		style="{columnSizeStyle}; max-height: {height}px;"
		oncontextmenu={onGridContextMenu}
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
				>
					{#each headerGroup.headers as header, colIndex (header.id)}
						{@const sorting = table.getState().sorting}
						{@const currentSort = sorting.find((sort) => sort.id === header.column.id)}
						{@const isSortable = header.column.getCanSort()}
						{@const pinningStyles = getCommonPinningStyles({ column: header.column })}

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
							class={cn('relative', {
								'border-r': header.column.id !== 'select'
							})}
							style="position: {pinningStyles.position}; left: {pinningStyles.left}; right: {pinningStyles.right}; background: {pinningStyles.background}; z-index: {pinningStyles.zIndex}; width: calc(var(--header-{header.id}-size) * 1px);"
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
			{#each virtualItems as virtualItem (virtualItem.key)}
				{@const virtualRowIndex = virtualItem.index}
				{@const row = rows[virtualRowIndex]}
				{#if row}
					<DataGridRow
						{row}
						{rowMapRef}
						{virtualRowIndex}
						{rowVirtualizer}
						{rowHeight}
						{focusedCell}
						virtualStart={virtualItem.start}
					/>
				{/if}
			{/each}
		</div>

		<!-- Footer / Add Row -->
		{#if onRowAdd}
			<div
				role="rowgroup"
				data-slot="grid-footer"
				bind:this={footerRef}
				class="sticky bottom-0 z-10 grid border-t bg-background"
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
						class="relative flex h-9 grow items-center bg-muted/30 transition-colors hover:bg-muted/50 focus:bg-muted/50 focus:outline-none"
						style="width: {table.getTotalSize()}px; min-width: {table.getTotalSize()}px;"
						onclick={onRowAdd}
						onkeydown={onAddRowKeyDown}
					>
						<div class="sticky left-0 flex items-center gap-2 px-3 text-muted-foreground">
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
