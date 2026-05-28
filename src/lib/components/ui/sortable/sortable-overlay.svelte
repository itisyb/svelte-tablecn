<script lang="ts" module>
	import type { HTMLAttributes } from 'svelte/elements';
	import type { Snippet } from 'svelte';
	import type { WithElementRef } from '$lib/utils.js';
	import type { SortableValue } from './sortable-context.js';

	export interface SortableOverlayProps
		extends WithElementRef<Omit<HTMLAttributes<HTMLDivElement>, 'children'>, HTMLDivElement> {
		children?: Snippet<[{ value: SortableValue }]>;
	}
</script>

<script lang="ts">
	import { cn } from '$lib/utils.js';
	import { getSortableContext } from './sortable-context.js';

	let {
		children,
		class: className,
		ref = $bindable(null),
		...restProps
	}: SortableOverlayProps = $props();

	const context = getSortableContext('SortableOverlay');
</script>

{#if context.activeId !== null}
	<div
		bind:this={ref}
		data-slot="sortable-overlay"
		class={cn('pointer-events-none cursor-grabbing', className)}
		{...restProps}
	>
		{@render children?.({ value: context.activeId })}
	</div>
{/if}
