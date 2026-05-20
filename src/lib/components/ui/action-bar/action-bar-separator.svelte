<script lang="ts">
	import { cn, type WithElementRef } from '$lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';
	import {
		getActionBarContext,
		type ActionBarOrientation
	} from './action-bar-context.js';

	interface Props extends WithElementRef<HTMLAttributes<HTMLDivElement>> {
		orientation?: ActionBarOrientation;
	}

	let {
		orientation: orientationProp,
		class: className,
		ref = $bindable(null),
		...restProps
	}: Props = $props();

	const context = getActionBarContext('ActionBarSeparator');
	const orientation = $derived(orientationProp ?? context.orientation);
</script>

<div
	bind:this={ref}
	role="separator"
	aria-orientation={orientation}
	aria-hidden="true"
	data-slot="action-bar-separator"
	class={cn(
		'in-data-[slot=action-bar-selection]:ml-0.5 in-data-[slot=action-bar-selection]:h-4 in-data-[slot=action-bar-selection]:w-px bg-border',
		orientation === 'horizontal' ? 'h-6 w-px' : 'h-px w-full',
		className
	)}
	{...restProps}
></div>
