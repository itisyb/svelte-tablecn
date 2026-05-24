<script lang="ts">
	import { Calendar as CalendarPrimitive } from "bits-ui";
	import { cn } from "$lib/utils.js";

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: CalendarPrimitive.CellProps = $props();
</script>

<CalendarPrimitive.Cell
	bind:ref
	class={cn(
		"relative h-full w-full aspect-square p-0 text-center text-sm select-none focus-within:z-20 [&:first-child[data-selected]_[data-bits-day]]:rounded-s-md [&:last-child[data-selected]_[data-bits-day]]:rounded-e-md",
		className
	)}
	{...restProps}
/>
