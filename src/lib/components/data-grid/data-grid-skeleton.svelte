<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn, type WithElementRef } from '$lib/utils.js';

	interface Props extends WithElementRef<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
		children?: Snippet;
	}

	let { class: className, children, ref = $bindable(null), ...restProps }: Props = $props();
</script>

<div
	bind:this={ref}
	data-slot="grid-skeleton"
	class={cn(
		'flex h-[calc(100dvh-(--spacing(16)))] w-full flex-col gap-4 has-[>[data-slot=grid-skeleton-toolbar]]:h-[calc(100dvh-(--spacing(20)))]',
		className
	)}
	{...restProps}
>
	{@render children?.()}
</div>
