<script lang="ts">
	import { Fps } from '$lib/components/ui/fps';

	let hostRef = $state<HTMLDivElement | null>(null);
	let shadowRoot = $state<ShadowRoot | null>(null);

	$effect(() => {
		if (!hostRef || shadowRoot) return;

		shadowRoot = hostRef.attachShadow({ mode: 'open' });
	});
</script>

<div data-testid="fps-shadow-host" bind:this={hostRef}></div>

{#if shadowRoot}
	<Fps portalContainer={shadowRoot} updateInterval={16} />
{/if}
