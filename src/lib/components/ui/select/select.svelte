<script lang="ts" module>
	import { Select as SelectPrimitive } from "bits-ui";
	import type { Snippet } from "svelte";
	import type { WithoutChildrenOrChild } from "$lib/utils.js";

	export type SelectProps = WithoutChildrenOrChild<SelectPrimitive.RootProps> & {
		children?: Snippet;
	};
</script>

<script lang="ts">
	let { open = $bindable(false), children, ...restProps }: SelectProps = $props();

	const rootProps = $derived(
		{
			"data-slot": "select",
			...restProps
		} as SelectPrimitive.RootProps & { "data-slot": string }
	);
</script>

<SelectPrimitive.Root bind:open {...rootProps}>
	{@render children?.()}
</SelectPrimitive.Root>
