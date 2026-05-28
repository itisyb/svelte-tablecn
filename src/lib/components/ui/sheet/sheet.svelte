<script lang="ts" module>
	import { Dialog as DialogPrimitive } from "bits-ui";
	import type { Snippet } from "svelte";
	import type { WithoutChildrenOrChild } from "$lib/utils.js";

	export type SheetProps = WithoutChildrenOrChild<DialogPrimitive.RootProps> & {
		children?: Snippet;
	};
</script>

<script lang="ts">
	let { open = $bindable(false), children, ...restProps }: SheetProps = $props();

	const rootProps = $derived(
		{
			"data-slot": "sheet",
			...restProps
		} as DialogPrimitive.RootProps & { "data-slot": string }
	);
</script>

<DialogPrimitive.Root bind:open {...rootProps}>
	{@render children?.()}
</DialogPrimitive.Root>
