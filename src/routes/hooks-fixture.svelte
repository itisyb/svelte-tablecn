<script lang="ts">
	import { useMediaQuery } from '$lib/hooks/use-media-query.svelte.js';
	import { useMounted } from '$lib/hooks/use-mounted.svelte.js';

	const mounted = useMounted();
	const visibleViewport = useMediaQuery('(min-width: 1px)');
</script>

<output aria-label="mounted">{mounted.current ? 'mounted' : 'not mounted'}</output>
<output aria-label="media query">{visibleViewport.matches ? 'matched' : 'unmatched'}</output>
