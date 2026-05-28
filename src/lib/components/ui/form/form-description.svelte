<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";
	import { cn, type WithElementRef } from "$lib/utils.js";
	import { getFormFieldState } from "./form-context.js";

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLParagraphElement>, HTMLParagraphElement> = $props();

	const field = $derived(getFormFieldState("FormDescription"));
</script>

<p
	bind:this={ref}
	data-slot="form-description"
	id={field.formDescriptionId}
	class={cn("text-muted-foreground text-sm", className)}
	{...restProps}
>
	{@render children?.()}
</p>
