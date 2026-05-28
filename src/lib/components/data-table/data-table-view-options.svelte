<script lang="ts" generics="TData">
	import type { Column, Table } from '@tanstack/table-core';
	import { cn } from '$lib/utils.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import {
		Command,
		CommandEmpty,
		CommandGroup,
		CommandInput,
		CommandItem,
		CommandList
	} from '$lib/components/ui/command/index.js';
	import { Popover, PopoverContent, PopoverTrigger } from '$lib/components/ui/popover/index.js';
	import type { ComponentProps } from 'svelte';

	import Check from '@lucide/svelte/icons/check';
	import Settings2 from '@lucide/svelte/icons/settings-2';

	interface Props extends ComponentProps<typeof PopoverContent> {
		table: Table<TData>;
		disabled?: boolean;
	}

	let { table, disabled = false, class: className, ...contentProps }: Props = $props();

	const columns = $derived(
		table
			.getAllColumns()
			.filter((column) => typeof column.accessorFn !== 'undefined' && column.getCanHide())
	);
	const columnVisibility = $derived(table.getState().columnVisibility);

	function isColumnVisible(column: Column<TData, unknown>): boolean {
		void columnVisibility;
		return column.getIsVisible();
	}
</script>

<Popover>
	<PopoverTrigger>
		{#snippet child({ props })}
			<Button
				{...props}
				aria-label="Toggle columns"
				role="combobox"
				variant="outline"
				size="sm"
				class="ml-auto hidden h-8 font-normal lg:flex"
				{disabled}
			>
				<Settings2 class="text-muted-foreground" />
				View
			</Button>
		{/snippet}
	</PopoverTrigger>
	<PopoverContent class={cn('w-44 p-0', className)} {...contentProps}>
		<Command>
			<CommandInput placeholder="Search columns..." />
			<CommandList>
				<CommandEmpty>No columns found.</CommandEmpty>
				<CommandGroup>
					{#each columns as column (column.id)}
						{@const isVisible = isColumnVisible(column)}
						{@const label = column.columnDef.meta?.label ?? column.id}
						<CommandItem value={label} onSelect={() => column.toggleVisibility(!isVisible)}>
							<span class="truncate">{label}</span>
							<Check
								class={cn('ml-auto size-4 shrink-0', isVisible ? 'opacity-100' : 'opacity-0')}
							/>
						</CommandItem>
					{/each}
				</CommandGroup>
			</CommandList>
		</Command>
	</PopoverContent>
</Popover>
