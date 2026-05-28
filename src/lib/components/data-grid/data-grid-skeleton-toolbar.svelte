<script lang="ts">
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
	import { cn, type WithElementRef } from '$lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends WithElementRef<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
		align?: 'start' | 'center' | 'end';
		actionCount?: number;
	}

	let {
		align = 'end',
		actionCount = 4,
		class: className,
		ref = $bindable(null),
		...restProps
	}: Props = $props();

	const actionItems = $derived(Array.from({ length: actionCount }, (_, index) => index));
</script>

<div
	bind:this={ref}
	data-slot="grid-skeleton-toolbar"
	class={cn(
		'flex items-center gap-2',
		align === 'start' && 'justify-start',
		align === 'center' && 'justify-center',
		align === 'end' && 'justify-end',
		className
	)}
	{...restProps}
>
	{#each actionItems as action (action)}
		<Skeleton class="h-7 w-20 shrink-0" />
	{/each}
</div>
