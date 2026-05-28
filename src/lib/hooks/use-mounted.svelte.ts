export interface MountedState {
	readonly current: boolean;
}

export function useMounted(): MountedState {
	let mounted = $state(false);

	$effect(() => {
		mounted = true;

		return () => {
			mounted = false;
		};
	});

	return {
		get current() {
			return mounted;
		}
	};
}
