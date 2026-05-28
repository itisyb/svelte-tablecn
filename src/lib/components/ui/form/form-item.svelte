<script lang="ts">
	import { useId } from "bits-ui";
	import type { HTMLAttributes } from "svelte/elements";
	import { cn, type WithElementRef } from "$lib/utils.js";
	import { setFormItemContext } from "./form-context.js";

	const generatedId = useId();

	let {
		ref = $bindable(null),
		id: idProp = generatedId,
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>, HTMLDivElement> = $props();

	const itemId = $derived(idProp ?? generatedId);

	setFormItemContext({
		get id() {
			return itemId;
		}
	});
</script>

<div
	bind:this={ref}
	data-slot="form-item"
	class={cn("grid gap-2", className)}
	{...restProps}
>
	{@render children?.()}
</div>
