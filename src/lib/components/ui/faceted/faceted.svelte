<script lang="ts" module>
	import { Popover as PopoverPrimitive } from "bits-ui";
	import type { Snippet } from "svelte";
	import type { FacetedValue } from "./faceted-context.js";
	import { type WithoutChildrenOrChild } from "$lib/utils.js";

	export type FacetedProps = WithoutChildrenOrChild<PopoverPrimitive.RootProps> & {
		value?: FacetedValue;
		onValueChange?: (value: FacetedValue | undefined) => void;
		multiple?: boolean;
		children?: Snippet;
	};
</script>

<script lang="ts">
	import { Popover } from "$lib/components/ui/popover/index.js";
	import { setFacetedContext } from "./faceted-context.js";

	let {
		open = $bindable(false),
		onOpenChange,
		value,
		onValueChange,
		multiple = false,
		children,
		...restProps
	}: FacetedProps = $props();

	function handleOpenChange(nextOpen: boolean) {
		open = nextOpen;
		onOpenChange?.(nextOpen);
	}

	function onItemSelect(selectedValue: string) {
		if (!onValueChange) return;

		if (multiple) {
			const currentValue = Array.isArray(value) ? value : [];
			const nextValue = currentValue.includes(selectedValue)
				? currentValue.filter((item) => item !== selectedValue)
				: [...currentValue, selectedValue];
			onValueChange(nextValue);
			return;
		}

		onValueChange(value === selectedValue ? undefined : selectedValue);
		requestAnimationFrame(() => handleOpenChange(false));
	}

	setFacetedContext({
		get value() {
			return value;
		},
		get multiple() {
			return multiple;
		},
		onItemSelect,
	});
</script>

<Popover bind:open onOpenChange={handleOpenChange} {...restProps}>
	{@render children?.()}
</Popover>
