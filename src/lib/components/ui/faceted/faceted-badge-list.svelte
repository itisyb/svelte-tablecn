<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";
	import { Badge } from "$lib/components/ui/badge/index.js";
	import { cn, type WithElementRef } from "$lib/utils.js";
	import { getFacetedContext } from "./faceted-context.js";
	import ChevronsUpDown from "@lucide/svelte/icons/chevrons-up-down";

	type Option = {
		label: string;
		value: string;
	};

	interface Props extends WithElementRef<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
		options?: Option[];
		max?: number;
		badgeClassName?: string;
		placeholder?: string;
	}

	let {
		ref = $bindable(null),
		options = [],
		max = 2,
		placeholder = "Select options...",
		class: className,
		badgeClassName,
		...restProps
	}: Props = $props();

	const context = getFacetedContext("FacetedBadgeList");
	const values = $derived.by(() =>
		Array.isArray(context.value)
			? context.value
			: ([context.value].filter(Boolean) as string[])
	);

	function getLabel(value: string) {
		return options.find((option) => option.value === value)?.label ?? value;
	}
</script>

{#if values.length === 0}
	<div
		bind:this={ref}
		class="flex w-full items-center gap-1 text-muted-foreground"
		{...restProps}
	>
		{placeholder}
		<ChevronsUpDown class="ml-auto size-4 shrink-0 opacity-50" />
	</div>
{:else}
	<div bind:this={ref} class={cn("flex flex-wrap items-center gap-1", className)} {...restProps}>
		{#if values.length > max}
			<Badge variant="secondary" class={cn("rounded-sm px-1 font-normal", badgeClassName)}>
				{values.length} selected
			</Badge>
		{:else}
			{#each values as value (value)}
				<Badge variant="secondary" class={cn("rounded-sm px-1 font-normal", badgeClassName)}>
					<span class="truncate">{getLabel(value)}</span>
				</Badge>
			{/each}
		{/if}
	</div>
{/if}
