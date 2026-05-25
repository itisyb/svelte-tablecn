<script lang="ts" module>
	import { DropdownMenu as DropdownMenuPrimitive } from "bits-ui";
	import type { Snippet } from "svelte";
	import type { WithoutChildrenOrChild } from "$lib/utils.js";

	export type DropdownMenuSubProps = WithoutChildrenOrChild<DropdownMenuPrimitive.SubProps> & {
		children?: Snippet;
	};
</script>

<script lang="ts">
	let { open = $bindable(false), children, ...restProps }: DropdownMenuSubProps = $props();

	const subProps = $derived(
		{
			"data-slot": "dropdown-menu-sub",
			...restProps
		} as DropdownMenuPrimitive.SubProps & { "data-slot": string }
	);
</script>

<DropdownMenuPrimitive.Sub bind:open {...subProps}>
	{@render children?.()}
</DropdownMenuPrimitive.Sub>
