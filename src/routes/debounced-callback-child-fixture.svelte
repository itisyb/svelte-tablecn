<script lang="ts">
	import { useDebouncedCallback } from '$lib/hooks/use-debounced-callback.js';

	let { onFire }: { onFire: () => void } = $props();

	const schedule = useDebouncedCallback(() => {
		onFire();
	}, 50);
</script>

<button type="button" onclick={() => schedule()}>Schedule debounced callback</button>
