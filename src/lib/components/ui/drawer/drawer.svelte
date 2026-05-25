<script lang="ts" module>
	import { Dialog as DialogPrimitive } from "bits-ui";
	import type { Snippet } from "svelte";
	import type { WithoutChildrenOrChild } from "$lib/utils.js";

	export type DrawerDirection = "top" | "right" | "bottom" | "left";
	export type DrawerProps = WithoutChildrenOrChild<DialogPrimitive.RootProps> & {
		children?: Snippet;
		direction?: DrawerDirection;
	};
</script>

<script lang="ts">
	import { setDrawerContext } from "./drawer-context.js";

	let { open = $bindable(false), children, direction = "bottom", ...restProps }: DrawerProps = $props();

	const rootProps = $derived(
		{
			"data-slot": "drawer",
			...restProps
		} as DialogPrimitive.RootProps & { "data-slot": string }
	);

	setDrawerContext({
		get direction() {
			return direction;
		}
	});
</script>

<DialogPrimitive.Root bind:open {...rootProps}>
	{@render children?.()}
</DialogPrimitive.Root>
