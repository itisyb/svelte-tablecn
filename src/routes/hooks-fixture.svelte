<script lang="ts">
	import { useAsRef } from '$lib/hooks/use-as-ref.svelte.js';
	import { useLazyRef } from '$lib/hooks/use-lazy-ref.js';
	import { useMediaQuery } from '$lib/hooks/use-media-query.svelte.js';
	import { useMounted } from '$lib/hooks/use-mounted.svelte.js';

	let name = $state('Ada');
	let lazyInitializations = $state(0);

	const latestName = useAsRef(() => name);
	const lazyRef = useLazyRef(() => {
		lazyInitializations += 1;
		return { label: 'created once' };
	});
	const mounted = useMounted();
	const visibleViewport = useMediaQuery('(min-width: 1px)');
</script>

<button type="button" onclick={() => (name = 'Grace')}>Update hook state</button>
<output aria-label="as ref">{latestName.current}</output>
<output aria-label="lazy ref">{lazyRef.current.label}</output>
<output aria-label="lazy initializations">{lazyInitializations}</output>
<output aria-label="mounted">{mounted.current ? 'mounted' : 'not mounted'}</output>
<output aria-label="media query">{visibleViewport.matches ? 'matched' : 'unmatched'}</output>
