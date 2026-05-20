<script lang="ts">
	import { cn, type WithElementRef } from '$lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { Snippet } from 'svelte';

	interface Props extends WithElementRef<HTMLAttributes<HTMLDivElement>> {
		children?: Snippet;
	}

	let { class: className, children, ref = $bindable(null), ...restProps }: Props = $props();
</script>

<div
	bind:this={ref}
	data-slot="action-bar-selection"
	class={cn(
		'flex items-center gap-1 rounded-sm border px-2 py-1 font-medium text-sm tabular-nums',
		className
	)}
	{...restProps}
>
	{@render children?.()}
</div>
