import { browser } from '$app/environment';
import { goto, pushState, replaceState } from '$app/navigation';
import { on } from 'svelte/events';
import {
	getCoreRowModel,
	getFacetedMinMaxValues,
	getFacetedRowModel,
	getFacetedUniqueValues,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type ColumnFilter,
	type ColumnFiltersState,
	type PaginationState,
	type RowSelectionState,
	type SortingState,
	type Updater,
	type VisibilityState
} from '@tanstack/table-core';
import { DATA_TABLE_DEFAULTS, DEFAULT_DATA_TABLE_QUERY_KEYS } from '$lib/config/data-table.js';
import { getFiltersStateParser, getSortingStateParser } from '$lib/parsers.js';
import { createSvelteTable } from '$lib/table';
import { filterRows } from '$lib/filter-rows.js';
import {
	getDefaultFilterOperator,
	getValidFilters,
	type ExtendedColumnFilter,
	type ExtendedColumnSort,
	type FilterVariant,
	type JoinOperator,
	type QueryKeys,
	type UseDataTableOptions,
	type UseDataTableReturn
} from '$lib/types/data-table.js';

type DataTableColumnFilter<TData> = ColumnFilter & Partial<ExtendedColumnFilter<TData>>;

interface ParsedQueryState<TData> {
	sorting?: SortingState;
	columnFilters?: ColumnFiltersState;
	pagination?: PaginationState;
	joinOperator?: JoinOperator;
}

function isJoinOperator(value: string | null): value is JoinOperator {
	return value === 'and' || value === 'or';
}

function normalizeFilterValue(value: unknown): string | string[] {
	if (Array.isArray(value)) {
		return value.map((item) => `${item}`.trim()).filter((item) => item.length > 0);
	}

	if (value === undefined || value === null) {
		return '';
	}

	return `${value}`;
}

function normalizeSimpleFilterValue(value: unknown, variant?: FilterVariant): unknown {
	if (Array.isArray(value)) {
		if (variant === 'range') {
			return value.map((item) => (item === '' ? undefined : Number(item)));
		}

		return value;
	}

	if (variant === 'range' && typeof value === 'string' && value.includes(',')) {
		return value.split(',').map((item) => (item === '' ? undefined : Number(item)));
	}

	return value;
}

function getExtendedFilterKey<TData>(
	filter: DataTableColumnFilter<TData>,
	fallbackIndex = 0
): string {
	return filter.filterId ?? `${filter.id}-${fallbackIndex}`;
}

function ensureFilterIds<TData>(filters: ColumnFiltersState): ColumnFiltersState {
	return (filters as DataTableColumnFilter<TData>[]).map((filter, index) => {
		if (filter.filterId) return filter;
		return {
			...filter,
			filterId: getExtendedFilterKey(filter, index)
		};
	}) as ColumnFiltersState;
}

function extractAdvancedFilters<TData>(
	filters: ColumnFiltersState,
	getColumnVariant: (columnId: string) => FilterVariant
): ExtendedColumnFilter<TData>[] {
	return filters.map((filter, index) => {
		const candidate = filter as DataTableColumnFilter<TData>;
		const variant = candidate.variant ?? getColumnVariant(filter.id);
		const normalizedValue = normalizeFilterValue(candidate.value);

		return {
			id: filter.id as Extract<keyof TData, string>,
			value: normalizedValue,
			variant,
			operator: candidate.operator ?? getDefaultFilterOperator(variant),
			filterId: candidate.filterId ?? getExtendedFilterKey(candidate, index)
		};
	});
}

function createUrlWithSearch(params: URLSearchParams): string {
	const currentUrl = new URL(window.location.href);
	const search = params.toString();
	currentUrl.search = search;
	return `${currentUrl.pathname}${search ? `?${search}` : ''}${currentUrl.hash}`;
}

interface FilteredDataCache<TData> {
	source: TData[];
	filtersKey: string;
	join: JoinOperator;
	result: TData[];
}

function toGetter<T>(value: T | (() => T)): () => T {
	return typeof value === 'function' ? (value as () => T) : () => value;
}

function getClientFilteredData<TData>(
	rawData: TData[],
	columnFilters: ColumnFiltersState,
	join: JoinOperator,
	getColumnVariant: (columnId: string) => FilterVariant,
	cache: FilteredDataCache<TData> | null
): { data: TData[]; cache: FilteredDataCache<TData> | null } {
	const advancedFilters = getValidFilters(extractAdvancedFilters(columnFilters, getColumnVariant));

	if (advancedFilters.length === 0) {
		return { data: rawData, cache: null };
	}

	const filtersKey = JSON.stringify(advancedFilters);

	if (cache && cache.source === rawData && cache.filtersKey === filtersKey && cache.join === join) {
		return { data: cache.result, cache };
	}

	const result = filterRows(rawData, advancedFilters, join);
	return {
		data: result,
		cache: { source: rawData, filtersKey, join, result }
	};
}

