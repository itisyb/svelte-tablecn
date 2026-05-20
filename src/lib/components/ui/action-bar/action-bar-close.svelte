<script lang="ts">
	import { cn, type WithElementRef } from '$lib/utils.js';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import type { Snippet } from 'svelte';
	import { getActionBarContext } from './action-bar-context.js';

	interface Props extends WithElementRef<HTMLButtonAttributes> {
		children?: Snippet;
	}

	let {
		class: className,
		onclick,
		children,
		ref = $bindable(null),
		...restProps
	}: Props = $props();

	const { onOpenChange } = getActionBarContext('ActionBarClose');

	function handleClick(event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
		onclick?.(event);
		if (event.defaultPrevented) return;
		onOpenChange?.(false);
	}
</script>

<button
	bind:this={ref}
	type="button"
	data-slot="action-bar-close"
	class={cn(
		'rounded-xs opacity-70 outline-none hover:opacity-100 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none [&_svg:not([class*=\'size-\'])]:size-3.5 [&_svg]:pointer-events-none [&_svg]:shrink-0',
		className
	)}
	onclick={handleClick}
	{...restProps}
>
	{@render children?.()}
</button>
