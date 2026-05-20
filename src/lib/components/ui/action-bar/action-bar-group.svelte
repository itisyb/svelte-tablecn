<script lang="ts">
	import { cn, type WithElementRef } from '$lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { Snippet } from 'svelte';
	import { getActionBarContext } from './action-bar-context.js';

	interface Props extends WithElementRef<HTMLAttributes<HTMLDivElement>> {
		children?: Snippet;
	}

	let { class: className, children, ref = $bindable(null), ...restProps }: Props = $props();

	const { orientation } = getActionBarContext('ActionBarGroup');
</script>

<div
	bind:this={ref}
	role="group"
	data-slot="action-bar-group"
	data-orientation={orientation}
	class={cn(
		'flex gap-2 outline-none',
		orientation === 'horizontal' ? 'items-center' : 'w-full flex-col items-start',
		className
	)}
	{...restProps}
>
	{@render children?.()}
</div>
