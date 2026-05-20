<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { DataTableSkeleton } from '$lib/components/data-table';
	import { useWindowSize } from '$lib/hooks/use-window-size.svelte.js';
	import {
		departments,
		generateDemoPeople,
		skills,
		statuses,
		type DemoPerson
	} from '$lib/demo/person-data.js';
	import { Toaster } from '$lib/components/ui/sonner';
	import ModeToggle from '$lib/components/mode-toggle.svelte';

	type DemoMode = 'grid' | 'render' | 'table';
	type TableMode = 'basic' | 'advanced';
	type AdvancedFilterUi = 'advancedFilters' | 'commandFilters';

	let demoMode = $state<DemoMode>(import.meta.env.VITEST ? 'table' : 'grid');
	let tableMode = $state<TableMode>('basic');
	let advancedFilterUi = $state<AdvancedFilterUi>('commandFilters');
	let showTableSkeleton = $state(false);

	// Table demo only needs a small slice — avoid generating 10k rows on first paint.
	const tableRows = $state<DemoPerson[]>(generateDemoPeople(200, { lite: true }));

	const windowSize = useWindowSize({ defaultHeight: 760 });
	const gridHeight = $derived(Math.max(400, windowSize.height - 150));
</script>

<div class="mx-auto flex w-full max-w-[1600px] flex-col gap-4 px-6 py-6">
	<div class="flex flex-col gap-2">
		<div class="flex items-center justify-between">
			<div>
				<h1 class="text-2xl font-bold tracking-tight">svelte-tablecn</h1>
				<p class="text-sm text-muted-foreground">
					A powerful data grid for Svelte 5. Port of <a
						href="https://tablecn.com"
						target="_blank"
						rel="noopener noreferrer"
						class="underline underline-offset-4 hover:text-foreground">tablecn.com</a
					>
				</p>
			</div>
			<div class="flex items-center gap-2">
				<a
					href="https://github.com/itisyb/svelte-tablecn"
					target="_blank"
					rel="noopener noreferrer"
					class="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
				>
					GitHub
				</a>
				<ModeToggle />
			</div>
		</div>
		<div class="flex flex-wrap items-center gap-2">
			<Button
				variant={demoMode === 'grid' ? 'default' : 'outline'}
				size="sm"
				onclick={() => (demoMode = 'grid')}
			>
				Data Grid Demo
			</Button>
			<Button
				variant={demoMode === 'render' ? 'default' : 'outline'}
				size="sm"
				onclick={() => (demoMode = 'render')}
			>
				Render Perf Demo
			</Button>
			<Button
				variant={demoMode === 'table' ? 'default' : 'outline'}
				size="sm"
				onclick={() => (demoMode = 'table')}
			>
				Data Table Demo
			</Button>
		</div>
	</div>

	{#if demoMode === 'grid'}
		{#await import('./grid-demo.svelte') then { default: GridDemo }}
			<GridDemo height={gridHeight} />
		{/await}
	{:else if demoMode === 'render'}
		{#await import('./grid-render-demo.svelte') then { default: GridRenderDemo }}
			<GridRenderDemo height={gridHeight} />
		{/await}
	{:else}
		<div
			class="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted/30 p-3"
		>
			<div class="flex flex-wrap items-center gap-2">
				<Button
					variant={tableMode === 'basic' ? 'default' : 'outline'}
					size="sm"
					onclick={() => (tableMode = 'basic')}
				>
					Basic Table
				</Button>
				<Button
					variant={tableMode === 'advanced' ? 'default' : 'outline'}
					size="sm"
					onclick={() => (tableMode = 'advanced')}
				>
					Advanced Table
				</Button>
				{#if tableMode === 'advanced'}
					<span class="mx-1 text-muted-foreground">|</span>
					<Button
						variant={advancedFilterUi === 'advancedFilters' ? 'default' : 'outline'}
						size="sm"
						onclick={() => (advancedFilterUi = 'advancedFilters')}
					>
						Filter list
					</Button>
					<Button
						variant={advancedFilterUi === 'commandFilters' ? 'default' : 'outline'}
						size="sm"
						onclick={() => (advancedFilterUi = 'commandFilters')}
					>
						Filter menu
					</Button>
				{/if}
			</div>
			<Button variant="outline" size="sm" onclick={() => (showTableSkeleton = !showTableSkeleton)}>
				{showTableSkeleton ? 'Show Live Table' : 'Show Skeleton'}
			</Button>
		</div>

		{#if showTableSkeleton}
			<DataTableSkeleton
				columnCount={8}
				filterCount={tableMode === 'basic' ? 6 : 2}
				rowCount={10}
			/>
		{:else}
			{#key `${tableMode}-${advancedFilterUi}`}
				{#await import('./data-table-showcase.svelte') then { default: DataTableShowcase }}
					<DataTableShowcase
						mode={tableMode}
						{advancedFilterUi}
						rows={tableRows}
						{departments}
						{statuses}
						{skills}
					/>
				{/await}
			{/key}
		{/if}
	{/if}
</div>

<Toaster />
