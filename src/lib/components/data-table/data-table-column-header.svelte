<script lang="ts" generics="TData, TValue">
	import type { Column } from '@tanstack/table-core';
	import { cn } from '$lib/utils.js';
	import type { ComponentProps } from 'svelte';
	import {
		DropdownMenu,
		DropdownMenuCheckboxItem,
		DropdownMenuContent,
		DropdownMenuItem,
		DropdownMenuTrigger
	} from '$lib/components/ui/dropdown-menu/index.js';

	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import ChevronsUpDown from '@lucide/svelte/icons/chevrons-up-down';
	import ChevronUp from '@lucide/svelte/icons/chevron-up';
	import EyeOff from '@lucide/svelte/icons/eye-off';
	import X from '@lucide/svelte/icons/x';

	interface Props extends ComponentProps<typeof DropdownMenuTrigger> {
		column: Column<TData, TValue>;
		label: string;
	}

	let { column, label, class: className, ...triggerProps }: Props = $props();
</script>

{#if !column.getCanSort() && !column.getCanHide()}
	<div class={cn(className)}>{label}</div>
{:else}
	<DropdownMenu>
		<DropdownMenuTrigger
			class={cn(
				'-ml-1.5 flex h-8 items-center gap-1.5 rounded-md px-2 py-1.5 hover:bg-accent focus:outline-none focus:ring-1 focus:ring-ring data-[state=open]:bg-accent [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-muted-foreground',
				className
			)}
			{...triggerProps}
		>
			{label}
			{#if column.getCanSort()}
				{#if column.getIsSorted() === 'desc'}
					<ChevronDown />
				{:else if column.getIsSorted() === 'asc'}
					<ChevronUp />
				{:else}
					<ChevronsUpDown />
				{/if}
			{/if}
		</DropdownMenuTrigger>
		<DropdownMenuContent align="start" class="w-28">
			{#if column.getCanSort()}
				<DropdownMenuCheckboxItem
					class="relative pr-8 pl-2 [&>span:first-child]:right-2 [&>span:first-child]:left-auto [&_svg]:text-muted-foreground"
					checked={column.getIsSorted() === 'asc'}
					onclick={() => column.toggleSorting(false)}
				>
					<ChevronUp />
					Asc
				</DropdownMenuCheckboxItem>
				<DropdownMenuCheckboxItem
					class="relative pr-8 pl-2 [&>span:first-child]:right-2 [&>span:first-child]:left-auto [&_svg]:text-muted-foreground"
					checked={column.getIsSorted() === 'desc'}
					onclick={() => column.toggleSorting(true)}
				>
					<ChevronDown />
					Desc
				</DropdownMenuCheckboxItem>
				{#if column.getIsSorted()}
					<DropdownMenuItem
						class="pl-2 [&_svg]:text-muted-foreground"
						onclick={() => column.clearSorting()}
					>
						<X />
						Reset
					</DropdownMenuItem>
				{/if}
			{/if}
			{#if column.getCanHide()}
				<DropdownMenuCheckboxItem
					class="relative pr-8 pl-2 [&>span:first-child]:right-2 [&>span:first-child]:left-auto [&_svg]:text-muted-foreground"
					checked={!column.getIsVisible()}
					onclick={() => column.toggleVisibility(false)}
				>
					<EyeOff />
					Hide
				</DropdownMenuCheckboxItem>
			{/if}
		</DropdownMenuContent>
	</DropdownMenu>
{/if}
