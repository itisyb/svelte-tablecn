<script lang="ts">
	import type { ComponentProps } from "svelte";
	import { Label } from "$lib/components/ui/label/index.js";
	import { cn } from "$lib/utils.js";
	import { getFormFieldState } from "./form-context.js";

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: ComponentProps<typeof Label> = $props();

	const field = $derived(getFormFieldState("FormLabel"));
</script>

<Label
	bind:ref
	data-slot="form-label"
	data-error={field.invalid ? "true" : "false"}
	class={cn("data-[error=true]:text-destructive", className)}
	for={field.formItemId}
	{...restProps}
/>
