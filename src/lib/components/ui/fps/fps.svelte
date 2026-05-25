<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";
	import { type VariantProps, tv } from "tailwind-variants";
	import { cn, type WithElementRef } from "$lib/utils.js";

	export const fpsVariants = tv({
		base: "z-50 flex shrink-0 items-center gap-2 rounded-sm border bg-background/80 px-3 py-1.5 font-mono text-foreground text-sm backdrop-blur-sm",
		variants: {
			strategy: {
				fixed: "fixed",
				absolute: "absolute",
			},
			position: {
				"top-left": "top-4 left-4",
				"top-right": "top-4 right-4",
				"bottom-left": "bottom-4 left-4",
				"bottom-right": "right-4 bottom-4",
			},
			status: {
				good: "text-primary",
				warning: "text-orange-500",
				error: "text-destructive",
			},
		},
		defaultVariants: {
			strategy: "fixed",
			position: "top-right",
			status: "good",
		},
	});

	export type FpsStrategy = VariantProps<typeof fpsVariants>["strategy"];
	export type FpsPosition = VariantProps<typeof fpsVariants>["position"];
	export type FpsStatus = VariantProps<typeof fpsVariants>["status"];

	export type FpsProps = WithElementRef<HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
		strategy?: FpsStrategy;
		position?: FpsPosition;
		label?: string;
		updateInterval?: number;
		warningThreshold?: number;
		errorThreshold?: number;
		portalContainer?: Element | null;
		enabled?: boolean;
		children?: Snippet;
	};
</script>

<script lang="ts">
	import { Portal } from "bits-ui";

	let {
		ref = $bindable(null),
		strategy = "fixed",
		position = "top-right",
		label,
		updateInterval = 500,
		warningThreshold = 30,
		errorThreshold = 20,
		portalContainer,
		enabled = true,
		class: className,
		children,
		...restProps
	}: FpsProps = $props();

	let fps = $state(0);
	let frameCount = 0;
	let lastTime = 0;

	const status = $derived.by<FpsStatus>(() => {
		if (fps < errorThreshold) return "error";
		if (fps < warningThreshold) return "warning";
		return "good";
	});

	$effect(() => {
		if (!enabled) return;

		let animationFrame: number | null = null;
		lastTime = performance.now();

		function measureFps() {
			const now = performance.now();
			const delta = now - lastTime;
			frameCount += 1;

			if (delta >= updateInterval) {
				fps = Math.round((frameCount * 1000) / delta);
				frameCount = 0;
				lastTime = now;
			}

			animationFrame = requestAnimationFrame(measureFps);
		}

		animationFrame = requestAnimationFrame(measureFps);

		return () => {
			if (animationFrame !== null) {
				cancelAnimationFrame(animationFrame);
			}
		};
	});
</script>

{#snippet fpsContent()}
	<div
		bind:this={ref}
		aria-hidden="true"
		data-slot="fps"
		class={cn(fpsVariants({ strategy, position, status }), className)}
		{...restProps}
	>
		{#if label}
			<span data-slot="fps-label" class="text-muted-foreground">{label}:</span>
		{/if}
		<span data-slot="fps-value">{fps}</span>
		{@render children?.()}
	</div>
{/snippet}

{#if enabled}
	{#if strategy === 'absolute'}
		{@render fpsContent()}
	{:else}
		<Portal to={portalContainer ?? 'body'}>
			{@render fpsContent()}
		</Portal>
	{/if}
{/if}
