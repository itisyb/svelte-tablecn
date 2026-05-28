<script lang="ts" module>
	import { Dialog as DialogPrimitive } from "bits-ui";
	import type { Snippet } from "svelte";

	export type DialogPortalProps = DialogPrimitive.PortalProps & {
		children?: Snippet;
	};
</script>

<script lang="ts">
	let { children, ...restProps }: DialogPortalProps = $props();

	const portalProps = $derived(
		{
			"data-slot": "dialog-portal",
			...restProps
		} as DialogPrimitive.PortalProps & { "data-slot": string }
	);
</script>

<DialogPrimitive.Portal {...portalProps}>
	{@render children?.()}
</DialogPrimitive.Portal>
