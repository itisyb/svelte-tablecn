<script lang="ts" generics="TData">
	import type { Row, Table } from '@tanstack/table-core';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';

	interface Props {
		row: Row<TData>;
		table: Table<TData>;
		rowIndex: number;
	}

	let { row, table, rowIndex }: Props = $props();

	const isSelected = $derived(row.getIsSelected());
	const meta = $derived(table.options.meta);

	function handleChange(event: Event) {
		const target = event.target as HTMLInputElement;
		const checked = target.checked;
		const onRowSelect = meta?.onRowSelect;
		if (onRowSelect) {
			onRowSelect(rowIndex, checked, false);
		} else {
			row.toggleSelected(checked);
		}
	}

	function handleClick(event: MouseEvent) {
		if (event.shiftKey) {
			event.preventDefault();
			const onRowSelect = meta?.onRowSelect;
			if (onRowSelect) {
				onRowSelect(rowIndex, !isSelected, true);
			}
		}
	}

	function handleMouseDown(event: MouseEvent) {
		event.stopPropagation();
	}
</script>

<div
	class="flex size-full items-center justify-center px-3 py-1.5 {isSelected ? 'bg-primary/10' : ''}"
>
	<Checkbox
		aria-label="Select row"
		class="after:-inset-2.5 relative transition-[shadow,border] after:absolute after:content-[''] hover:border-primary/40"
		checked={isSelected}
		onchange={handleChange}
		onclick={handleClick}
		onmousedown={handleMouseDown}
	/>
</div>
