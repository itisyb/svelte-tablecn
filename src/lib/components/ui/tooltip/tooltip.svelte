<script lang="ts" module>
	import { Tooltip as TooltipPrimitive } from "bits-ui";
	import type { Snippet } from "svelte";
	import { type WithoutChildrenOrChild } from "$lib/utils.js";

	export type TooltipProps = WithoutChildrenOrChild<TooltipPrimitive.RootProps> & {
		children?: Snippet;
	};
</script>

<script lang="ts">
	import TooltipProvider from "./tooltip-provider.svelte";

	let { children, ...restProps }: TooltipProps = $props();

	const rootProps = $derived(
		{
			"data-slot": "tooltip",
			...restProps
		} as TooltipPrimitive.RootProps & { "data-slot": string }
	);
</script>

<TooltipProvider>
	<TooltipPrimitive.Root {...rootProps}>
		{@render children?.()}
	</TooltipPrimitive.Root>
</TooltipProvider>
