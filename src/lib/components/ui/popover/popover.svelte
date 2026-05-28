<script lang="ts" module>
	import { Popover as PopoverPrimitive } from "bits-ui";
	import type { Snippet } from "svelte";
	import type { WithoutChildrenOrChild } from "$lib/utils.js";

	export type PopoverProps = WithoutChildrenOrChild<PopoverPrimitive.RootProps> & {
		children?: Snippet;
	};
</script>

<script lang="ts">
	import PopoverProvider from "./popover-provider.svelte";

	let { open = $bindable(false), children, ...restProps }: PopoverProps = $props();

	const rootProps = $derived(
		{
			"data-slot": "popover",
			...restProps
		} as PopoverPrimitive.RootProps & { "data-slot": string }
	);
</script>

<PopoverPrimitive.Root bind:open {...rootProps}>
	<PopoverProvider>
		{@render children?.()}
	</PopoverProvider>
</PopoverPrimitive.Root>
