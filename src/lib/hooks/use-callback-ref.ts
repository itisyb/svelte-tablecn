export function useCallbackRef<T extends (...args: any[]) => any>(callback: T): T {
	return ((...args: Parameters<T>) => callback(...args)) as T;
}
