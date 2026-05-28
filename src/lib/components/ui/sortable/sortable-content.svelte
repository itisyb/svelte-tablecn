<script lang="ts" module>
	import type { HTMLAttributes } from 'svelte/elements';
	import type { Snippet } from 'svelte';
	import type { WithElementRef } from '$lib/utils.js';
	import type { SortableItemData } from './sortable-context.js';

	export interface SortableContentProps
		extends WithElementRef<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
		children?: Snippet;
		flipDurationMs?: number;
		type?: string;
	}
</script>

<script lang="ts" generics="T">
	import {
		dragHandleZone,
		SHADOW_ITEM_MARKER_PROPERTY_NAME,
		type DndEvent
	} from 'svelte-dnd-action';
	import { cn } from '$lib/utils.js';
	import { getSortableContext } from './sortable-context.js';

	let {
		children,
		flipDurationMs = 150,
		type,
		class: className,
		ref = $bindable(null),
		...restProps
	}: SortableContentProps = $props();

	const context = getSortableContext<T>('SortableContent');

	const items = $derived<SortableItemData<T>[]>(
		context.value.map((item, index) => ({
			id: context.getItemValue(item),
			value: item,
			_sortableIndex: index
		}))
	);

	function getReorderedItems(detailItems: SortableItemData<T>[]): T[] {
		return detailItems
			.filter((item) => !(item as unknown as Record<string, unknown>)[SHADOW_ITEM_MARKER_PROPERTY_NAME])
			.map((item) => item.value);
	}

	function updateActiveId(event: CustomEvent<DndEvent<SortableItemData<T>>>) {
		const trigger = event.detail.info.trigger;
		if (trigger === 'dragStarted') {
			context.setActiveId(event.detail.info.id);
		} else if (trigger === 'droppedIntoZone' || trigger === 'droppedOutsideOfAny') {
			context.setActiveId(null);
		}
	}

	function handleConsider(event: CustomEvent<DndEvent<SortableItemData<T>>>) {
		updateActiveId(event);
		context.onConsider?.(event);
		context.onValueChange?.(getReorderedItems(event.detail.items));
	}

	function handleFinalize(event: CustomEvent<DndEvent<SortableItemData<T>>>) {
		updateActiveId(event);
		context.onFinalize?.(event);
		context.onValueChange?.(getReorderedItems(event.detail.items));
	}

	const dragType = $derived(type ?? `sortable-${context.orientation}`);
</script>

<div
	bind:this={ref}
	data-slot="sortable-content"
	class={cn(className)}
	use:dragHandleZone={{
		items,
		flipDurationMs,
		dropTargetStyle: {},
		type: dragType,
		morphDisabled: context.orientation === 'mixed'
	}}
	onconsider={handleConsider}
	onfinalize={handleFinalize}
	{...restProps}
>
	{@render children?.()}
</div>
