// TanStack Virtual integration for Svelte 5
// This creates a reactive virtualizer instance using Svelte 5 runes

import {
	Virtualizer,
	elementScroll,
	observeElementOffset,
	observeElementRect,
	observeWindowOffset,
	observeWindowRect,
	windowScroll,
	type VirtualizerOptions,
	type VirtualItem
} from '@tanstack/virtual-core';

// ============================================
// Types
// ============================================

export interface CreateVirtualizerOptions<TScrollElement extends Element | Window> {
	/** Total count of items to virtualize */
	count: number;
	/** Function to get the scroll container element */
	getScrollElement: () => TScrollElement | null;
	/** Function to estimate the size of an item */
	estimateSize: (index: number) => number;
	/** Number of items to render outside the visible area */
	overscan?: number;
	/** Padding at the start of the list */
	paddingStart?: number;
	/** Padding at the end of the list */
	paddingEnd?: number;
	/** Whether to virtualize horizontally */
	horizontal?: boolean;
	/** Function to get a unique key for an item */
	getItemKey?: (index: number) => string | number;
	/** Called when the virtualizer state changes */
	onChange?: (instance: Virtualizer<TScrollElement, Element>) => void;
	/** Initial scroll offset */
	initialOffset?: number;
	/** Whether to enable smooth scrolling */
	scrollBehavior?: ScrollBehavior;
}

export interface VirtualizerReturn<TScrollElement extends Element | Window> {
	/** Array of virtual items currently visible (plus overscan) */
	readonly virtualItems: VirtualItem[];
	/** Total size of the virtualized list in pixels */
	readonly totalSize: number;
	/** Current scroll offset */
	readonly scrollOffset: number;
	/** Whether the virtualizer is currently scrolling */
	readonly isScrolling: boolean;
	/** Scroll to a specific index */
	scrollToIndex: (
		index: number,
		options?: { align?: 'start' | 'center' | 'end'; behavior?: 'auto' | 'smooth' }
	) => void;
	/** Scroll to a specific offset */
	scrollToOffset: (offset: number, options?: { behavior?: 'auto' | 'smooth' }) => void;
	/** Measure a specific element */
	measureElement: (element: Element | null) => void;
	/** Get the virtualizer instance */
	readonly instance: Virtualizer<TScrollElement, Element> | null;
	/** Force re-measure all items */
	measure: () => void;
}

// ============================================
// Element Virtualizer
// ============================================

/**
 * Creates a reactive virtualizer for scrollable elements
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { createSvelteVirtualizer } from '$lib/virtual';
 *
 *   let scrollElement: HTMLDivElement | null = $state(null);
 *   let items = $state([...]);
 *
 *   const virtualizer = createSvelteVirtualizer({
 *     get count() { return items.length },
 *     getScrollElement: () => scrollElement,
 *     estimateSize: () => 50,
 *   });
 * </script>
 *
 * <div bind:this={scrollElement} class="h-[400px] overflow-auto">
 *   <div style:height="{virtualizer.totalSize}px" style:position="relative">
 *     {#each virtualizer.virtualItems as item (item.key)}
 *       <div
 *         style:position="absolute"
 *         style:top="{item.start}px"
 *         style:height="{item.size}px"
 *       >
 *         {items[item.index]}
 *       </div>
 *     {/each}
 *   </div>
 * </div>
 * ```
 */
