<script lang="ts" module>
	import { DropdownMenu as DropdownMenuPrimitive } from "bits-ui";
	import type { Snippet } from "svelte";
	import type { WithoutChildrenOrChild } from "$lib/utils.js";

	export type DropdownMenuProps = WithoutChildrenOrChild<DropdownMenuPrimitive.RootProps> & {
		children?: Snippet;
	};
</script>

<script lang="ts">
	let { open = $bindable(false), children, ...restProps }: DropdownMenuProps = $props();

	const rootProps = $derived(
		{
			"data-slot": "dropdown-menu",
			...restProps
		} as DropdownMenuPrimitive.RootProps & { "data-slot": string }
	);
</script>

<DropdownMenuPrimitive.Root bind:open {...rootProps}>
	{@render children?.()}
</DropdownMenuPrimitive.Root>
