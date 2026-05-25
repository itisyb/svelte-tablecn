type MaybeGetter<T> = T | (() => T);

export interface AsRef<T> {
	readonly current: T;
}

function getValue<T>(value: MaybeGetter<T>): T {
	return typeof value === 'function' ? (value as () => T)() : value;
}

export function useAsRef<T>(value: MaybeGetter<T>): AsRef<T> {
	const current = $derived(getValue(value));

	return {
		get current() {
			return current;
		}
	};
}
