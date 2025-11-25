<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';

	interface Props extends Omit<HTMLInputAttributes, 'type'> {
		class?: string;
		checked?: boolean;
		indeterminate?: boolean;
	}

	let {
		class: className = '',
		checked = $bindable(false),
		indeterminate = false,
		...restProps
	}: Props = $props();

	let inputRef: HTMLInputElement | undefined = $state();

	$effect(() => {
		if (inputRef) {
			inputRef.indeterminate = indeterminate;
		}
	});
</script>

<div class="relative inline-flex items-center">
	<input
		bind:this={inputRef}
		type="checkbox"
		bind:checked
		class="peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 accent-primary {className}"
		{...restProps}
	/>
</div>
