/**
 * useWindowSize - Svelte 5 port of the React useWindowSize hook
 * 
 * Returns reactive window dimensions that update on resize
 */

import { browser } from '$app/environment';

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

	let width = $state(browser ? window.innerWidth : defaultWidth);
	let height = $state(browser ? window.innerHeight : defaultHeight);

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

		window.addEventListener('resize', onResize);

		return () => {
			window.removeEventListener('resize', onResize);
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
