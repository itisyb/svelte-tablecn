// Helper functions for rendering cells and headers in TanStack Table
// These provide type-safe ways to use Svelte components and snippets in column definitions

import type { Component, Snippet } from 'svelte';

/**
 * Wraps a Svelte component for use in column cell/header definitions
 *
 * @example
 * ```ts
 * const columns = [
 *   {
 *     accessorKey: 'actions',
 *     cell: ({ row }) => renderComponent(ActionCell, { row })
 *   }
 * ];
 * ```
 */
export function renderComponent<TProps extends Record<string, unknown>>(
	component: Component<TProps>,
	props: TProps
): { component: Component<TProps>; props: TProps } {
	return { component, props };
}

/**
 * Wraps a Snippet for use in column cell/header definitions
 *
 * @example
 * ```svelte
 * {#snippet actionCell(props: { row: Row<Data> })}
 *   <button>Edit</button>
 * {/snippet}
 *
 * <script>
 *   const columns = [
 *     {
 *       accessorKey: 'actions',
 *       cell: ({ row }) => renderSnippet(actionCell, { row })
 *     }
 *   ];
 * </script>
 * ```
 */
export function renderSnippet<TProps>(
	snippet: Snippet<[TProps]>,
	props: TProps
): { snippet: Snippet<[TProps]>; props: TProps } {
	return { snippet, props };
}

/**
 * Type guard to check if a value is a component render result
 */
export function isComponentRender<TProps extends Record<string, unknown>>(
	value: unknown
): value is { component: Component<TProps>; props: TProps } {
	return (
		typeof value === 'object' &&
		value !== null &&
		'component' in value &&
		'props' in value &&
		typeof (value as { component: unknown }).component === 'function'
	);
}

/**
 * Type guard to check if a value is a snippet render result
 */
export function isSnippetRender<TProps>(
	value: unknown
): value is { snippet: Snippet<[TProps]>; props: TProps } {
	return (
		typeof value === 'object' &&
		value !== null &&
		'snippet' in value &&
		'props' in value &&
		typeof (value as { snippet: unknown }).snippet === 'function'
	);
}
