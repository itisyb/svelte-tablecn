<script lang="ts" module>
	import { Dialog as DialogPrimitive } from "bits-ui";
	import type { Snippet } from "svelte";

	export type SheetPortalProps = DialogPrimitive.PortalProps & {
		children?: Snippet;
	};
</script>

<script lang="ts">
	let { children, ...restProps }: SheetPortalProps = $props();

	const portalProps = $derived(
		{
			"data-slot": "sheet-portal",
			...restProps
		} as DialogPrimitive.PortalProps & { "data-slot": string }
	);
</script>

<DialogPrimitive.Portal {...portalProps}>
	{@render children?.()}
</DialogPrimitive.Portal>
