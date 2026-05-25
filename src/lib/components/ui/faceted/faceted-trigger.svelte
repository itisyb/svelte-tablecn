<script lang="ts">
	import type { Snippet } from "svelte";
	import type { ComponentProps } from "svelte";
	import { PopoverTrigger } from "$lib/components/ui/popover/index.js";
	import { cn, type WithoutChildrenOrChild } from "$lib/utils.js";

	type Props = WithoutChildrenOrChild<ComponentProps<typeof PopoverTrigger>> & {
		children?: Snippet;
	};

	let { class: className, children, ...triggerProps }: Props = $props();
</script>

<PopoverTrigger class={cn("justify-between text-left", className)} {...triggerProps}>
	{@render children?.()}
</PopoverTrigger>
