<script lang="ts">
	import type { Table, HeaderGroup } from '@tanstack/table-core';
	import { FlexRender } from '$lib/table';
	import { dataGridStore } from '$lib/stores';

	interface Props<TData> {
		table: Table<TData>;
	}

	let { table }: Props<any> = $props();

	const headerGroups = $derived(table.getHeaderGroups());

	function handleHeaderClick(columnId: string) {
		// Select entire column
		dataGridStore.selectColumn(columnId);
	}

	function getSortIndicator(column: any): string {
		const sorted = column.getIsSorted();
		if (sorted === 'asc') return ' ↑';
		if (sorted === 'desc') return ' ↓';
		return '';
	}
</script>

<div class="sticky top-0 z-10 bg-background border-b border-border">
	{#each headerGroups as headerGroup (headerGroup.id)}
		<div class="flex">
			{#each headerGroup.headers as header (header.id)}
				<div
					role="columnheader"
					class="flex items-center p-2 font-medium text-muted-foreground bg-muted/50 border-r border-b border-border cursor-pointer select-none hover:bg-muted"
					style="width: {header.getSize()}px; min-width: {header.getSize()}px;"
					onclick={() => {
						if (header.column.getCanSort()) {
							header.column.toggleSorting();
						}
					}}
					onkeydown={(e) => {
						if (e.key === 'Enter' && header.column.getCanSort()) {
							header.column.toggleSorting();
						}
					}}
					tabindex="0"
					aria-sort={header.column.getIsSorted() === 'asc'
						? 'ascending'
						: header.column.getIsSorted() === 'desc'
							? 'descending'
							: 'none'}
				>
					{#if !header.isPlaceholder}
						<div class="flex items-center gap-1 truncate">
							<FlexRender
								content={header.column.columnDef.header}
								context={header.getContext()}
							/>
							{#if header.column.getCanSort()}
								<span class="text-xs">{getSortIndicator(header.column)}</span>
							{/if}
						</div>
					{/if}

					<!-- Column resize handle -->
					{#if header.column.getCanResize()}
						<div
							role="separator"
							class="absolute right-0 top-0 h-full w-1 cursor-col-resize bg-transparent hover:bg-primary/50"
							onmousedown={header.getResizeHandler()}
							ontouchstart={header.getResizeHandler()}
							class:bg-primary={header.column.getIsResizing()}
						></div>
					{/if}
				</div>
			{/each}
		</div>
	{/each}
</div>
