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
 * Creates a reactive TanStack table object for Svelte 5 using createSubscriber.
 * 
 * This implementation uses Svelte 5's `createSubscriber` to bridge TanStack Table's
 * internal subscription model with Svelte's reactivity system. When table state changes,
 * the subscriber triggers a re-render without needing to wrap state in `$state`.
 * 
 * @param options Table options to create the table with.
 * @returns A reactive table object.
 * @example
 * ```svelte
 * <script>
 *   const table = createSvelteTable({ ... })
 * </script>
 *
 * <table>
 *   <thead>
 *     {#each table.getHeaderGroups() as headerGroup}
 *       <tr>
 *         {#each headerGroup.headers as header}
 *           <th colspan={header.colSpan}>
 *         	   <FlexRender content={header.column.columnDef.header} context={header.getContext()} />
 *         	 </th>
 *         {/each}
 *       </tr>
 *     {/each}
 *   </thead>
 * 	 <!-- ... -->
 * </table>
 * ```
 */
export function createSvelteTable<TData extends RowData>(
	options: TableOptions<TData>
): Table<TData> {
	// Track internal state - not wrapped in $state since we use createSubscriber
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

	// Store the update function so we can call it from the proxy
	let triggerUpdate: (() => void) | null = null;

	// Create subscriber that will trigger Svelte reactivity when table state changes
	const subscribe = createSubscriber((update) => {
		triggerUpdate = update;
		
		// Cleanup function - runs when no more subscribers
		return () => {
			triggerUpdate = null;
		};
	});

	function wrapOnChange<Updater>(
		handler: ((updater: Updater) => void) | undefined,
		flushSync = false
	): (updater: Updater) => void {
		return (updater) => {
			handler?.(updater);
			if (flushSync) {
				syncScheduled = false;
				syncOptions();
			}
			triggerUpdate?.();
		};
	}

	// Update table options when reactive inputs may have changed
	function syncOptions() {
		const originalOnStateChange = options.onStateChange;

		table.setOptions((prev) => {
			return mergeObjects(prev, options, {
				state: mergeObjects(state, options.state || {}),
				onColumnFiltersChange: wrapOnChange(options.onColumnFiltersChange, true),
				onSortingChange: wrapOnChange(options.onSortingChange, true),
				onPaginationChange: wrapOnChange(options.onPaginationChange),
				onColumnVisibilityChange: wrapOnChange(options.onColumnVisibilityChange),
				onRowSelectionChange: wrapOnChange(options.onRowSelectionChange),
				onStateChange: (updater: Parameters<NonNullable<TableOptions<TData>['onStateChange']>>[0]) => {
					if (updater instanceof Function) {
						state = updater(state as TableState);
					} else {
						state = mergeObjects(state, updater);
					}

					triggerUpdate?.();
					originalOnStateChange?.(updater);
				}
			});
		});
	}

	let syncScheduled = false;
	function scheduleSyncOptions() {
		if (syncScheduled) return;
		syncScheduled = true;
		queueMicrotask(() => {
			syncScheduled = false;
			syncOptions();
		});
	}

	// Create a proxy that calls subscribe() on property access
	// This ensures any effect reading table properties will re-run on state changes
	return new Proxy(table, {
		get(target, prop, receiver) {
			// Register as subscriber
			subscribe();
			scheduleSyncOptions();

			const value = Reflect.get(target, prop, receiver);
			
			// Bind methods to the original table
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
