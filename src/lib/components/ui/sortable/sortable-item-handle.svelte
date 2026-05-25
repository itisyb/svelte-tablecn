<script lang="ts" module>
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import type { Snippet } from 'svelte';
	import type { WithElementRef } from '$lib/utils.js';

	export interface SortableItemHandleProps
		extends WithElementRef<HTMLButtonAttributes, HTMLButtonElement> {
		children?: Snippet;
	}
</script>

<script lang="ts">
	import { dragHandle } from 'svelte-dnd-action';
	import { cn } from '$lib/utils.js';
	import { getSortableItemContext } from './sortable-context.js';

	let {
		children,
		disabled,
		class: className,
		ref = $bindable(null),
		...restProps
	}: SortableItemHandleProps = $props();

	const itemContext = getSortableItemContext('SortableItemHandle');
	const isDisabled = $derived(disabled ?? itemContext.disabled);

	function maybeDragHandle(node: HTMLElement) {
		if (isDisabled) return;
		return dragHandle(node);
	}
</script>

<button
	bind:this={ref}
	type="button"
	data-disabled={isDisabled ? '' : undefined}
	data-dragging={itemContext.dragging ? '' : undefined}
	data-slot="sortable-item-handle"
	class={cn(
		'select-none disabled:pointer-events-none disabled:opacity-50',
		'cursor-grab data-dragging:cursor-grabbing',
		className
	)}
	disabled={isDisabled}
	use:maybeDragHandle
	{...restProps}
>
	{@render children?.()}
</button>
