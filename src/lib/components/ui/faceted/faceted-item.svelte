<script lang="ts">
	import type { Snippet } from "svelte";
	import type { ComponentProps } from "svelte";
	import { CommandItem } from "$lib/components/ui/command/index.js";
	import { cn, type WithoutChildrenOrChild } from "$lib/utils.js";
	import { getFacetedContext } from "./faceted-context.js";
	import Check from "@lucide/svelte/icons/check";

	type CommandItemProps = WithoutChildrenOrChild<ComponentProps<typeof CommandItem>>;

	type Props = Omit<CommandItemProps, "onSelect"> & {
		value: string;
		onSelect?: (value: string) => void;
		children?: Snippet;
	};

	let {
		value,
		onSelect,
		class: className,
		children,
		...itemProps
	}: Props = $props();

	const context = getFacetedContext("FacetedItem");
	const isSelected = $derived(
		context.multiple
			? Array.isArray(context.value) && context.value.includes(value)
			: context.value === value
	);

	function onItemSelect() {
		if (onSelect) {
			onSelect(value);
			return;
		}

		context.onItemSelect?.(value);
	}
</script>

<CommandItem
	aria-selected={isSelected}
	data-selected={isSelected}
	class={cn("gap-2", className)}
	onSelect={onItemSelect}
	{...itemProps}
>
	<span
		class={cn(
			"flex size-4 items-center justify-center rounded-sm border border-primary",
			isSelected ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible"
		)}
	>
		<Check class="size-4" />
	</span>
	{@render children?.()}
</CommandItem>
