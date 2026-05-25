import { browser } from '$app/environment';

type MaybeGetter<T> = T | (() => T);

export interface MediaQueryState {
	readonly matches: boolean;
	readonly query: string;
}

function getValue<T>(value: MaybeGetter<T>): T {
	return typeof value === 'function' ? (value as () => T)() : value;
}

export function useMediaQuery(query: MaybeGetter<string>, defaultValue = false): MediaQueryState {
	const currentQuery = $derived(getValue(query));
	let matches = $state(defaultValue);

	$effect(() => {
		if (!browser) {
			matches = defaultValue;
			return;
		}

		const mediaQueryList = window.matchMedia(currentQuery);

		function onChange(event: MediaQueryListEvent) {
			matches = event.matches;
		}

		matches = mediaQueryList.matches;
		mediaQueryList.addEventListener('change', onChange);

		return () => {
			mediaQueryList.removeEventListener('change', onChange);
		};
	});

	return {
		get matches() {
			return matches;
		},
		get query() {
			return currentQuery;
		}
	};
}
