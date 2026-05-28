<script lang="ts" module>
	import type { HTMLAttributes } from 'svelte/elements';
	import type { Snippet } from 'svelte';
	import type { WithElementRef } from '$lib/utils.js';
	import type { SortableValue } from './sortable-context.js';

	export interface SortableItemProps
		extends WithElementRef<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
		value: SortableValue;
		asHandle?: boolean;
		disabled?: boolean;
		children?: Snippet;
	}
</script>

<script lang="ts">
	import { dragHandle } from 'svelte-dnd-action';
	import { cn } from '$lib/utils.js';
	import { getSortableContext, setSortableItemContext } from './sortable-context.js';

	let {
		value,
		asHandle = false,
		disabled = false,
		children,
		class: className,
		ref = $bindable(null),
		...restProps
	}: SortableItemProps = $props();

	const context = getSortableContext('SortableItem');
	const isDragging = $derived(context.activeId === value);

	function maybeDragHandle(node: HTMLElement) {
		if (!asHandle || disabled) return;
		return dragHandle(node);
	}

	setSortableItemContext({
		get value() {
			return value;
		},
		get disabled() {
			return disabled;
		},
		get dragging() {
			return isDragging;
		}
	});
</script>

<div
	bind:this={ref}
	data-disabled={disabled ? '' : undefined}
	data-dragging={isDragging ? '' : undefined}
	data-slot="sortable-item"
	class={cn(
		'focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1',
		asHandle && !disabled && 'touch-none cursor-grab select-none data-dragging:cursor-grabbing',
		isDragging && 'opacity-50',
		disabled && 'pointer-events-none opacity-50',
		className
	)}
	use:maybeDragHandle
	{...restProps}
>
	{@render children?.()}
</div>
