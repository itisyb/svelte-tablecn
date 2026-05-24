<script lang="ts" generics="TData">
	import type { Table } from '@tanstack/table-core';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils.js';
	import type { WithElementRef } from '$lib/utils.js';
	import DataTableViewOptions from './data-table-view-options.svelte';

	interface Props extends WithElementRef<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
		table: Table<TData>;
		children?: Snippet;
	}

	let { table, children, class: className, ref = $bindable(null), ...restProps }: Props = $props();
</script>

<div
	bind:this={ref}
	role="toolbar"
	aria-orientation="horizontal"
	class={cn('flex w-full items-start justify-between gap-2 p-1', className)}
	{...restProps}
>
	<div class="flex flex-1 flex-wrap items-center gap-2">
		{@render children?.()}
	</div>
	<div class="flex items-center gap-2">
		<DataTableViewOptions {table} align="end" />
	</div>
</div>
