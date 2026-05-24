<script lang="ts" generics="TData">
	import type { Table } from '@tanstack/table-core';
	import { cn } from '$lib/utils.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import {
		Select,
		SelectContent,
		SelectItem,
		SelectTrigger,
		SelectValue
	} from '$lib/components/ui/select/index.js';

	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import ChevronsLeft from '@lucide/svelte/icons/chevrons-left';
	import ChevronsRight from '@lucide/svelte/icons/chevrons-right';

	interface Props {
		table: Table<TData>;
		pageSizeOptions?: number[];
		class?: string;
	}

	let { table, pageSizeOptions = [10, 20, 30, 40, 50], class: className }: Props = $props();

	const pageSize = $derived(`${table.getState().pagination.pageSize}`);
	const pageSizeItems = $derived(
		pageSizeOptions.map((size) => ({ value: `${size}`, label: `${size}` }))
	);
	const selectedCount = $derived(table.getFilteredSelectedRowModel().rows.length);
	const filteredCount = $derived(table.getFilteredRowModel().rows.length);
	const pageIndex = $derived(table.getState().pagination.pageIndex);
	const pageCount = $derived(table.getPageCount());
</script>

<div
	class={cn(
		'flex w-full flex-col-reverse items-center justify-between gap-4 overflow-auto p-1 sm:flex-row sm:gap-8',
		className
	)}
>
	<div class="flex-1 whitespace-nowrap text-muted-foreground text-sm">
		{selectedCount} of {filteredCount} row(s) selected.
	</div>
	<div class="flex flex-col-reverse items-center gap-4 sm:flex-row sm:gap-6 lg:gap-8">
		<div class="flex items-center space-x-2">
			<p class="whitespace-nowrap font-medium text-sm">Rows per page</p>
			<Select
				type="single"
				value={pageSize}
				items={pageSizeItems}
				onValueChange={(value) => {
					if (value) table.setPageSize(Number(value));
				}}
			>
				<SelectTrigger class="h-8 w-18 data-size:h-8">
					<SelectValue placeholder={pageSize} />
				</SelectTrigger>
				<SelectContent side="top">
					{#each pageSizeOptions as option (option)}
						<SelectItem value={`${option}`} label={`${option}`}>{option}</SelectItem>
					{/each}
				</SelectContent>
			</Select>
		</div>
		<div class="flex items-center justify-center font-medium text-sm">
			Page {pageIndex + 1} of {pageCount}
		</div>
		<div class="flex items-center space-x-2">
			<Button
				aria-label="Go to first page"
				variant="outline"
				size="icon"
				class="hidden size-8 lg:flex"
				onclick={() => table.setPageIndex(0)}
				disabled={!table.getCanPreviousPage()}
			>
				<ChevronsLeft />
			</Button>
			<Button
				aria-label="Go to previous page"
				variant="outline"
				size="icon"
				class="size-8"
				onclick={() => table.previousPage()}
				disabled={!table.getCanPreviousPage()}
			>
				<ChevronLeft />
			</Button>
			<Button
				aria-label="Go to next page"
				variant="outline"
				size="icon"
				class="size-8"
				onclick={() => table.nextPage()}
				disabled={!table.getCanNextPage()}
			>
				<ChevronRight />
			</Button>
			<Button
				aria-label="Go to last page"
				variant="outline"
				size="icon"
				class="hidden size-8 lg:flex"
				onclick={() => table.setPageIndex(Math.max(table.getPageCount() - 1, 0))}
				disabled={!table.getCanNextPage()}
			>
				<ChevronsRight />
			</Button>
		</div>
	</div>
</div>
