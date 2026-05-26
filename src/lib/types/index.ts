import type { Component, ComponentProps } from 'svelte';

export type Prettify<T> = {
	[K in keyof T]: T[K];
} & {};

export type EmptyProps<T extends Component> = Omit<ComponentProps<T>, keyof ComponentProps<T>>;

export interface SearchParams {
	[key: string]: string | string[] | undefined;
}

// Re-export data-grid wholesale to preserve the existing top-level `Option` type.
export * from './data-grid';

export type {
	BooleanFilterOperator,
	DataTableOption,
	DataTableRowAction,
	DateFilterOperator,
	ExtendedColumnFilter,
	ExtendedColumnSort,
	FilterOperatorDef,
	FilterVariant,
	JoinOperator,
	NumberFilterOperator,
	QueryKeys,
	SelectFilterOperator,
	TextFilterOperator,
	UseDataTableOptions,
	UseDataTableReturn
} from './data-table';

export {
	BOOLEAN_OPERATORS,
	DATE_OPERATORS,
	getDefaultFilterOperator,
	getFilterOperators,
	getValidFilters,
	MULTI_SELECT_OPERATORS,
	NUMBER_OPERATORS,
	SELECT_OPERATORS,
	TEXT_OPERATORS
} from './data-table';
