<script lang="ts">
	import { Portal } from 'bits-ui';
	import type { Snippet } from 'svelte';
	import { on } from 'svelte/events';
	import { cn, type WithElementRef } from '$lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';
	import {
		setActionBarContext,
		type ActionBarDirection,
		type ActionBarOrientation
	} from './action-bar-context.js';

	interface Props extends WithElementRef<HTMLAttributes<HTMLDivElement>> {
		open?: boolean;
		onOpenChange?: (open: boolean) => void;
		onEscapeKeyDown?: (event: KeyboardEvent) => void;
		align?: 'start' | 'center' | 'end';
		alignOffset?: number;
		side?: 'top' | 'bottom';
		sideOffset?: number;
		portalContainer?: Element | DocumentFragment | null;
		dir?: ActionBarDirection;
		orientation?: ActionBarOrientation;
		loop?: boolean;
		children?: Snippet;
	}

	let {
		open = false,
		onOpenChange,
		onEscapeKeyDown,
		side = 'bottom',
		alignOffset = 0,
		align = 'center',
		sideOffset = 16,
		portalContainer,
		dir = 'ltr',
		orientation = 'horizontal',
		loop = true,
		class: className,
		style,
		children,
		ref = $bindable(null),
		...restProps
	}: Props = $props();

	let fragmentPortalHost: HTMLDivElement | null = $state(null);
	const isFragmentPortal = $derived(isDocumentFragment(portalContainer));
	const portalTarget = $derived.by(() =>
		isDocumentFragment(portalContainer) ? 'body' : (portalContainer ?? 'body')
	);

	function isDocumentFragment(value: unknown): value is DocumentFragment {
		return typeof DocumentFragment !== 'undefined' && value instanceof DocumentFragment;
	}

	$effect(() => {
		if (!open) return;

		function onKeyDown(event: KeyboardEvent) {
			if (event.key === 'Escape') {
				onEscapeKeyDown?.(event);
				if (!event.defaultPrevented) {
					onOpenChange?.(false);
				}
			}
		}

		return on(document, 'keydown', onKeyDown);
	});

	$effect(() => {
		if (!open || !isFragmentPortal || !fragmentPortalHost || !isDocumentFragment(portalContainer)) {
			return;
		}

		portalContainer.appendChild(fragmentPortalHost);

		return () => {
			fragmentPortalHost?.remove();
		};
	});

	const positionStyle = $derived.by(() => {
		const parts: string[] = [];
		if (side === 'bottom') parts.push(`bottom: ${sideOffset}px`);
		else parts.push(`top: ${sideOffset}px`);
		if (align === 'center') parts.push('left: 50%', 'translate: -50% 0');
		else if (align === 'start') parts.push(`left: ${alignOffset}px`);
		else parts.push(`right: ${alignOffset}px`);
		return parts.join('; ');
	});

	setActionBarContext({
		get onOpenChange() {
			return onOpenChange;
		},
		get dir() {
			return dir;
		},
		get orientation() {
			return orientation;
		},
		get loop() {
			return loop;
		}
	});
</script>

{#snippet actionBarContent()}
	<div
		bind:this={ref}
		role="toolbar"
		aria-orientation={orientation}
		data-slot="action-bar"
		data-side={side}
		data-align={align}
		data-orientation={orientation}
		{dir}
		class={cn(
			'fixed z-50 rounded-lg border bg-card shadow-lg outline-none',
			'fade-in-0 zoom-in-95 animate-in duration-250 [animation-timing-function:cubic-bezier(0.16,1,0.3,1)]',
			'data-[side=bottom]:slide-in-from-bottom-4 data-[side=top]:slide-in-from-top-4',
			'motion-reduce:animate-none motion-reduce:transition-none',
			orientation === 'horizontal'
				? 'flex flex-row items-center gap-2 px-2 py-1.5'
				: 'flex flex-col items-start gap-2 px-1.5 py-2',
			className
		)}
		style={`${positionStyle}; ${typeof style === 'string' ? style : ''}`}
		{...restProps}
	>
		{@render children?.()}
	</div>
{/snippet}

{#if open}
	{#if isFragmentPortal}
		<div bind:this={fragmentPortalHost} style="display: contents;">
			{@render actionBarContent()}
		</div>
	{:else}
		<Portal to={portalTarget}>
			{@render actionBarContent()}
		</Portal>
	{/if}
{/if}
