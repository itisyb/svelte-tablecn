/**
 * Returns reactive window dimensions that update on resize
 */

import { browser } from '$app/environment';
import { on } from 'svelte/events';

interface WindowSize {
	width: number;
	height: number;
}

interface UseWindowSizeOptions {
	defaultWidth?: number;
	defaultHeight?: number;
}

export function useWindowSize(options: UseWindowSizeOptions = {}): WindowSize {
	const { defaultWidth = 0, defaultHeight = 0 } = options;

	let width = $state(defaultWidth);
	let height = $state(defaultHeight);

	$effect(() => {
		if (!browser) return;

		// Set initial size
		width = window.innerWidth;
		height = window.innerHeight;

		let timeoutId: ReturnType<typeof setTimeout> | null = null;

		function onResize() {
			if (timeoutId) {
				clearTimeout(timeoutId);
			}

			timeoutId = setTimeout(() => {
				width = window.innerWidth;
				height = window.innerHeight;
			}, 150);
		}

		const removeResize = on(window, 'resize', onResize);

		return () => {
			removeResize();
			if (timeoutId) {
				clearTimeout(timeoutId);
			}
		};
	});

	return {
		get width() {
			return width;
		},
		get height() {
			return height;
		}
	};
}
