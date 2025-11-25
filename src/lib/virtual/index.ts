// TanStack Virtual integration for Svelte 5
// Re-exports from the .svelte.ts implementation
export {
	createSvelteVirtualizer,
	createWindowVirtualizer,
	type CreateVirtualizerOptions,
	type VirtualizerReturn
} from './create-svelte-virtualizer.svelte.js';

// Re-export types from virtual-core
export type { VirtualItem, VirtualizerOptions } from '@tanstack/virtual-core';
