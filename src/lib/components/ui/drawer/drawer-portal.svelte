<script lang="ts" module>
	import { Dialog as DialogPrimitive } from "bits-ui";
	import type { Snippet } from "svelte";

	export type DrawerPortalProps = DialogPrimitive.PortalProps & {
		children?: Snippet;
	};
</script>

<script lang="ts">
	let { children, ...restProps }: DrawerPortalProps = $props();

	const portalProps = $derived(
		{
			"data-slot": "drawer-portal",
			...restProps
		} as DialogPrimitive.PortalProps & { "data-slot": string }
	);
</script>

<DialogPrimitive.Portal {...portalProps}>
	{@render children?.()}
</DialogPrimitive.Portal>
