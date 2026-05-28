import type { DndEvent } from 'svelte-dnd-action';
import { getContext, setContext } from 'svelte';

export type SortableValue = string | number;
export type SortableOrientation = 'vertical' | 'horizontal' | 'mixed';
export type SortableItemData<T> = {
	id: SortableValue;
	value: T;
	_sortableIndex: number;
};

export interface SortableContextValue<T = unknown> {
	get value(): T[];
	get orientation(): SortableOrientation;
	get activeId(): SortableValue | null;
	setActiveId: (id: SortableValue | null) => void;
	getItemValue: (item: T) => SortableValue;
	onValueChange?: (items: T[]) => void;
	onConsider?: (event: CustomEvent<DndEvent<SortableItemData<T>>>) => void;
	onFinalize?: (event: CustomEvent<DndEvent<SortableItemData<T>>>) => void;
}

const SORTABLE_CONTEXT_KEY = Symbol('sortable-context');
const SORTABLE_ITEM_CONTEXT_KEY = Symbol('sortable-item-context');

export function setSortableContext<T>(context: SortableContextValue<T>) {
	setContext(SORTABLE_CONTEXT_KEY, context);
}

export function getSortableContext<T>(consumerName: string): SortableContextValue<T> {
	const context = getContext<SortableContextValue<T> | undefined>(SORTABLE_CONTEXT_KEY);
	if (!context) {
		throw new Error(`\`${consumerName}\` must be used within \`Sortable\``);
	}
	return context;
}

export interface SortableItemContextValue {
	get value(): SortableValue;
	get disabled(): boolean;
	get dragging(): boolean;
}

export function setSortableItemContext(context: SortableItemContextValue) {
	setContext(SORTABLE_ITEM_CONTEXT_KEY, context);
}

export function getSortableItemContext(consumerName: string): SortableItemContextValue {
	const context = getContext<SortableItemContextValue | undefined>(SORTABLE_ITEM_CONTEXT_KEY);
	if (!context) {
		throw new Error(`\`${consumerName}\` must be used within \`SortableItem\``);
	}
	return context;
}
