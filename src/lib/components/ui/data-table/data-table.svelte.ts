import {
	type RowData,
	type Table,
	type TableOptions,
	type TableOptionsResolved,
	type TableState,
	createTable
} from '@tanstack/table-core';
import { createSubscriber } from 'svelte/reactivity';

/**
 * Bridges TanStack Table (external reactive system) to Svelte 5.
 *
 * 1. `$effect.pre` syncs options when parent `$state` changes (not on every table read).
 * 2. `createSubscriber` on proxy reads re-runs `$derived` when the table updates.
 * 3. Wrapped change handlers are stable references so `setOptions` does not retrigger callbacks.
 *
 * @see docs/REACTIVITY.md
 */
export function createSvelteTable<TData extends RowData>(
	options: TableOptions<TData>
): Table<TData> {
	let state: Partial<TableState> = {};

	const resolvedOptions: TableOptionsResolved<TData> = mergeObjects(
		{
			state: {},
			onStateChange() {},
			renderFallbackValue: null,
			mergeOptions: (defaultOptions: TableOptions<TData>, opts: Partial<TableOptions<TData>>) => {
				return mergeObjects(defaultOptions, opts);
			}
		},
		options
	);

	const table = createTable(resolvedOptions);
	state = table.initialState;

	let notifyTableUpdate: (() => void) | null = null;
	let lastDataRef: TData[] | null = null;
	let lastColumnsRef: TableOptions<TData>['columns'] | null = null;
	let lastStateKey = '';

	const subscribe = createSubscriber((update) => {
		notifyTableUpdate = update;
		return () => {
			notifyTableUpdate = null;
		};
	});

	function wrapControlledChange<Updater>(
		handler: ((updater: Updater) => void) | undefined
	): (updater: Updater) => void {
		return (updater) => {
			handler?.(updater);
			// Notify subscribers immediately; $effect.pre syncs options before paint.
			notifyTableUpdate?.();
		};
	}

	// Stable handler refs — recreated wrappers on every setOptions caused churn/loops.
	const onColumnFiltersChange = wrapControlledChange(options.onColumnFiltersChange);
	const onSortingChange = wrapControlledChange(options.onSortingChange);
	const onPaginationChange = wrapControlledChange(options.onPaginationChange);
	const onColumnVisibilityChange = wrapControlledChange(options.onColumnVisibilityChange);
	const onRowSelectionChange = wrapControlledChange(options.onRowSelectionChange);
	const onStateChange: NonNullable<TableOptions<TData>['onStateChange']> = (updater) => {
		if (updater instanceof Function) {
			state = updater(state as TableState);
		} else {
			state = mergeObjects(state, updater);
		}

		notifyTableUpdate?.();
		options.onStateChange?.(updater);
	};

	function readReactiveData(): TData[] {
		const data = options.data as TData[] | (() => TData[]);
		return typeof data === 'function' ? data() : data;
	}

	function readReactiveState(): Partial<TableState> | undefined {
		const tableState = options.state;
		if (tableState === undefined) return undefined;
		return typeof tableState === 'function'
			? (tableState as () => Partial<TableState>)()
			: tableState;
	}

	function syncOptions() {
		table.setOptions((prev) => {
			return mergeObjects(prev, options, {
				state: mergeObjects(state, readReactiveState() ?? {}),
				onColumnFiltersChange,
				onSortingChange,
				onPaginationChange,
				onColumnVisibilityChange,
				onRowSelectionChange,
				onStateChange
			});
		});
	}

	$effect.pre(() => {
		const data = readReactiveData();
		const columns = options.columns;
		const stateKey = JSON.stringify({
			manualFiltering: options.manualFiltering,
			manualPagination: options.manualPagination,
			manualSorting: options.manualSorting,
			pageCount: options.pageCount,
			state: readReactiveState()
		});

		if (data === lastDataRef && columns === lastColumnsRef && stateKey === lastStateKey) return;
		lastDataRef = data;
		lastColumnsRef = columns;
		lastStateKey = stateKey;

		syncOptions();
		notifyTableUpdate?.();
	});

	return new Proxy(table, {
		get(target, prop, receiver) {
			subscribe();

			const value = Reflect.get(target, prop, receiver);

			if (typeof value === 'function') {
				return value.bind(target);
			}

			return value;
		}
	});
}

type MaybeThunk<T extends object> = T | (() => T | null | undefined);
type Intersection<T extends readonly unknown[]> = (T extends [infer H, ...infer R]
	? H & Intersection<R>
	: unknown) & {};

/**
 * Lazily merges several objects (or thunks) while preserving
 * getter semantics from every source.
 *
 * Proxy-based to avoid known WebKit recursion issue.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mergeObjects<Sources extends readonly MaybeThunk<any>[]>(
	...sources: Sources
): Intersection<{ [K in keyof Sources]: Sources[K] }> {
	const resolve = <T extends object>(src: MaybeThunk<T>): T | undefined =>
		typeof src === 'function' ? (src() ?? undefined) : src;

	const findSourceWithKey = (key: PropertyKey) => {
		for (let i = sources.length - 1; i >= 0; i--) {
			const obj = resolve(sources[i]);
			if (obj && key in obj) return obj;
		}
		return undefined;
	};

	return new Proxy(Object.create(null), {
		get(_, key) {
			const src = findSourceWithKey(key);

			return src?.[key as never];
		},

		has(_, key) {
			return !!findSourceWithKey(key);
		},

		ownKeys(): (string | symbol)[] {
			// eslint-disable-next-line svelte/prefer-svelte-reactivity
			const all = new Set<string | symbol>();
			for (const s of sources) {
				const obj = resolve(s);
				if (obj) {
					for (const k of Reflect.ownKeys(obj) as (string | symbol)[]) {
						all.add(k);
					}
				}
			}
			return [...all];
		},

		getOwnPropertyDescriptor(_, key) {
			const src = findSourceWithKey(key);
			if (!src) return undefined;
			return {
				configurable: true,
				enumerable: true,
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				value: (src as any)[key],
				writable: true
			};
		}
	}) as Intersection<{ [K in keyof Sources]: Sources[K] }>;
}
