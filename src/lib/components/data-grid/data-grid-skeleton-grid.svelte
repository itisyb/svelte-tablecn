<script lang="ts">
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
	import { cn, type WithElementRef } from '$lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends WithElementRef<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {}

	let { class: className, ref = $bindable(null), ...restProps }: Props = $props();
</script>

<Skeleton
	bind:ref
	data-slot="grid-skeleton-grid"
	class={cn('flex-1', className)}
	{...restProps}
/>
