export type Prettify<T> = {
	[K in keyof T]: T[K];
} & {};

export interface SearchParams {
	[key: string]: string | string[] | undefined;
}

// Re-export all types from data-grid and data-table
export * from './data-grid';
export * from './data-table';