export function createSvelteVirtualizer<TScrollElement extends Element>(
	options: CreateVirtualizerOptions<TScrollElement>
): VirtualizerReturn<TScrollElement> {
	// Reactive state
	let virtualItems = $state<VirtualItem[]>([]);
	let totalSize = $state(0);
	let scrollOffset = $state(0);
	let isScrolling = $state(false);

	let instance: Virtualizer<TScrollElement, Element> | null = null;

	// Effect to create/update virtualizer
	$effect(() => {
		const scrollElement = options.getScrollElement();

		if (!scrollElement) {
			virtualItems = [];
			totalSize = 0;
			scrollOffset = 0;
			instance = null;
			return;
		}

		// Create new virtualizer instance
		instance = new Virtualizer<TScrollElement, Element>({
			count: options.count,
			getScrollElement: () => scrollElement,
			estimateSize: options.estimateSize,
			overscan: options.overscan ?? 3,
			paddingStart: options.paddingStart ?? 0,
			paddingEnd: options.paddingEnd ?? 0,
			horizontal: options.horizontal ?? false,
			getItemKey: options.getItemKey,
			initialOffset: options.initialOffset,

			// Element-specific observers
			observeElementRect,
			observeElementOffset,
			scrollToFn: elementScroll,

			// Update reactive state on change
			onChange: (inst) => {
				virtualItems = inst.getVirtualItems();
				totalSize = inst.getTotalSize();
				scrollOffset = inst.scrollOffset ?? 0;
				isScrolling = inst.isScrolling;
				options.onChange?.(inst);
			}
		});

		// Trigger initial measurement
		instance._willUpdate();

		// Cleanup
		return () => {
			instance = null;
		};
	});

	return {
		get virtualItems() {
			return virtualItems;
		},
		get totalSize() {
			return totalSize;
		},
		get scrollOffset() {
			return scrollOffset;
		},
		get isScrolling() {
			return isScrolling;
		},
		get instance() {
			return instance;
		},

		scrollToIndex(index, opts) {
			instance?.scrollToIndex(index, opts as any);
		},

		scrollToOffset(offset, opts) {
			instance?.scrollToOffset(offset, opts as any);
		},

		measureElement(element) {
			if (element) {
				instance?.measureElement(element);
			}
		},

		measure() {
			instance?._willUpdate();
		}
	};
}

// ============================================
// Window Virtualizer
// ============================================

/**
 * Creates a reactive virtualizer that uses the window as the scroll container
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { createWindowVirtualizer } from '$lib/virtual';
 *
 *   let items = $state([...]);
 *
 *   const virtualizer = createWindowVirtualizer({
 *     get count() { return items.length },
 *     estimateSize: () => 50,
 *   });
 * </script>
 *
 * <div style:height="{virtualizer.totalSize}px" style:position="relative">
 *   {#each virtualizer.virtualItems as item (item.key)}
 *     <div
 *       style:position="absolute"
 *       style:top="{item.start}px"
 *       style:height="{item.size}px"
 *     >
 *       {items[item.index]}
 *     </div>
 *   {/each}
 * </div>
 * ```
 */
export function createWindowVirtualizer(
	options: Omit<CreateVirtualizerOptions<Window>, 'getScrollElement'>
): VirtualizerReturn<Window> {
	// Reactive state
	let virtualItems = $state<VirtualItem[]>([]);
	let totalSize = $state(0);
	let scrollOffset = $state(0);
	let isScrolling = $state(false);

	let instance: Virtualizer<Window, Element> | null = null;

	// Effect to create/update virtualizer
	$effect(() => {
		// Only run on client
		if (typeof window === 'undefined') {
			return;
		}

		// Create new virtualizer instance
		instance = new Virtualizer<Window, Element>({
			count: options.count,
			getScrollElement: () => window,
			estimateSize: options.estimateSize,
			overscan: options.overscan ?? 3,
			paddingStart: options.paddingStart ?? 0,
			paddingEnd: options.paddingEnd ?? 0,
			horizontal: options.horizontal ?? false,
			getItemKey: options.getItemKey,
			initialOffset: options.initialOffset,

			// Window-specific observers
			observeElementRect: observeWindowRect,
			observeElementOffset: observeWindowOffset,
			scrollToFn: windowScroll,

			// Update reactive state on change
			onChange: (inst) => {
				virtualItems = inst.getVirtualItems();
				totalSize = inst.getTotalSize();
				scrollOffset = inst.scrollOffset ?? 0;
				isScrolling = inst.isScrolling;
				options.onChange?.(inst as Virtualizer<Window, Element>);
			}
		});

		// Trigger initial measurement
		instance._willUpdate();

		// Cleanup
		return () => {
			instance = null;
		};
	});

	return {
		get virtualItems() {
			return virtualItems;
		},
		get totalSize() {
			return totalSize;
		},
		get scrollOffset() {
			return scrollOffset;
		},
		get isScrolling() {
			return isScrolling;
		},
		get instance() {
			return instance;
		},

		scrollToIndex(index, opts) {
			instance?.scrollToIndex(index, opts as any);
		},

		scrollToOffset(offset, opts) {
			instance?.scrollToOffset(offset, opts as any);
		},

		measureElement(element) {
			if (element) {
				instance?.measureElement(element);
			}
		},

		measure() {
			instance?._willUpdate();
		}
	};
}

// Re-export types from virtual-core
export type { VirtualItem, VirtualizerOptions } from '@tanstack/virtual-core';
