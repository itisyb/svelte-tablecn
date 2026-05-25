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
</script>

<TooltipProvider>
	<TooltipPrimitive.Root {...restProps}>
		{@render children?.()}
	</TooltipPrimitive.Root>
</TooltipProvider>
