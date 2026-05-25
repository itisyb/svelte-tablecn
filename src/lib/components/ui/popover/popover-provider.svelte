<script lang="ts">
	import type { Snippet } from "svelte";
	import { setPopoverContext } from "./popover-context.js";

	let { children }: { children?: Snippet } = $props();
	let anchor = $state<HTMLElement | null>(null);
	let hasAnchor = $state(false);

	setPopoverContext({
		get anchor() {
			return anchor;
		},
		get hasAnchor() {
			return hasAnchor;
		},
		setAnchor(nextAnchor) {
			anchor = nextAnchor;
		},
		setHasAnchor(nextHasAnchor) {
			hasAnchor = nextHasAnchor;
		},
	});
</script>

{@render children?.()}
