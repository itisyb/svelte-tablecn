<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";
	import { cn, type WithElementRef } from "$lib/utils.js";
	import { getFormErrorMessage, getFormFieldState } from "./form-context.js";

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLParagraphElement>, HTMLParagraphElement> = $props();

	const field = $derived(getFormFieldState("FormMessage"));
	const errorMessage = $derived(getFormErrorMessage(field.error));
	const hasChildren = $derived(Boolean(children));
</script>

{#if errorMessage || hasChildren}
	<p
		bind:this={ref}
		data-slot="form-message"
		id={field.formMessageId}
		class={cn("text-destructive text-sm", className)}
		{...restProps}
	>
		{#if errorMessage}
			{errorMessage}
		{:else}
			{@render children?.()}
		{/if}
	</p>
{/if}
