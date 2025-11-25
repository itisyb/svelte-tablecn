<script lang="ts" generics="TData">
	import type { Table } from '@tanstack/table-core';
	import type { RowHeightValue } from '$lib/types/data-grid.js';
	import {
		Select,
		SelectContent,
		SelectItem,
		SelectTrigger
	} from '$lib/components/ui/select/index.js';
	import type { Component } from 'svelte';

	// Icons
	import Minus from '@lucide/svelte/icons/minus';
	import Equal from '@lucide/svelte/icons/equal';
	import AlignVerticalSpaceAround from '@lucide/svelte/icons/align-vertical-space-around';
	import ChevronsDownUp from '@lucide/svelte/icons/chevrons-down-up';

	interface RowHeightOption {
		label: string;
		value: RowHeightValue;
		icon: Component<{ class?: string }>;
	}

	const rowHeights: RowHeightOption[] = [
		{ label: 'Short', value: 'short', icon: Minus },
		{ label: 'Medium', value: 'medium', icon: Equal },
		{ label: 'Tall', value: 'tall', icon: AlignVerticalSpaceAround },
		{ label: 'Extra Tall', value: 'extra-tall', icon: ChevronsDownUp }
	];

	interface Props {
		table: Table<TData>;
		class?: string;
	}

	let { table, class: className }: Props = $props();

	const rowHeight = $derived(table.options.meta?.rowHeight ?? 'short');
	const onRowHeightChange = $derived(table.options.meta?.onRowHeightChange);

	const selectedRowHeight = $derived(
		rowHeights.find((opt) => opt.value === rowHeight) ?? rowHeights[0]
	);

	function handleValueChange(value: string) {
		onRowHeightChange?.(value as RowHeightValue);
	}
</script>

<Select type="single" value={rowHeight} onValueChange={handleValueChange}>
	<SelectTrigger size="sm" class="[&_svg:nth-child(2)]:hidden {className}">
		<span data-slot="select-value" class="flex items-center gap-2">
			{#if selectedRowHeight}
				{@const Icon = selectedRowHeight.icon}
				<Icon class="size-4" />
				{selectedRowHeight.label}
			{:else}
				Row height
			{/if}
		</span>
	</SelectTrigger>
	<SelectContent>
		{#each rowHeights as option (option.value)}
			{@const OptionIcon = option.icon}
			<SelectItem value={option.value}>
				<OptionIcon class="size-4" />
				{option.label}
			</SelectItem>
		{/each}
	</SelectContent>
</Select>
