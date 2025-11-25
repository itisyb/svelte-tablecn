// TanStack Table integration for Svelte 5
// Re-exports from shadcn-svelte data-table components

// Core table creation
export { createSvelteTable } from '$lib/components/ui/data-table/data-table.svelte.js';

// FlexRender component
export { default as FlexRender } from '$lib/components/ui/data-table/flex-render.svelte';

// Render helpers
export {
	renderComponent,
	renderSnippet,
	RenderComponentConfig,
	RenderSnippetConfig
} from '$lib/components/ui/data-table/render-helpers.js';

// Type exports
import type { TableOptions, RowData } from '@tanstack/table-core';
import { RenderComponentConfig, RenderSnippetConfig } from '$lib/components/ui/data-table/render-helpers.js';

export type FlexRenderContent<TProps extends Record<string, unknown>> =
	| string
	| ((props: TProps) => unknown);

// Helper function to check if content is a component render config
export function isComponentRender(content: unknown): boolean {
	return content instanceof RenderComponentConfig;
}

// Helper function to check if content is a snippet render config
export function isSnippetRender(content: unknown): boolean {
	return content instanceof RenderSnippetConfig;
}

// Table options helper - utility for creating typed table options
export function tableOptions<TData extends RowData>(
	options: TableOptions<TData>
): TableOptions<TData> {
	return options;
}

// Re-export useful types from table-core
export {
	createColumnHelper,
	getCoreRowModel,
	getSortedRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getExpandedRowModel,
	getGroupedRowModel,
	getFacetedRowModel,
	getFacetedUniqueValues,
	getFacetedMinMaxValues,
	type ColumnDef,
	type ColumnHelper,
	type Row,
	type Cell,
	type Header,
	type HeaderGroup,
	type Column,
	type Table,
	type TableState,
	type SortingState,
	type ColumnFiltersState,
	type VisibilityState,
	type RowSelectionState,
	type PaginationState,
	type ExpandedState,
	type GroupingState,
	type ColumnSizingState,
	type ColumnPinningState,
	type Updater,
	type OnChangeFn,
	type RowData,
	type CellContext,
	type HeaderContext,
	type ColumnDefTemplate
} from '@tanstack/table-core';
