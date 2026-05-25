<script lang="ts" module>
	import { Toggle as TogglePrimitive } from "bits-ui";
	import type { Snippet } from "svelte";
	import { type VariantProps, tv } from "tailwind-variants";
	import { cn, type WithoutChildrenOrChild } from "$lib/utils.js";

	export const toggleVariants = tv({
		base: "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium outline-none transition-[color,box-shadow] hover:bg-muted hover:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground dark:aria-invalid:ring-destructive/40 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
		variants: {
			variant: {
				default: "bg-transparent",
				outline:
					"border border-input bg-transparent shadow-xs hover:bg-accent hover:text-accent-foreground",
			},
			size: {
				default: "h-9 min-w-9 px-2",
				sm: "h-8 min-w-8 px-1.5",
				lg: "h-10 min-w-10 px-2.5",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	});

	export type ToggleVariant = VariantProps<typeof toggleVariants>["variant"];
	export type ToggleSize = VariantProps<typeof toggleVariants>["size"];
	export type ToggleProps = WithoutChildrenOrChild<TogglePrimitive.RootProps> & {
		variant?: ToggleVariant;
		size?: ToggleSize;
		children?: Snippet;
	};
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		pressed = $bindable(false),
		class: className,
		variant = "default",
		size = "default",
		children,
		...restProps
	}: ToggleProps = $props();
</script>

<TogglePrimitive.Root
	bind:ref
	bind:pressed
	data-slot="toggle"
	class={cn(toggleVariants({ variant, size }), className)}
	{...restProps}
>
	{@render children?.()}
</TogglePrimitive.Root>
