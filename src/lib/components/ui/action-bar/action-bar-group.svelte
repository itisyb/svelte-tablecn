<script lang="ts">
	import { cn, type WithElementRef } from '$lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { Snippet } from 'svelte';
	import { getActionBarContext } from './action-bar-context.js';

	interface Props extends WithElementRef<HTMLAttributes<HTMLDivElement>> {
		children?: Snippet;
	}

	let {
		class: className,
		children,
		ref = $bindable(null),
		onblur,
		onfocusout,
		onfocus,
		onkeydown,
		onmousedown,
		...restProps
	}: Props = $props();

	const { dir, orientation, loop } = getActionBarContext('ActionBarGroup');

	let isPointerFocus = false;
	let lastFocusedItem: HTMLElement | null = null;
	let isTabbingBackOut = $state(false);

	function getItems() {
		if (!ref) return [];
		return Array.from(ref.querySelectorAll<HTMLElement>('[data-action-bar-item]')).filter(
			(item) => !item.hasAttribute('disabled') && item.getAttribute('aria-disabled') !== 'true'
		);
	}

	function focusItem(item: HTMLElement | undefined) {
		item?.focus();
	}

	function getDirectionAwareKey(key: string) {
		if (dir !== 'rtl') return key;
		if (key === 'ArrowLeft') return 'ArrowRight';
		if (key === 'ArrowRight') return 'ArrowLeft';
		return key;
	}

	function handleFocus(event: FocusEvent & { currentTarget: EventTarget & HTMLDivElement }) {
		onfocus?.(event);
		if (event.defaultPrevented) return;

		const target = event.target;
		if (target instanceof HTMLElement && target.matches('[data-action-bar-item]')) {
			lastFocusedItem = target;
		} else if (event.target === event.currentTarget && !isPointerFocus) {
			const items = getItems();
			focusItem(lastFocusedItem && items.includes(lastFocusedItem) ? lastFocusedItem : items[0]);
		}

		isPointerFocus = false;
	}

	function handleBlur(event: FocusEvent & { currentTarget: EventTarget & HTMLDivElement }) {
		onblur?.(event);
		if (event.defaultPrevented) return;
		isTabbingBackOut = false;
	}

	function handleFocusOut(event: FocusEvent & { currentTarget: EventTarget & HTMLDivElement }) {
		onfocusout?.(event);
		if (event.defaultPrevented) return;
		isTabbingBackOut = false;
	}

	function handleMouseDown(event: MouseEvent & { currentTarget: EventTarget & HTMLDivElement }) {
		onmousedown?.(event);
		if (event.defaultPrevented) return;
		isPointerFocus = true;
	}

	function handleKeyDown(event: KeyboardEvent & { currentTarget: EventTarget & HTMLDivElement }) {
		onkeydown?.(event);
		if (event.defaultPrevented) return;

		const target = event.target;
		if (!(target instanceof HTMLElement) || !target.matches('[data-action-bar-item]')) return;

		if (event.key === 'Tab' && event.shiftKey) {
			isTabbingBackOut = true;
			return;
		}

		const key = getDirectionAwareKey(event.key);
		let focusIntent: 'first' | 'last' | 'prev' | 'next' | undefined;

		if (orientation === 'horizontal') {
			if (key === 'ArrowLeft') focusIntent = 'prev';
			else if (key === 'ArrowRight') focusIntent = 'next';
			else if (key === 'Home') focusIntent = 'first';
			else if (key === 'End') focusIntent = 'last';
		} else {
			if (key === 'ArrowUp') focusIntent = 'prev';
			else if (key === 'ArrowDown') focusIntent = 'next';
			else if (key === 'Home') focusIntent = 'first';
			else if (key === 'End') focusIntent = 'last';
		}

		if (focusIntent === undefined) return;
		if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;

		event.preventDefault();

		const items = getItems();
		if (items.length === 0) return;

		const currentIndex = items.indexOf(target);
		if (focusIntent === 'first') {
			focusItem(items[0]);
		} else if (focusIntent === 'last') {
			focusItem(items[items.length - 1]);
		} else if (focusIntent === 'next') {
			if (currentIndex < items.length - 1) {
				focusItem(items[currentIndex + 1]);
			} else if (loop) {
				focusItem(items[0]);
			}
		} else {
			if (currentIndex > 0) {
				focusItem(items[currentIndex - 1]);
			} else if (loop) {
				focusItem(items[items.length - 1]);
			}
		}
	}
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex - focus enters the roving action item group here. -->
<div
	bind:this={ref}
	role="group"
	data-slot="action-bar-group"
	data-orientation={orientation}
	{dir}
	tabindex={isTabbingBackOut ? -1 : 0}
	class={cn(
		'flex gap-2 outline-none',
		orientation === 'horizontal' ? 'items-center' : 'w-full flex-col items-start',
		className
	)}
	onblur={handleBlur}
	onfocusout={handleFocusOut}
	onfocus={handleFocus}
	onmousedown={handleMouseDown}
	onkeydown={handleKeyDown}
	{...restProps}
>
	{@render children?.()}
</div>
