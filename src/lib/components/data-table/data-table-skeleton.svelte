<script lang="ts">
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
	import {
		Table,
		TableBody,
		TableCell,
		TableHead,
		TableHeader,
		TableRow
	} from '$lib/components/ui/table/index.js';
	import { cn } from '$lib/utils.js';

	interface Props {
		columnCount: number;
		rowCount?: number;
		filterCount?: number;
		cellWidths?: string[];
		withViewOptions?: boolean;
		withPagination?: boolean;
		shrinkZero?: boolean;
		class?: string;
	}

	let {
		columnCount,
		rowCount = 10,
		filterCount = 0,
		cellWidths = ['auto'],
		withViewOptions = true,
		withPagination = true,
		shrinkZero = false,
		class: className
	}: Props = $props();

	const cozyCellWidths = $derived(
		Array.from(
			{ length: columnCount },
			(_, index) => cellWidths[index % cellWidths.length] ?? 'auto'
		)
	);
	const headerItems = $derived(Array.from({ length: columnCount }, (_, index) => index));
	const rowItems = $derived(Array.from({ length: rowCount }, (_, index) => index));
	const filterItems = $derived(Array.from({ length: filterCount }, (_, index) => index));
</script>

<div class={cn('flex w-full flex-col gap-2.5 overflow-auto', className)}>
	<div class="flex w-full items-center justify-between gap-2 overflow-auto p-1">
		<div class="flex flex-1 items-center gap-2">
			{#each filterItems as item (item)}
				<Skeleton class="h-7 w-18 border-dashed" />
			{/each}
		</div>
		{#if withViewOptions}
			<Skeleton class="ml-auto hidden h-7 w-18 lg:flex" />
		{/if}
	</div>
	<div class="rounded-md border">
		<Table>
			<TableHeader>
				<TableRow class="hover:bg-transparent">
					{#each headerItems as index (index)}
						<TableHead
							style={`width: ${cozyCellWidths[index]}; min-width: ${shrinkZero ? cozyCellWidths[index] : 'auto'};`}
						>
							<Skeleton class="h-6 w-full" />
						</TableHead>
					{/each}
				</TableRow>
			</TableHeader>
			<TableBody>
				{#each rowItems as row (row)}
					<TableRow class="hover:bg-transparent">
						{#each headerItems as index (index)}
							<TableCell
								style={`width: ${cozyCellWidths[index]}; min-width: ${shrinkZero ? cozyCellWidths[index] : 'auto'};`}
							>
								<Skeleton class="h-6 w-full" />
							</TableCell>
						{/each}
					</TableRow>
				{/each}
			</TableBody>
		</Table>
	</div>
	{#if withPagination}
		<div class="flex w-full items-center justify-between gap-4 overflow-auto p-1 sm:gap-8">
			<Skeleton class="h-7 w-40 shrink-0" />
			<div class="flex items-center gap-4 sm:gap-6 lg:gap-8">
				<div class="flex items-center gap-2">
					<Skeleton class="h-7 w-24" />
					<Skeleton class="h-7 w-18" />
				</div>
				<div class="flex items-center justify-center font-medium text-sm">
					<Skeleton class="h-7 w-20" />
				</div>
				<div class="flex items-center gap-2">
					<Skeleton class="hidden size-7 lg:block" />
					<Skeleton class="size-7" />
					<Skeleton class="size-7" />
					<Skeleton class="hidden size-7 lg:block" />
				</div>
			</div>
		</div>
	{/if}
</div>
