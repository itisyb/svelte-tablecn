<script lang="ts">
	import { cn } from '$lib/utils.js';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLElement> {
		class?: string;
		children?: Snippet;
	}

	let { class: className, children, ...restProps }: Props = $props();
</script>

<kbd
	data-slot="kbd-group"
	class={cn('inline-flex items-center gap-1', className)}
	{...restProps}
>
	{@render children?.()}
</kbd>
