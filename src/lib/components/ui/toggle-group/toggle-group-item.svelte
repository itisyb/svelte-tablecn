<script lang="ts" module>
	import { ToggleGroup as ToggleGroupPrimitive } from "bits-ui";
	import type { Snippet } from "svelte";
	import type { ToggleSize, ToggleVariant } from "../toggle/toggle.svelte";
	import { cn, type WithoutChildrenOrChild } from "$lib/utils.js";

	export type ToggleGroupItemProps =
		WithoutChildrenOrChild<ToggleGroupPrimitive.ItemProps> & {
			variant?: ToggleVariant;
			size?: ToggleSize;
			children?: Snippet;
		};
</script>

<script lang="ts">
	import { getToggleGroupContext } from "./toggle-group-context.js";
	import { toggleVariants } from "../toggle/toggle.svelte";

	let {
		ref = $bindable(null),
		class: className,
		variant,
		size,
		children,
		...restProps
	}: ToggleGroupItemProps = $props();

	const context = getToggleGroupContext();
	const resolvedVariant = $derived(context?.variant ?? variant ?? "default");
	const resolvedSize = $derived(context?.size ?? size ?? "default");
</script>

<ToggleGroupPrimitive.Item
	bind:ref
	data-slot="toggle-group-item"
	data-variant={resolvedVariant}
	data-size={resolvedSize}
	class={cn(
		toggleVariants({ variant: resolvedVariant, size: resolvedSize }),
		"min-w-0 flex-1 shrink-0 rounded-none shadow-none first:rounded-l-md last:rounded-r-md focus:z-10 focus-visible:z-10 data-[variant=outline]:border-l-0 data-[variant=outline]:first:border-l",
		className
	)}
	{...restProps}
>
	{@render children?.()}
</ToggleGroupPrimitive.Item>
