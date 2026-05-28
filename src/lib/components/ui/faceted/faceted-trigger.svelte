<script lang="ts">
	import type { Snippet } from "svelte";
	import type { ComponentProps } from "svelte";
	import { PopoverTrigger } from "$lib/components/ui/popover/index.js";
	import { cn, type WithoutChildrenOrChild } from "$lib/utils.js";

	type Props = WithoutChildrenOrChild<ComponentProps<typeof PopoverTrigger>> & {
		child?: Snippet<[{ props: Record<string, unknown> }]>;
		children?: Snippet;
	};

	let { class: className, child: childSnippet, children, ...triggerProps }: Props = $props();
</script>

<PopoverTrigger class={cn("justify-between text-left", className)} {...triggerProps}>
	{#snippet child({ props })}
		{#if childSnippet}
			{@render childSnippet({ props })}
		{:else}
			<button type="button" {...props}>
				{@render children?.()}
			</button>
		{/if}
	{/snippet}
</PopoverTrigger>
