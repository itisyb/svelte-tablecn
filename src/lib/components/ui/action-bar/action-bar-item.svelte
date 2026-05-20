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
		children?: Snippet;
	}

	let {
		class: className,
		onclick,
		onSelect,
		variant = 'secondary',
		size = 'sm',
		children,
		ref = $bindable(null),
		...restProps
	}: Props = $props();

	const { onOpenChange, orientation } = getActionBarContext('ActionBarItem');

	function handleClick(event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
		onclick?.(event);
		if (event.defaultPrevented) return;

		const itemSelectEvent = new CustomEvent('actionbar.itemSelect', {
			bubbles: true,
			cancelable: true
		});
		event.currentTarget?.dispatchEvent(itemSelectEvent);
		onSelect?.(itemSelectEvent);

		if (!itemSelectEvent.defaultPrevented) {
			onOpenChange?.(false);
		}
	}
</script>

<button
	bind:this={ref}
	type="button"
	data-slot="action-bar-item"
	class={cn(buttonVariants({ variant, size }), orientation === 'vertical' && 'w-full', className)}
	onclick={handleClick}
	{...restProps}
>
	{@render children?.()}
</button>
