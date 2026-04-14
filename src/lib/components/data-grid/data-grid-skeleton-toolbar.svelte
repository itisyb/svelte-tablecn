<script lang="ts">
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
	import { cn } from '$lib/utils.js';

	interface Props {
		align?: 'start' | 'center' | 'end';
		actionCount?: number;
		class?: string;
	}

	let { align = 'end', actionCount = 4, class: className }: Props = $props();

	const actionItems = $derived(Array.from({ length: actionCount }, (_, index) => index));
</script>

<div
	data-slot="grid-skeleton-toolbar"
	class={cn(
		'flex items-center gap-2',
		align === 'start' && 'justify-start',
		align === 'center' && 'justify-center',
		align === 'end' && 'justify-end',
		className
	)}
>
	{#each actionItems as action (action)}
		<Skeleton class="h-7 w-20 shrink-0" />
	{/each}
</div>
