<script lang="ts">
	import { buttonVariants, type ButtonSize, type ButtonVariant } from '$lib/components/ui/button/index.js';
	import { cn, type WithElementRef } from '$lib/utils.js';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import type { Snippet } from 'svelte';
	import { getActionBarContext } from './action-bar-context.js';

	interface Props extends WithElementRef<HTMLButtonAttributes> {
		variant?: ButtonVariant;
		size?: ButtonSize;
		onSelect?: (event: Event) => void;
		onselect?: (event: Event) => void;
		children?: Snippet;
	}

	let {
		class: className,
		onclick,
		onSelect,
		onselect,
		variant = 'secondary',
		size = 'sm',
		children,
		ref = $bindable(null),
		tabindex = -1,
		...restProps
	}: Props = $props();

	const { onOpenChange, orientation } = getActionBarContext('ActionBarItem');
	const selectHandler = $derived(onSelect ?? onselect);

	function handleClick(event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
		onclick?.(event);
		if (event.defaultPrevented) return;

		const itemSelectEvent = new CustomEvent('actionbar.itemSelect', {
			bubbles: true,
			cancelable: true
		});
		if (selectHandler) {
			event.currentTarget.addEventListener('actionbar.itemSelect', selectHandler, { once: true });
		}
		event.currentTarget.dispatchEvent(itemSelectEvent);

		if (!itemSelectEvent.defaultPrevented) {
			onOpenChange?.(false);
		}
	}
</script>

<button
	bind:this={ref}
	type="button"
	data-slot="action-bar-item"
	data-action-bar-item=""
	tabindex={tabindex}
	class={cn(buttonVariants({ variant, size }), orientation === 'vertical' && 'w-full', className)}
	onclick={handleClick}
	{...restProps}
>
	{@render children?.()}
</button>
