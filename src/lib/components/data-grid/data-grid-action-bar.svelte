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
		departmentOptions?: CellSelectOption[];
		onStatusUpdate?: (value: string) => void;
		onDepartmentUpdate?: (value: string) => void;
		onDelete?: () => void;
	}

	let {
		table,
		tableMeta,
		selectedCellCount,
		statusOptions,
		departmentOptions,
		onStatusUpdate,
		onDepartmentUpdate,
		onDelete
	}: Props = $props();

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
		{#if departmentOptions && departmentOptions.length > 0 && onDepartmentUpdate}
			<DropdownMenu>
				<DropdownMenuTrigger>
					{#snippet child({ props })}
						<ActionBarItem variant="secondary" size="sm" {...props}>
							<Palette />
							Department
						</ActionBarItem>
					{/snippet}
				</DropdownMenuTrigger>
				<DropdownMenuContent data-grid-popover>
					{#each departmentOptions as option (option.value)}
						<DropdownMenuItem onclick={() => onDepartmentUpdate(option.value)}>
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
