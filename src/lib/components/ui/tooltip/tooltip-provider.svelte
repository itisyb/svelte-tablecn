<script lang="ts">
	import { Tooltip as TooltipPrimitive } from "bits-ui";

	let {
		children,
		delayDuration = 0,
		...restProps
	}: TooltipPrimitive.ProviderProps = $props();

	const providerProps = $derived(
		{
			"data-slot": "tooltip-provider",
			delayDuration,
			...restProps
		} as TooltipPrimitive.ProviderProps & { "data-slot": string }
	);
</script>

<TooltipPrimitive.Provider {...providerProps}>
	{@render children?.()}
</TooltipPrimitive.Provider>
