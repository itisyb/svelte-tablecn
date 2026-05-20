<script lang="ts">
	import { onDestroy } from 'svelte';
	import type { ColumnDef } from '@tanstack/table-core';
	import {
		Button,
		DataGrid,
		DataGridRenderCount,
		getDataGridSelectColumn,
		getFilterFn,
		useDataGrid
	} from '$lib';
	import type { UpdateCell } from '$lib/types/data-grid.js';
	import { departments, generateDemoPeople, type DemoPerson } from '$lib/demo/person-data.js';
	import {
		Select,
		SelectContent,
		SelectGroup,
		SelectGroupHeading,
		SelectItem,
		SelectTrigger,
		SelectValue
	} from '$lib/components/ui/select/index.js';
	import Loader from '@lucide/svelte/icons/loader';
	import SquarePen from '@lucide/svelte/icons/square-pen';
	import Rocket from '@lucide/svelte/icons/rocket';

	interface Props {
		height: number;
	}

	let { height }: Props = $props();

	const ROW_COUNT = 100;
	const CELL_COUNT_OPTIONS = [1, 5, 10, 25, 50, 100, 250, 500] as const;
	const NAME_PREFIXES = ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley'] as const;
	const EMAIL_DOMAINS = [
		'gmail.com',
		'yahoo.com',
		'outlook.com',
		'icloud.com',
		'proton.me'
	] as const;
	const COLUMNS_TO_FILL = ['name', 'email', 'department', 'age', 'salary'] as const;

	let data = $state<DemoPerson[]>(generateDemoPeople(ROW_COUNT));
	let renderStats = $state({
		componentRenders: 0,
		lastUpdateTime: 0,
		cellsUpdated: 0
	});
	let cellCount = $state(50);
	let isUpdatePending = $state(false);
	let isRapidUpdating = $state(false);

	let componentRenderCount = 0;
	componentRenderCount++;

	let updateCycle = 0;

	$effect(() => {
		console.log(
			`%c[DataGridRenderTest] Component render #${componentRenderCount}`,
			'color: #ff6b6b; font-weight: bold;'
		);
	});

	const filterFn = getFilterFn<DemoPerson>();

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const columns: ColumnDef<DemoPerson, any>[] = [
		getDataGridSelectColumn<DemoPerson>(),
		{
			id: 'name',
			accessorKey: 'name',
			header: 'Name',
			minSize: 180,
			filterFn,
			meta: { label: 'Name', cell: { variant: 'short-text' } }
		},
		{
			id: 'age',
			accessorKey: 'age',
			header: 'Age',
			minSize: 100,
			filterFn,
			meta: { label: 'Age', cell: { variant: 'number', min: 18, max: 100, step: 1 } }
		},
		{
			id: 'email',
			accessorKey: 'email',
			header: 'Email',
			minSize: 240,
			filterFn,
			meta: { label: 'Email', cell: { variant: 'short-text' } }
		},
		{
			id: 'salary',
			accessorKey: 'salary',
			header: 'Salary',
			minSize: 180,
			filterFn,
			meta: { label: 'Salary', cell: { variant: 'number', min: 0, step: 1000 } }
		},
		{
			id: 'department',
			accessorKey: 'department',
			header: 'Department',
			minSize: 180,
			filterFn,
			meta: {
				label: 'Department',
				cell: {
					variant: 'select',
					options: departments.map((dept) => ({ label: dept, value: dept }))
				}
			}
		}
	];

	function onDataChange(newData: DemoPerson[]) {
		data = newData;
	}

	const { table, ...dataGridProps } = useDataGrid({
		columns,
		data: () => data,
		onDataChange,
		getRowId: (row) => row.id,
		enableSearch: true,
		enablePaste: true
	});

	const cellCountValue = $derived(String(cellCount));
	const cellCountItems = $derived(
		CELL_COUNT_OPTIONS.map((option) => ({ value: String(option), label: String(option) }))
	);

	function getCellValue(
		col: (typeof COLUMNS_TO_FILL)[number],
		rowIndex: number,
		cycle: number
	): string | number {
		switch (col) {
			case 'name':
				return `${NAME_PREFIXES[(rowIndex + cycle) % NAME_PREFIXES.length]} ${rowIndex + 1}`;
			case 'email':
				return `user${rowIndex + 1}@${EMAIL_DOMAINS[(rowIndex + cycle) % EMAIL_DOMAINS.length]}`;
			case 'department':
				return departments[(rowIndex + cycle) % departments.length] ?? 'Engineering';
			case 'age':
				return 22 + ((rowIndex + cycle * 7) % 43);
			case 'salary':
				return 40_000 + ((rowIndex + cycle) % 20) * 5000;
		}
	}

	function buildUpdates(
		count: number,
		cycle: number,
		getValue: (
			row: number,
			col: (typeof COLUMNS_TO_FILL)[number]
		) => string | number = (row, col) => getCellValue(col, row, cycle)
	): UpdateCell[] {
		const updates: UpdateCell[] = [];
		for (let i = 0; i < count; i++) {
			const rowIndex = Math.floor(i / COLUMNS_TO_FILL.length);
			const colIndex = i % COLUMNS_TO_FILL.length;
			const col = COLUMNS_TO_FILL[colIndex];
			if (!col) continue;
			updates.push({
				rowIndex,
				columnId: col,
				value: getValue(rowIndex, col)
			});
		}
		return updates;
	}

	async function onCellsUpdate(count: number) {
		if (isUpdatePending) return;

		const onDataUpdate = table.options.meta?.onDataUpdate;
		if (!onDataUpdate) return;

		isUpdatePending = true;
		const cycle = updateCycle++;
		console.log(
			`%c\n========== UPDATING ${count} CELLS (cycle ${cycle}) ==========`,
			'color: #ffd43b; font-size: 14px; font-weight: bold;'
		);

		const startTime = performance.now();
		try {
			onDataUpdate(buildUpdates(count, cycle));
			const endTime = performance.now();
			renderStats = {
				componentRenders: componentRenderCount,
				lastUpdateTime: endTime - startTime,
				cellsUpdated: count
			};
		} finally {
			isUpdatePending = false;
		}
	}

	async function onRapidCellsUpdate(count: number) {
		if (isRapidUpdating) return;

		const onDataUpdate = table.options.meta?.onDataUpdate;
		if (!onDataUpdate) return;

		console.log(
			`%c\n========== RAPID UPDATE: ${count} CELLS ==========`,
			'color: #845ef7; font-size: 14px; font-weight: bold;'
		);
		isRapidUpdating = true;
		const overallStartTime = performance.now();

		try {
			const rowsCount = Math.ceil(count / COLUMNS_TO_FILL.length);

			function buildRapidUpdates(
				startCell: number,
				endCell: number,
				getValue: (row: number, col: (typeof COLUMNS_TO_FILL)[number]) => string | number
			): UpdateCell[] {
				const updates: UpdateCell[] = [];
				for (let i = startCell; i < endCell; i++) {
					const rowIndex = Math.floor(i / COLUMNS_TO_FILL.length);
					const colIndex = i % COLUMNS_TO_FILL.length;
					const col = COLUMNS_TO_FILL[colIndex];
					if (!col || rowIndex >= rowsCount) continue;
					updates.push({
						rowIndex,
						columnId: col,
						value: getValue(rowIndex, col)
					});
				}
				return updates;
			}

			console.log(`%c[Phase 1] Marking ${count} cells as "Searching..."`, 'color: #845ef7;');
			onDataUpdate(buildRapidUpdates(0, count, () => '🔍 Searching...'));
			await new Promise((resolve) => setTimeout(resolve, 500));

			console.log('%c[Phase 2] Marking cells as "Generating..."', 'color: #845ef7;');
			onDataUpdate(buildRapidUpdates(0, count, () => '✨ Generating...'));
			await new Promise((resolve) => setTimeout(resolve, 400));

			console.log('%c[Phase 3] Marking cells as "Processing..."', 'color: #845ef7;');
			onDataUpdate(buildRapidUpdates(0, count, () => '⚙️ Processing...'));
			await new Promise((resolve) => setTimeout(resolve, 300));

			console.log('%c[Phase 4] Streaming final values...', 'color: #845ef7;');
			const chunkSize = Math.max(5, Math.floor(count / 10));
			const cycle = updateCycle++;
			for (let chunk = 0; chunk < Math.ceil(count / chunkSize); chunk++) {
				const startIdx = chunk * chunkSize;
				const endIdx = Math.min(startIdx + chunkSize, count);
				onDataUpdate(
					buildRapidUpdates(startIdx, endIdx, (row, col) => getCellValue(col, row, cycle))
				);
				await new Promise((resolve) => setTimeout(resolve, 100));
			}

			const overallEndTime = performance.now();
			console.log(
				`%c[Rapid Update Complete] Total time: ${(overallEndTime - overallStartTime).toFixed(2)}ms`,
				'color: #845ef7; font-weight: bold;'
			);

			renderStats = {
				componentRenders: componentRenderCount,
				lastUpdateTime: overallEndTime - overallStartTime,
				cellsUpdated: count
			};
		} finally {
			isRapidUpdating = false;
		}
	}

	onDestroy(() => {
		dataGridProps.setDataGridRef(null);
		dataGridProps.setHeaderRef(null);
		dataGridProps.setFooterRef(null);
	});
