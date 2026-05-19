import {
	type RowData,
	type Table,
	type TableOptions,
	type TableOptionsResolved,
	type TableState,
	createTable,
} from "@tanstack/table-core";
import { createSubscriber } from "svelte/reactivity";

/**
 * Bridges TanStack Table (external reactive system) to Svelte 5.
 *
 * ## Correct pattern (this file)
 *
 * 1. **`$effect.pre`** — sync `data`, `state`, and options when Svelte `$state` changes
 *    (same approach as `useDataGrid`).
 * 2. **`createSubscriber`** — proxy getters call `subscribe()` so `$derived(table.getRowModel())`
 *    re-runs when `notifyTableUpdate()` fires.
 * 3. **Never `setOptions` on every property read** — that causes feedback loops and jank.
 *
 * @see https://svelte.dev/docs/svelte/svelte-reactivity#createSubscriber
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
			mergeOptions: (
				defaultOptions: TableOptions<TData>,
				opts: Partial<TableOptions<TData>>
			) => {
				return mergeObjects(defaultOptions, opts);
			},
		},
		options
	);

	const table = createTable(resolvedOptions);
	state = table.initialState;

	let notifyTableUpdate: (() => void) | null = null;

	const subscribe = createSubscriber((update) => {
		notifyTableUpdate = update;
		return () => {
			notifyTableUpdate = null;
		};
	});

	function wrapOnChange<Updater>(
		handler: ((updater: Updater) => void) | undefined
	): (updater: Updater) => void {
		return (updater) => {
			handler?.(updater);
			notifyTableUpdate?.();
		};
	}

	function readReactiveData(): TData[] {
		const data = options.data as TData[] | (() => TData[]);
		return typeof data === "function" ? data() : data;
	}

	function readReactiveState(): Partial<TableState> | undefined {
		const tableState = options.state;
		if (tableState === undefined) return undefined;
		return typeof tableState === "function"
			? (tableState as () => Partial<TableState>)()
			: tableState;
	}

	function syncOptions() {
		const originalOnStateChange = options.onStateChange;

		table.setOptions((prev) => {
			return mergeObjects(prev, options, {
				state: mergeObjects(state, readReactiveState() ?? {}),
				onColumnFiltersChange: wrapOnChange(options.onColumnFiltersChange),
				onSortingChange: wrapOnChange(options.onSortingChange),
				onPaginationChange: wrapOnChange(options.onPaginationChange),
				onColumnVisibilityChange: wrapOnChange(options.onColumnVisibilityChange),
				onRowSelectionChange: wrapOnChange(options.onRowSelectionChange),
				onStateChange: (updater: Parameters<NonNullable<TableOptions<TData>["onStateChange"]>>[0]) => {
					if (updater instanceof Function) {
						state = updater(state as TableState);
					} else {
						state = mergeObjects(state, updater);
					}

					notifyTableUpdate?.();
					originalOnStateChange?.(updater);
				},
			});
		});
	}

	// Sync when parent $state / getters change (filters, sort, data, etc.)
	$effect.pre(() => {
		readReactiveData();
		readReactiveState();
		options.pageCount;
		syncOptions();
		notifyTableUpdate?.();
	});

	return new Proxy(table, {
		get(target, prop, receiver) {
			subscribe();

			const value = Reflect.get(target, prop, receiver);

			if (typeof value === "function") {
				return value.bind(target);
			}

			return value;
		},
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
		typeof src === "function" ? (src() ?? undefined) : src;

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
				writable: true,
			};
		},
	}) as Intersection<{ [K in keyof Sources]: Sources[K] }>;
}
