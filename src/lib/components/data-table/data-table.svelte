<script lang="ts" generics="TData">
	import type { Table as TanstackTable } from '@tanstack/table-core';
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/utils.js';
	import {
		Table,
		TableBody,
		TableCell,
		TableHead,
		TableHeader,
		TableRow
	} from '$lib/components/ui/table/index.js';
	import { FlexRender } from '$lib/table';
	import { getColumnPinningStyle } from '$lib/data-table.js';
	import DataTablePagination from './data-table-pagination.svelte';

	interface Props {
		table: TanstackTable<TData>;
		actionBar?: Snippet;
		children?: Snippet;
		class?: string;
	}

	let { table, actionBar, children, class: className }: Props = $props();

	const headerGroups = $derived(table.getHeaderGroups());
	const rows = $derived(table.getRowModel().rows);
	const selectedRowCount = $derived(table.getFilteredSelectedRowModel().rows.length);

	function toStyleString(styles: Record<string, string | number | undefined>): string {
		return Object.entries(styles)
			.filter(([, value]) => value !== undefined)
			.map(([key, value]) => `${key}: ${value}`)
			.join('; ');
	}
</script>

<div class={cn('flex w-full flex-col gap-2.5 overflow-auto', className)}>
	{@render children?.()}
	<div class="overflow-hidden rounded-md border">
		<Table>
			<TableHeader>
				{#each headerGroups as headerGroup (headerGroup.id)}
					<TableRow>
						{#each headerGroup.headers as header (header.id)}
							<TableHead
								colspan={header.colSpan}
								style={toStyleString(getColumnPinningStyle({ column: header.column }))}
							>
								{#if !header.isPlaceholder}
									<FlexRender
										content={header.column.columnDef.header}
										context={header.getContext()}
									/>
								{/if}
							</TableHead>
						{/each}
					</TableRow>
				{/each}
			</TableHeader>
			<TableBody>
				{#if rows.length > 0}
					{#each rows as row (row.id)}
						<TableRow data-state={row.getIsSelected() ? 'selected' : undefined}>
							{#each row.getVisibleCells() as cell (cell.id)}
								<TableCell style={toStyleString(getColumnPinningStyle({ column: cell.column }))}>
									<FlexRender content={cell.column.columnDef.cell} context={cell.getContext()} />
								</TableCell>
							{/each}
						</TableRow>
					{/each}
				{:else}
					<TableRow>
						<TableCell colspan={table.getAllColumns().length} class="h-24 text-center">
							No results.
						</TableCell>
					</TableRow>
				{/if}
			</TableBody>
		</Table>
	</div>
	<div class="flex flex-col gap-2.5">
		<DataTablePagination {table} />
		{#if actionBar && selectedRowCount > 0}
			{@render actionBar()}
		{/if}
	</div>
</div>