</script>

<div class="flex flex-col gap-4">
	<div class="rounded-lg border bg-background">
		<div class="flex items-center justify-between border-b p-6">
			<div>
				<h2 class="font-semibold text-2xl">Data Grid Render Performance Test</h2>
				<p class="mt-1 text-muted-foreground text-sm">
					Test how many times components render when updating multiple cells ({ROW_COUNT} rows)
				</p>
			</div>
			<Select
				type="single"
				value={cellCountValue}
				items={cellCountItems}
				onValueChange={(value) => {
					if (value) cellCount = Number(value);
				}}
			>
				<SelectTrigger class="w-22">
					<SelectValue placeholder={cellCountValue} />
				</SelectTrigger>
				<SelectContent>
					<SelectGroup>
						<SelectGroupHeading>Select cell count</SelectGroupHeading>
						{#each CELL_COUNT_OPTIONS as option (option)}
							<SelectItem value={String(option)} label={String(option)}>{option}</SelectItem>
						{/each}
					</SelectGroup>
				</SelectContent>
			</Select>
		</div>
		<div class="flex flex-wrap items-center justify-between gap-4 p-4">
			<div class="flex flex-wrap items-center gap-2">
				<Button
					variant="outline"
					size="sm"
					onclick={() => onCellsUpdate(cellCount)}
					disabled={isUpdatePending}
				>
					{#if isUpdatePending}
						<Loader class="animate-spin" />
					{:else}
						<SquarePen />
					{/if}
					Update
				</Button>
				<Button
					variant="outline"
					size="sm"
					onclick={() => onRapidCellsUpdate(cellCount)}
					disabled={isRapidUpdating}
				>
					{#if isRapidUpdating}
						<Loader class="animate-spin" />
					{:else}
						<Rocket />
					{/if}
					Rapid update
				</Button>
			</div>
			<div class="flex flex-wrap items-center gap-1">
				<div
					class="flex items-center gap-1.5 rounded-md bg-muted/50 px-2.5 py-1.5 text-sm"
				>
					<span class="text-muted-foreground">Renders:</span>
					<span class="tabular-nums">{renderStats.componentRenders}</span>
				</div>
				<div
					class="flex items-center gap-1.5 rounded-md bg-muted/50 px-2.5 py-1.5 text-sm"
				>
					<span class="text-muted-foreground">Cells updated:</span>
					<span class="tabular-nums">{renderStats.cellsUpdated}</span>
				</div>
				<div
					class="flex items-center gap-1.5 rounded-md bg-muted/50 px-2.5 py-1.5 text-sm"
				>
					<span class="text-muted-foreground">Time:</span>
					<span class="tabular-nums">{renderStats.lastUpdateTime.toFixed(1)}ms</span>
				</div>
			</div>
		</div>
	</div>

	<DataGrid {...dataGridProps} {table} {height} />
	<DataGridRenderCount label="Demo" />
</div>
