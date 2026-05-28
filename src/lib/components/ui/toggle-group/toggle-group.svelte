<script lang="ts" module>
	import { ToggleGroup as ToggleGroupPrimitive } from "bits-ui";
	import type { Snippet } from "svelte";
	import type { ToggleSize, ToggleVariant } from "../toggle/toggle.svelte";
	import { cn, type WithoutChildrenOrChild } from "$lib/utils.js";

	export type ToggleGroupProps = WithoutChildrenOrChild<ToggleGroupPrimitive.RootProps> & {
		variant?: ToggleVariant;
		size?: ToggleSize;
		children?: Snippet;
	};
</script>

<script lang="ts">
	import { setToggleGroupContext } from "./toggle-group-context.js";

	let {
		ref = $bindable(null),
		class: className,
		variant = "default",
		size = "default",
		children,
		...restProps
	}: ToggleGroupProps = $props();

	setToggleGroupContext({
		get variant() {
			return variant;
		},
		get size() {
			return size;
		},
	});
</script>

<ToggleGroupPrimitive.Root
	bind:ref
	data-slot="toggle-group"
	data-variant={variant}
	data-size={size}
	class={cn(
		"group/toggle-group flex w-fit items-center rounded-md data-[variant=outline]:shadow-xs",
		className
	)}
	{...restProps}
>
	{@render children?.()}
</ToggleGroupPrimitive.Root>
