<script lang="ts">
	import { Checkbox as CheckboxPrimitive } from 'bits-ui';
	import Check from '@lucide/svelte/icons/check';
	import Minus from '@lucide/svelte/icons/minus';
	import { cn } from '$lib/utils.js';

	type Props = CheckboxPrimitive.RootProps & {
		indeterminate?: boolean;
	};

	let {
		checked = $bindable(false),
		indeterminate = false,
		class: className,
		...restProps
	}: Props = $props();

</script>

<CheckboxPrimitive.Root
	bind:checked
	class={cn(
		'peer size-4 shrink-0 rounded-[4px] border border-input shadow-xs outline-none transition-shadow focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground',
		className
	)}
	{...restProps}
>
	{#snippet children({ checked: isChecked })}
		<div class="flex items-center justify-center text-current">
			{#if indeterminate}
				<Minus class="size-3.5" />
			{:else if isChecked}
				<Check class="size-3.5" />
			{/if}
		</div>
	{/snippet}
</CheckboxPrimitive.Root>