export function useDataTable<TData>(
	options: UseDataTableOptions<TData>
): UseDataTableReturn<TData> {
	const {
		columns: columnsProp,
		data: dataProp,
		pageCount = -1,
		getRowId,
		queryKeys,
		history = 'replace',
		debounceMs = DATA_TABLE_DEFAULTS.debounceMs,
		throttleMs = DATA_TABLE_DEFAULTS.throttleMs,
		clearOnDefault = false,
		enableAdvancedFilter = false,
		scroll = false,
		shallow = true,
		initialState,
		enableRowSelection = true,
		enableMultiSort = true,
		manualPagination = false,
		manualSorting = false,
		manualFiltering = false
	} = options;

	const getData = typeof dataProp === 'function' ? dataProp : () => dataProp;
	const getColumns = toGetter(columnsProp);
	const getEnableAdvancedFilter = toGetter(enableAdvancedFilter);
	const columns = $derived(getColumns());
	const advancedFilterEnabled = $derived(getEnableAdvancedFilter());
	const resolvedQueryKeys: QueryKeys = { ...DEFAULT_DATA_TABLE_QUERY_KEYS, ...queryKeys };
	const defaultPagination = initialState?.pagination ?? {
		pageIndex: 0,
		pageSize: DATA_TABLE_DEFAULTS.pageSize
	};
	const defaultSorting = initialState?.sorting ?? [];
	const defaultJoinOperator: JoinOperator = 'and';
	const validColumnIds = $derived(
		new Set(columns.map((column) => column.id).filter(Boolean) as string[])
	);
	const filterableColumns = $derived(columns.filter((column) => column.enableColumnFilter));
	const sortingStateParser = $derived(getSortingStateParser<TData>(validColumnIds));
	const filtersStateParser = $derived(getFiltersStateParser<TData>(validColumnIds));

	function getColumnVariant(columnId: string): FilterVariant {
		return columns.find((column) => column.id === columnId)?.meta?.variant ?? 'text';
	}

	function parseQueryState(searchParams: URLSearchParams): ParsedQueryState<TData> {
		const sortingParam = searchParams.get(resolvedQueryKeys.sort);
		const parsedSorting = sortingParam
			? (sortingStateParser.parse(sortingParam) ?? undefined)
			: undefined;

		const page = Number(searchParams.get(resolvedQueryKeys.page));
		const perPage = Number(searchParams.get(resolvedQueryKeys.perPage));
		const pagination = {
			pageIndex: Number.isFinite(page) && page > 0 ? page - 1 : defaultPagination.pageIndex,
			pageSize: Number.isFinite(perPage) && perPage > 0 ? perPage : defaultPagination.pageSize
		};

		if (advancedFilterEnabled) {
			const filtersParam = searchParams.get(resolvedQueryKeys.filters);
			const parsedFilters = filtersParam
				? (filtersStateParser.parse(filtersParam) ?? undefined)
				: undefined;

			return {
				sorting: parsedSorting,
				pagination,
				columnFilters: parsedFilters as unknown as ColumnFiltersState,
				joinOperator: isJoinOperator(searchParams.get(resolvedQueryKeys.joinOperator))
					? (searchParams.get(resolvedQueryKeys.joinOperator) as JoinOperator)
					: defaultJoinOperator
			};
		}

		const simpleFilters: ColumnFiltersState = [];

		for (const column of filterableColumns) {
			const columnId = column.id;
			if (!columnId) continue;

			const rawValue = searchParams.get(columnId);
			if (rawValue === null || rawValue.trim() === '') continue;

			const variant = column.meta?.variant;
			const hasOptions = (column.meta?.options?.length ?? 0) > 0;
			const parsedValue =
				hasOptions ||
				variant === 'select' ||
				variant === 'multiSelect' ||
				variant === 'boolean' ||
				variant === 'range' ||
				variant === 'dateRange'
					? normalizeSimpleFilterValue(rawValue.split(','), variant)
					: normalizeSimpleFilterValue(rawValue, variant);

			simpleFilters.push({
				id: columnId,
				value: parsedValue
			});
		}

		return {
			sorting: parsedSorting,
			pagination,
			columnFilters: simpleFilters,
			joinOperator: defaultJoinOperator
		};
	}

	const initialQueryState = browser
		? parseQueryState(new URLSearchParams(window.location.search))
		: {};

	let sorting = $state<SortingState>(initialQueryState.sorting ?? defaultSorting);
	let columnFilters = $state<ColumnFiltersState>(
		initialQueryState.columnFilters ?? initialState?.columnFilters ?? []
	);
	let columnVisibility = $state<VisibilityState>(initialState?.columnVisibility ?? {});
	let rowSelection = $state<RowSelectionState>(initialState?.rowSelection ?? {});
	let pagination = $state<PaginationState>(initialQueryState.pagination ?? defaultPagination);
	let joinOperator = $state<JoinOperator>(initialQueryState.joinOperator ?? defaultJoinOperator);

	let syncTimeoutId: ReturnType<typeof setTimeout> | null = null;
	let isApplyingQueryState = false;
	let lastQueryString = browser ? window.location.search : '';
	let prevSortingSnapshot = JSON.stringify(initialQueryState.sorting ?? defaultSorting);
	let prevFilterSnapshot = JSON.stringify(
		initialQueryState.columnFilters ?? initialState?.columnFilters ?? []
	);
	let prevPaginationSnapshot = JSON.stringify(initialQueryState.pagination ?? defaultPagination);
	let prevJoinOperator = initialQueryState.joinOperator ?? defaultJoinOperator;

	function buildQuerySearchParams(): URLSearchParams {
		const currentParams = browser
			? new URLSearchParams(window.location.search)
			: new URLSearchParams();
		const params = new URLSearchParams(currentParams.toString());

		params.delete(resolvedQueryKeys.page);
		params.delete(resolvedQueryKeys.perPage);
		params.delete(resolvedQueryKeys.sort);
		params.delete(resolvedQueryKeys.filters);
		params.delete(resolvedQueryKeys.joinOperator);

		for (const column of filterableColumns) {
			if (column.id) {
				params.delete(column.id);
			}
		}

		const currentPage = pagination.pageIndex + 1;
		if (!(clearOnDefault && currentPage === 1)) {
			params.set(resolvedQueryKeys.page, `${currentPage}`);
		}

		if (!(clearOnDefault && pagination.pageSize === defaultPagination.pageSize)) {
			params.set(resolvedQueryKeys.perPage, `${pagination.pageSize}`);
		}

		if (!(clearOnDefault && sorting.length === 0) && sorting.length > 0) {
			params.set(
				resolvedQueryKeys.sort,
				sortingStateParser.serialize(sorting as ExtendedColumnSort<TData>[])
			);
		}

		if (advancedFilterEnabled) {
			const advancedFilters = extractAdvancedFilters<TData>(columnFilters, getColumnVariant);
			if (!(clearOnDefault && advancedFilters.length === 0) && advancedFilters.length > 0) {
				params.set(resolvedQueryKeys.filters, filtersStateParser.serialize(advancedFilters));
			}

			if (!(clearOnDefault && joinOperator === defaultJoinOperator)) {
				params.set(resolvedQueryKeys.joinOperator, joinOperator);
			}
		} else {
			for (const filter of columnFilters) {
				if (!filter.id) continue;

				const value = filter.value;
				if (value === undefined || value === null) continue;

				if (Array.isArray(value)) {
					const serialized = value.filter((item) => item !== undefined && item !== null).join(',');
					if (serialized) {
						params.set(filter.id, serialized);
					}
				} else {
					const serialized = `${value}`;
					if (serialized.trim()) {
						params.set(filter.id, serialized);
					}
				}
			}
		}

		return params;
	}

	async function syncQueryState(delay: number) {
		if (!browser || isApplyingQueryState) return;

		if (syncTimeoutId) {
			clearTimeout(syncTimeoutId);
		}

		syncTimeoutId = setTimeout(
			async () => {
				const params = buildQuerySearchParams();
				const nextUrl = createUrlWithSearch(params);
				const nextSearch = params.toString();
				const nextQueryString = nextSearch ? `?${nextSearch}` : '';

				if (nextQueryString === lastQueryString) {
					return;
				}

				if (shallow) {
					try {
						if (history === 'push') {
							pushState(nextUrl, {});
						} else {
							replaceState(nextUrl, {});
						}
					} catch {
						window.history[history === 'push' ? 'pushState' : 'replaceState']({}, '', nextUrl);
					}

					lastQueryString = nextQueryString;
					return;
				}

				await goto(nextUrl, {
					replaceState: history === 'replace',
					noScroll: !scroll,
					keepFocus: true,
					invalidateAll: false
				});

				lastQueryString = nextQueryString;
			},
			Math.max(0, delay)
		);
	}

	function applyQueryStateFromLocation() {
		if (!browser) return;

		isApplyingQueryState = true;
		const nextState = parseQueryState(new URLSearchParams(window.location.search));
		sorting = nextState.sorting ?? defaultSorting;
		columnFilters = ensureFilterIds<TData>(
			nextState.columnFilters ?? initialState?.columnFilters ?? []
		);
		pagination = nextState.pagination ?? defaultPagination;
		joinOperator = nextState.joinOperator ?? defaultJoinOperator;
		lastQueryString = window.location.search;

		queueMicrotask(() => {
			isApplyingQueryState = false;
		});
	}

	$effect(() => {
		if (!browser) return;

		function handlePopState() {
			applyQueryStateFromLocation();
		}

		const removePopState = on(window, 'popstate', handlePopState);

		return () => {
			removePopState();
			if (syncTimeoutId) {
				clearTimeout(syncTimeoutId);
			}
		};
	});

	$effect(() => {
		if (!browser || isApplyingQueryState) return;

		const sortingSnapshot = JSON.stringify(sorting);
		const filterSnapshot = JSON.stringify(columnFilters);
		const paginationSnapshot = JSON.stringify(pagination);

		const filtersChanged = filterSnapshot !== prevFilterSnapshot;
		const sortingChanged = sortingSnapshot !== prevSortingSnapshot;
		const paginationChanged = paginationSnapshot !== prevPaginationSnapshot;
		const joinOperatorChanged = joinOperator !== prevJoinOperator;

		if (!filtersChanged && !sortingChanged && !paginationChanged && !joinOperatorChanged) {
			return;
		}

		prevSortingSnapshot = sortingSnapshot;
		prevFilterSnapshot = filterSnapshot;
		prevPaginationSnapshot = paginationSnapshot;
		prevJoinOperator = joinOperator;

		const delay = filtersChanged && !sortingChanged && !paginationChanged ? debounceMs : throttleMs;
		void syncQueryState(delay);
	});

	const useClientAdvancedFiltering = $derived(advancedFilterEnabled && !manualFiltering);
	let filteredDataCache: FilteredDataCache<TData> | null = null;

	const tableData = $derived.by(() => {
		const rawData = getData();

		if (!useClientAdvancedFiltering) {
			return rawData;
		}

		const next = getClientFilteredData(
			rawData,
			columnFilters,
			joinOperator,
			getColumnVariant,
			filteredDataCache
		);
		filteredDataCache = next.cache;
		return next.data;
	});

	const table = createSvelteTable<TData>({
		get data() {
			return tableData;
		},
		get columns() {
			return columns;
		},
		...(getRowId ? { getRowId } : {}),
		pageCount,
		get state() {
			return {
				sorting,
				columnFilters,
				columnVisibility,
				rowSelection,
				pagination
			};
		},
		defaultColumn: {
			enableColumnFilter: false
		},
		enableRowSelection,
		enableMultiSort,
		enableFilters: true,
		enableColumnFilters: true,
		onRowSelectionChange: (updater) => {
			rowSelection = typeof updater === 'function' ? updater(rowSelection) : updater;
		},
		onPaginationChange: (updater) => {
			pagination = typeof updater === 'function' ? updater(pagination) : updater;
		},
		onSortingChange: (updater) => {
			sorting = typeof updater === 'function' ? updater(sorting) : updater;
		},
		onColumnFiltersChange: (updater) => {
			const next = typeof updater === 'function' ? updater(columnFilters) : updater;
			columnFilters = ensureFilterIds<TData>(next);
		},
		onColumnVisibilityChange: (updater) => {
			columnVisibility = typeof updater === 'function' ? updater(columnVisibility) : updater;
		},
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFacetedRowModel: getFacetedRowModel(),
		getFacetedUniqueValues: getFacetedUniqueValues(),
		getFacetedMinMaxValues: getFacetedMinMaxValues(),
		manualPagination,
		manualSorting,
		get manualFiltering() {
			return useClientAdvancedFiltering ? true : manualFiltering;
		},
		meta: {
			queryKeys: resolvedQueryKeys,
			get joinOperator() {
				return joinOperator;
			},
			setJoinOperator: (value: JoinOperator) => {
				joinOperator = value;
			}
		}
	});

	return {
		table,
		get sorting() {
			return sorting;
		},
		get columnFilters() {
			return columnFilters;
		},
		get columnVisibility() {
			return columnVisibility;
		},
		get rowSelection() {
			return rowSelection;
		},
		get pagination() {
			return pagination;
		},
		get joinOperator() {
			return joinOperator;
		},
		setSorting: (value) => {
			sorting = value;
		},
		setColumnFilters: (updater) => {
			const next = typeof updater === 'function' ? updater(columnFilters) : updater;
			columnFilters = ensureFilterIds<TData>(next);
		},
		setColumnVisibility: (value) => {
			columnVisibility = value;
		},
		setRowSelection: (value) => {
			rowSelection = value;
		},
		setPagination: (value) => {
			pagination = value;
		},
		setJoinOperator: (value) => {
			joinOperator = value;
		}
	};
}
