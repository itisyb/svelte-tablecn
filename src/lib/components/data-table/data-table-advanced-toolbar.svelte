<script lang="ts" generics="TData">
	import type { Table } from '@tanstack/table-core';
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/utils.js';
	import DataTableViewOptions from './data-table-view-options.svelte';

	interface Props {
		table: Table<TData>;
		children?: Snippet;
		class?: string;
	}

	let { table, children, class: className }: Props = $props();
</script>

<div
	role="toolbar"
	aria-orientation="horizontal"
	class={cn('flex w-full items-start justify-between gap-2 p-1', className)}
>
	<div class="flex flex-1 flex-wrap items-center gap-2">
		{@render children?.()}
	</div>
	<div class="flex items-center gap-2">
		<DataTableViewOptions {table} align="end" />
	</div>
</div>
