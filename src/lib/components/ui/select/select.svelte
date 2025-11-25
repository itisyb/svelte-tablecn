<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLSelectAttributes } from 'svelte/elements';

	interface Props extends HTMLSelectAttributes {
		children: Snippet;
		class?: string;
		value?: string;
	}

	let { children, class: className = '', value = $bindable(''), ...restProps }: Props = $props();
</script>

<select
	class="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 {className}"
	bind:value
	{...restProps}
>
	{@render children()}
</select>
