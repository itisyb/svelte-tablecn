<script lang="ts" module>
	import { Dialog as DialogPrimitive } from "bits-ui";
	import type { Snippet } from "svelte";
	import type { WithoutChildrenOrChild } from "$lib/utils.js";
	import type { DrawerDirection } from "./drawer.svelte";

	export type DrawerContentProps = WithoutChildrenOrChild<DialogPrimitive.ContentProps> & {
		children?: Snippet;
		portalProps?: DialogPrimitive.PortalProps;
		direction?: DrawerDirection;
	};
</script>

<script lang="ts">
	import * as Drawer from "./index.js";
	import { cn } from "$lib/utils.js";
	import { getDrawerContext } from "./drawer-context.js";

	let {
		ref = $bindable(null),
		class: className,
		portalProps,
		children,
		direction: directionProp,
		...restProps
	}: DrawerContentProps = $props();

	const drawer = getDrawerContext("DrawerContent");
	const direction = $derived(directionProp ?? drawer.direction);
</script>

<Drawer.Portal {...portalProps}>
	<Drawer.Overlay />
	<DialogPrimitive.Content
		bind:ref
		data-slot="drawer-content"
		data-vaul-drawer-direction={direction}
		class={cn(
			"group/drawer-content fixed z-50 flex h-auto flex-col bg-background",
			"data-[vaul-drawer-direction=top]:inset-x-0 data-[vaul-drawer-direction=top]:top-0 data-[vaul-drawer-direction=top]:mb-24 data-[vaul-drawer-direction=top]:max-h-[80vh] data-[vaul-drawer-direction=top]:rounded-b-lg data-[vaul-drawer-direction=top]:border-b data-[vaul-drawer-direction=top]:data-[state=closed]:slide-out-to-top data-[vaul-drawer-direction=top]:data-[state=open]:slide-in-from-top",
			"data-[vaul-drawer-direction=bottom]:inset-x-0 data-[vaul-drawer-direction=bottom]:bottom-0 data-[vaul-drawer-direction=bottom]:mt-24 data-[vaul-drawer-direction=bottom]:max-h-[80vh] data-[vaul-drawer-direction=bottom]:rounded-t-lg data-[vaul-drawer-direction=bottom]:border-t data-[vaul-drawer-direction=bottom]:data-[state=closed]:slide-out-to-bottom data-[vaul-drawer-direction=bottom]:data-[state=open]:slide-in-from-bottom",
			"data-[vaul-drawer-direction=right]:inset-y-0 data-[vaul-drawer-direction=right]:right-0 data-[vaul-drawer-direction=right]:w-3/4 data-[vaul-drawer-direction=right]:border-l data-[vaul-drawer-direction=right]:sm:max-w-sm data-[vaul-drawer-direction=right]:data-[state=closed]:slide-out-to-right data-[vaul-drawer-direction=right]:data-[state=open]:slide-in-from-right",
			"data-[vaul-drawer-direction=left]:inset-y-0 data-[vaul-drawer-direction=left]:left-0 data-[vaul-drawer-direction=left]:w-3/4 data-[vaul-drawer-direction=left]:border-r data-[vaul-drawer-direction=left]:sm:max-w-sm data-[vaul-drawer-direction=left]:data-[state=closed]:slide-out-to-left data-[vaul-drawer-direction=left]:data-[state=open]:slide-in-from-left",
			"data-[state=closed]:animate-out data-[state=open]:animate-in",
			className
		)}
		{...restProps}
	>
		<div
			data-slot="drawer-handle"
			class="mx-auto mt-4 hidden h-2 w-[100px] shrink-0 rounded-full bg-muted group-data-[vaul-drawer-direction=bottom]/drawer-content:block"
		></div>
		{@render children?.()}
	</DialogPrimitive.Content>
</Drawer.Portal>
