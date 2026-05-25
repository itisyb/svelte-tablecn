<script lang="ts" module>
	import { DropdownMenu as DropdownMenuPrimitive } from "bits-ui";
	import type { Snippet } from "svelte";

	export type DropdownMenuPortalProps = DropdownMenuPrimitive.PortalProps & {
		children?: Snippet;
	};
</script>

<script lang="ts">
	let { children, ...restProps }: DropdownMenuPortalProps = $props();

	const portalProps = $derived(
		{
			"data-slot": "dropdown-menu-portal",
			...restProps
		} as DropdownMenuPrimitive.PortalProps & { "data-slot": string }
	);
</script>

<DropdownMenuPrimitive.Portal {...portalProps}>
	{@render children?.()}
</DropdownMenuPrimitive.Portal>
