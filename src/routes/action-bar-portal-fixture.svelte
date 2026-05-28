<script lang="ts">
	import {
		ActionBar,
		ActionBarGroup,
		ActionBarItem
	} from '$lib/components/ui/action-bar/index.js';

	let portalContainer = $state<HTMLElement | null>(null);
	let shadowHost = $state<HTMLDivElement | null>(null);
	let shadowRoot = $state<ShadowRoot | null>(null);

	$effect(() => {
		if (!shadowHost || shadowRoot) return;

		shadowRoot = shadowHost.attachShadow({ mode: 'open' });
	});
</script>

<div data-testid="default-action-bar-host">
	<ActionBar open data-testid="default-action-bar">
		<ActionBarGroup>
			<ActionBarItem>Default</ActionBarItem>
		</ActionBarGroup>
	</ActionBar>
</div>

<div data-testid="custom-action-bar-target" bind:this={portalContainer}></div>

<div data-testid="custom-action-bar-host">
	{#if portalContainer}
		<ActionBar open {portalContainer} data-testid="custom-action-bar">
			<ActionBarGroup>
				<ActionBarItem>Custom</ActionBarItem>
			</ActionBarGroup>
		</ActionBar>
	{/if}
</div>

<div data-testid="fragment-action-bar-target" bind:this={shadowHost}></div>

{#if shadowRoot}
	<ActionBar open portalContainer={shadowRoot} data-testid="fragment-action-bar">
		<ActionBarGroup>
			<ActionBarItem>Fragment</ActionBarItem>
		</ActionBarGroup>
	</ActionBar>
{/if}
