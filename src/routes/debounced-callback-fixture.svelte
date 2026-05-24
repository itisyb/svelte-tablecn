<script lang="ts">
	import DebouncedCallbackChildFixture from './debounced-callback-child-fixture.svelte';

	let mounted = $state(true);
	let calls = $state(0);
</script>

<button type="button" onclick={() => (mounted = false)}>Unmount debounced child</button>
<output aria-label="debounced calls">{calls}</output>

{#if mounted}
	<DebouncedCallbackChildFixture onFire={() => (calls += 1)} />
{/if}
