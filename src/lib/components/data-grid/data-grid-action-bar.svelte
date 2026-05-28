<script lang="ts" generics="TData">
	import type { Table, TableMeta } from '@tanstack/table-core';
	import type { CellSelectOption } from '$lib/types/data-grid.js';
	import {
		ActionBar,
		ActionBarClose,
		ActionBarGroup,
		ActionBarItem,
		ActionBarSelection,
		ActionBarSeparator
	} from '$lib/components/ui/action-bar/index.js';
	import {
		DropdownMenu,
		DropdownMenuContent,
		DropdownMenuItem,
		DropdownMenuTrigger
	} from '$lib/components/ui/dropdown-menu/index.js';
	import CheckCircle2 from '@lucide/svelte/icons/circle-check';
	import Palette from '@lucide/svelte/icons/palette';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import X from '@lucide/svelte/icons/x';

	interface Props {
		table: Table<TData>;
		tableMeta: TableMeta<TData>;
		selectedCellCount: number;
		statusOptions?: CellSelectOption[];
		styleOptions?: CellSelectOption[];
		departmentOptions?: CellSelectOption[];
		onStatusUpdate?: (value: string) => void;
		onStyleUpdate?: (value: string) => void;
		onDepartmentUpdate?: (value: string) => void;
		onDelete?: () => void;
	}

	let {
		table,
		tableMeta,
		selectedCellCount,
		statusOptions,
		styleOptions,
		departmentOptions,
		onStatusUpdate,
		onStyleUpdate,
		onDepartmentUpdate,
		onDelete
	}: Props = $props();

	const secondaryOptions = $derived(styleOptions ?? departmentOptions);
	const onSecondaryUpdate = $derived(onStyleUpdate ?? onDepartmentUpdate);
	const secondaryLabel = $derived(styleOptions ? 'Style' : 'Department');

	function onOpenChange(open: boolean) {
		if (!open) {
			table.toggleAllRowsSelected(false);
			tableMeta.onSelectionClear?.();
		}
	}
</script>

<ActionBar data-grid-popover open={selectedCellCount > 0} {onOpenChange}>
	<ActionBarSelection>
		<span class="font-medium">{selectedCellCount}</span>
		<span>{selectedCellCount === 1 ? 'cell' : 'cells'} selected</span>
		<ActionBarSeparator />
		<ActionBarClose>
			<X />
		</ActionBarClose>
	</ActionBarSelection>
	<ActionBarSeparator />
	<ActionBarGroup>
		{#if statusOptions && statusOptions.length > 0 && onStatusUpdate}
			<DropdownMenu>
				<DropdownMenuTrigger>
					{#snippet child({ props })}
						<ActionBarItem variant="secondary" size="sm" {...props}>
							<CheckCircle2 />
							Status
						</ActionBarItem>
					{/snippet}
				</DropdownMenuTrigger>
				<DropdownMenuContent data-grid-popover>
					{#each statusOptions as option (option.value)}
						<DropdownMenuItem onclick={() => onStatusUpdate(option.value)}>
							{option.label}
						</DropdownMenuItem>
					{/each}
				</DropdownMenuContent>
			</DropdownMenu>
		{/if}
		{#if secondaryOptions && secondaryOptions.length > 0 && onSecondaryUpdate}
			<DropdownMenu>
				<DropdownMenuTrigger>
					{#snippet child({ props })}
						<ActionBarItem variant="secondary" size="sm" {...props}>
							<Palette />
							{secondaryLabel}
						</ActionBarItem>
					{/snippet}
				</DropdownMenuTrigger>
				<DropdownMenuContent data-grid-popover>
					{#each secondaryOptions as option (option.value)}
						<DropdownMenuItem onclick={() => onSecondaryUpdate(option.value)}>
							{option.label}
						</DropdownMenuItem>
					{/each}
				</DropdownMenuContent>
			</DropdownMenu>
		{/if}
		{#if onDelete}
			<ActionBarItem variant="destructive" size="sm" onclick={onDelete}>
				<Trash2 />
				Delete
			</ActionBarItem>
		{/if}
	</ActionBarGroup>
</ActionBar>
