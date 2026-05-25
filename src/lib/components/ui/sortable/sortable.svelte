<script lang="ts" module>
	import type { DndEvent } from 'svelte-dnd-action';
	import type { Snippet } from 'svelte';
	import type {
		SortableItemData,
		SortableOrientation,
		SortableValue
	} from './sortable-context.js';

	export type SortableProps<T> = {
		value: T[];
		onValueChange?: (items: T[]) => void;
		onConsider?: (event: CustomEvent<DndEvent<SortableItemData<T>>>) => void;
		onFinalize?: (event: CustomEvent<DndEvent<SortableItemData<T>>>) => void;
		getItemValue?: (item: T) => SortableValue;
		orientation?: SortableOrientation;
		children?: Snippet;
	};
</script>

<script lang="ts" generics="T">
	import { setSortableContext } from './sortable-context.js';

	let {
		value,
		onValueChange,
		onConsider,
		onFinalize,
		getItemValue,
		orientation = 'vertical',
		children
	}: SortableProps<T> = $props();

	let activeId = $state<SortableValue | null>(null);

	function resolveItemValue(item: T): SortableValue {
		if (getItemValue) return getItemValue(item);
		if (typeof item === 'string' || typeof item === 'number') return item;
		throw new Error('`getItemValue` is required when using `Sortable` with object items');
	}

	setSortableContext<T>({
		get value() {
			return value;
		},
		get orientation() {
			return orientation;
		},
		get activeId() {
			return activeId;
		},
		setActiveId(id) {
			activeId = id;
		},
		getItemValue: resolveItemValue,
		get onValueChange() {
			return onValueChange;
		},
		get onConsider() {
			return onConsider;
		},
		get onFinalize() {
			return onFinalize;
		}
	});
</script>

{@render children?.()}
