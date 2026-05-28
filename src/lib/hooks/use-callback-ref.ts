export function useCallbackRef<T extends (...args: any[]) => any>(callback: T | undefined): T {
	return ((...args: Parameters<T>) => callback?.(...args)) as T;
}
