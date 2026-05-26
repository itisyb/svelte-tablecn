export interface LazyRef<T> {
	current: T;
}

export function useLazyRef<T>(fn: () => T): LazyRef<T> {
	const current = fn();

	return {
		current
	};
}
