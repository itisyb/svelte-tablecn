<script lang="ts" module>
	import type { Component, Snippet } from 'svelte';

	// Types for FlexRender content
	export type FlexRenderContent<TProps extends Record<string, unknown>> =
		| string
		| number
		| boolean
		| null
		| undefined
		| Component<TProps>
		| Snippet<[TProps]>
		| ((props: TProps) => string | number | null | undefined)
		| { component: Component<TProps>; props: TProps }
		| { snippet: Snippet<[TProps]>; props: TProps };
</script>

<script lang="ts">
	import { isComponentRender, isSnippetRender } from './render-helpers';

	interface Props {
		content: unknown;
		context: Record<string, unknown>;
	}

	let { content, context }: Props = $props();

	// Determine what type of content we're dealing with
	const contentInfo = $derived.by(() => {
		if (content === null || content === undefined) {
			return { type: 'empty' as const, value: '' };
		}

		if (typeof content === 'string' || typeof content === 'number' || typeof content === 'boolean') {
			return { type: 'primitive' as const, value: String(content) };
		}

		// Check for renderComponent result
		if (isComponentRender(content)) {
			return { type: 'component-render' as const, value: content };
		}

		// Check for renderSnippet result
		if (isSnippetRender(content)) {
			return { type: 'snippet-render' as const, value: content };
		}

		if (typeof content === 'function') {
			// Could be a component, snippet, or render function
			const fn = content as Function;

			// Try calling it as a function first
			try {
				const result = (fn as (props: Record<string, unknown>) => unknown)(context);

				// Check if the result is a component render or snippet render
				if (isComponentRender(result)) {
					return { type: 'component-render' as const, value: result };
				}
				if (isSnippetRender(result)) {
					return { type: 'snippet-render' as const, value: result };
				}

				// Otherwise treat it as a primitive result
				if (result !== null && result !== undefined) {
					return { type: 'primitive' as const, value: String(result) };
				}
				return { type: 'empty' as const, value: '' };
			} catch {
				// If calling as function fails, try treating as component
				return { type: 'component' as const, value: fn as Component<Record<string, unknown>> };
			}
		}

		return { type: 'empty' as const, value: '' };
	});
</script>

{#if contentInfo.type === 'primitive'}
	{contentInfo.value}
{:else if contentInfo.type === 'component'}
	{@const Comp = contentInfo.value}
	<Comp {...context} />
{:else if contentInfo.type === 'component-render'}
	{@const { component: Comp, props } = contentInfo.value}
	<Comp {...props} />
{:else if contentInfo.type === 'snippet-render'}
	{@const { snippet, props } = contentInfo.value}
	{@render snippet(props)}
{/if}
