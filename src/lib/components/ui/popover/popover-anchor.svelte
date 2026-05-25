<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";
	import type { WithElementRef } from "$lib/utils.js";

	export type PopoverAnchorProps = WithElementRef<HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
		children?: Snippet;
	};
</script>

<script lang="ts">
	import { getPopoverContext } from "./popover-context.js";

	let { ref = $bindable(null), children, ...restProps }: PopoverAnchorProps = $props();
	const context = getPopoverContext();

	context?.setHasAnchor(true);

	$effect(() => {
		context?.setAnchor(ref);

		return () => {
			if (context?.anchor === ref) context.setAnchor(null);
			context?.setHasAnchor(false);
		};
	});
</script>

<div bind:this={ref} data-slot="popover-anchor" {...restProps}>
	{@render children?.()}
</div>
