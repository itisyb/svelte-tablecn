export interface DebouncedCallback<TArgs extends unknown[]> {
	(...args: TArgs): void;
	cancel: () => void;
	flush: () => void;
}

export function useDebouncedCallback<TArgs extends unknown[]>(
	callback: (...args: TArgs) => void,
	delay = 300
): DebouncedCallback<TArgs> {
	let timeoutId: ReturnType<typeof setTimeout> | null = null;
	let lastArgs: TArgs | null = null;

	const debounced = ((...args: TArgs) => {
		lastArgs = args;

		if (timeoutId) {
			clearTimeout(timeoutId);
		}

		timeoutId = setTimeout(() => {
			timeoutId = null;
			if (lastArgs) {
				callback(...lastArgs);
				lastArgs = null;
			}
		}, delay);
	}) as DebouncedCallback<TArgs>;

	debounced.cancel = () => {
		if (timeoutId) {
			clearTimeout(timeoutId);
			timeoutId = null;
		}
		lastArgs = null;
	};

	debounced.flush = () => {
		if (!lastArgs) return;

		if (timeoutId) {
			clearTimeout(timeoutId);
			timeoutId = null;
		}

		callback(...lastArgs);
		lastArgs = null;
	};

	return debounced;
}
