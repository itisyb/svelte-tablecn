<script lang="ts">
	import {
		ActionBar,
		ActionBarGroup,
		ActionBarItem
	} from '$lib/components/ui/action-bar/index.js';

	let portalContainer = $state<HTMLElement | null>(null);
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
