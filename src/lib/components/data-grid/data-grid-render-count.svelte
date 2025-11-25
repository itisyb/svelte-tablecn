<script lang="ts">
	import { cn } from '$lib/utils.js';
	import { onMount } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		label?: string;
		class?: string;
	}

	let { label = 'Grid', class: className, ...restProps }: Props = $props();

	let renderCount = $state(0);
	let mounted = $state(false);

	// Increment on each render
	renderCount += 1;

	onMount(() => {
		mounted = true;
	});
</script>

{#if mounted}
	<div
		class={cn(
			'fixed right-4 bottom-4 z-50 rounded-md border bg-background/95 px-3 py-2 font-mono text-xs shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/60',
			className
		)}
		{...restProps}
	>
		<div class="flex flex-col gap-1">
			<div class="flex items-center justify-between gap-4">
				<span class="text-muted-foreground">{label} Renders:</span>
				<span class="font-semibold tabular-nums">
					{renderCount}
				</span>
			</div>
		</div>
	</div>
{/if}
