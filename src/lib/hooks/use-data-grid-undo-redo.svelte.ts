import { browser } from '$app/environment';
import { on } from 'svelte/events';
import { toast } from 'svelte-sonner';

const DEFAULT_MAX_HISTORY = 100;
const BATCH_TIMEOUT = 300;

interface HistoryEntry<TData> {
	variant: 'cells_update' | 'rows_add' | 'rows_delete';
	count: number;
	timestamp: number;
	undo: (currentData: TData[]) => TData[];
	redo: (currentData: TData[]) => TData[];
}

export interface UndoRedoCellUpdate {
	rowId: string;
	columnId: string;
	previousValue: unknown;
	newValue: unknown;
}

export interface UseDataGridUndoRedoOptions<TData> {
	data: TData[] | (() => TData[]);
	onDataChange: (data: TData[]) => void;
	getRowId: (row: TData, index: number) => string;
	maxHistory?: number;
	enabled?: boolean;
}

export interface UseDataGridUndoRedoReturn<TData> {
	canUndo: boolean;
	canRedo: boolean;
	onUndo: () => void;
	onRedo: () => void;
	onClear: () => void;
	trackCellsUpdate: (updates: UndoRedoCellUpdate[]) => void;
	trackRowsAdd: (rows: TData[]) => void;
	trackRowsDelete: (rows: TData[]) => void;
}

function buildIndexById<TData>(
	data: TData[],
	getRowId: (row: TData, index: number) => string
): Map<string, number> {
	const map = new Map<string, number>();
	for (let index = 0; index < data.length; index++) {
		const row = data[index];
		if (row !== undefined) {
			map.set(getRowId(row, index), index);
		}
	}
	return map;
}

function cloneHistoryValue<T>(value: T): T {
	if (typeof structuredClone === 'function') {
		try {
			return structuredClone(value);
		} catch {
			// Fall through to a shallow clone.
		}
	}

	if (Array.isArray(value)) {
		return value.map((item) => cloneHistoryValue(item)) as T;
	}

	if (value && typeof value === 'object') {
		return { ...(value as Record<string, unknown>) } as T;
	}

	return value;
}

function getPendingKey(rowId: string, columnId: string): string {
	return `${rowId}\0${columnId}`;
}

function getIsInPopover(element: HTMLElement): boolean {
	return (
		element.closest(
			'[data-grid-popover], [data-slot="popover-content"], [data-slot="select-content"], [data-slot="dropdown-menu-content"], [data-slot="dialog-content"]'
		) !== null
	);
}

export function useDataGridUndoRedo<TData>(
	options: UseDataGridUndoRedoOptions<TData>
): UseDataGridUndoRedoReturn<TData> {
	const {
		data: dataProp,
		onDataChange,
		getRowId,
		maxHistory = DEFAULT_MAX_HISTORY,
		enabled = true
	} = options;

	const getData = typeof dataProp === 'function' ? dataProp : () => dataProp;

	let undoStack = $state<HistoryEntry<TData>[]>([]);
	let redoStack = $state<HistoryEntry<TData>[]>([]);
	let hasPendingChanges = $state(false);

	const pendingBatch = {
		byKey: new Map<string, UndoRedoCellUpdate>(),
		timeoutId: null as ReturnType<typeof setTimeout> | null
	};

	function pushEntry(entry: HistoryEntry<TData>) {
		const nextUndoStack = [...undoStack, entry];
		if (nextUndoStack.length > maxHistory) {
			nextUndoStack.shift();
		}

		undoStack = nextUndoStack;
		redoStack = [];
		hasPendingChanges = false;
	}

	function commitPendingChanges() {
		if (pendingBatch.byKey.size === 0) return;

		if (pendingBatch.timeoutId) {
			clearTimeout(pendingBatch.timeoutId);
			pendingBatch.timeoutId = null;
		}

		const updates = Array.from(pendingBatch.byKey.values());
		pendingBatch.byKey.clear();

		const entry: HistoryEntry<TData> = {
			variant: 'cells_update',
			count: updates.length,
			timestamp: Date.now(),
			undo: (currentData) => {
				const nextData = [...currentData];
				const indexById = buildIndexById(nextData, getRowId);

				for (const update of updates) {
					const rowIndex = indexById.get(update.rowId);
					if (rowIndex === undefined) continue;

					const row = nextData[rowIndex];
					if (row === undefined) continue;

					nextData[rowIndex] = {
						...(row as Record<string, unknown>),
						[update.columnId]: cloneHistoryValue(update.previousValue)
					} as TData;
				}

				return nextData;
			},
			redo: (currentData) => {
				const nextData = [...currentData];
				const indexById = buildIndexById(nextData, getRowId);

				for (const update of updates) {
					const rowIndex = indexById.get(update.rowId);
					if (rowIndex === undefined) continue;

					const row = nextData[rowIndex];
					if (row === undefined) continue;

					nextData[rowIndex] = {
						...(row as Record<string, unknown>),
						[update.columnId]: cloneHistoryValue(update.newValue)
					} as TData;
				}

				return nextData;
			}
		};

		pushEntry(entry);
	}

	function onUndo() {
		if (!enabled) return;

		commitPendingChanges();

		const entry = undoStack[undoStack.length - 1];
		if (!entry) {
			toast.info('No actions to undo');
			return;
		}

		undoStack = undoStack.slice(0, -1);
		redoStack = [...redoStack, entry];
		hasPendingChanges = false;

		onDataChange(entry.undo(getData()));
		toast.success(`${entry.count} action${entry.count !== 1 ? 's' : ''} undone`);
	}

	function onRedo() {
		if (!enabled) return;

		commitPendingChanges();

		const entry = redoStack[redoStack.length - 1];
		if (!entry) {
			toast.info('No actions to redo');
			return;
		}

		redoStack = redoStack.slice(0, -1);
		undoStack = [...undoStack, entry];
		hasPendingChanges = false;

		onDataChange(entry.redo(getData()));
		toast.success(`${entry.count} action${entry.count !== 1 ? 's' : ''} redone`);
	}

	function onClear() {
		if (pendingBatch.timeoutId) {
			clearTimeout(pendingBatch.timeoutId);
			pendingBatch.timeoutId = null;
		}

		pendingBatch.byKey.clear();
		undoStack = [];
		redoStack = [];
		hasPendingChanges = false;
	}

	function trackCellsUpdate(updates: UndoRedoCellUpdate[]) {
		if (!enabled || updates.length === 0) return;

		const filteredUpdates = updates.filter((update) => {
			return !Object.is(update.previousValue, update.newValue);
		});

		if (filteredUpdates.length === 0) return;

		for (const update of filteredUpdates) {
			const key = getPendingKey(update.rowId, update.columnId);
			const existing = pendingBatch.byKey.get(key);

			if (existing) {
				pendingBatch.byKey.set(key, {
					...existing,
					newValue: cloneHistoryValue(update.newValue)
				});
			} else {
				pendingBatch.byKey.set(key, {
					rowId: update.rowId,
					columnId: update.columnId,
					previousValue: cloneHistoryValue(update.previousValue),
					newValue: cloneHistoryValue(update.newValue)
				});
			}
		}

		hasPendingChanges = true;

		if (pendingBatch.timeoutId) {
			clearTimeout(pendingBatch.timeoutId);
		}

		pendingBatch.timeoutId = setTimeout(() => {
			commitPendingChanges();
		}, BATCH_TIMEOUT);
	}

	function trackRowsAdd(rows: TData[]) {
		if (!enabled || rows.length === 0) return;

		commitPendingChanges();

		const rowIds = new Set(rows.map((row, index) => getRowId(row, index)));
		const rowsCopy = rows.map((row) => cloneHistoryValue(row));

		pushEntry({
			variant: 'rows_add',
			count: rows.length,
			timestamp: Date.now(),
			undo: (currentData) => {
				return currentData.filter((row, index) => !rowIds.has(getRowId(row, index)));
			},
			redo: (currentData) => {
				return [...currentData, ...rowsCopy.map((row) => cloneHistoryValue(row))];
			}
		});
	}

	function trackRowsDelete(rows: TData[]) {
		if (!enabled || rows.length === 0) return;

		commitPendingChanges();

		const currentData = getData();
		const indexById = buildIndexById(currentData, getRowId);
		const rowsWithPositions: Array<{ index: number; row: TData }> = [];

		for (const row of rows) {
			const rowId = getRowId(row, 0);
			const currentIndex = indexById.get(rowId);
			if (currentIndex === undefined) continue;

			rowsWithPositions.push({
				index: currentIndex,
				row: cloneHistoryValue(row)
			});
		}

		rowsWithPositions.sort((left, right) => left.index - right.index);

		const rowIds = new Set(rows.map((row, index) => getRowId(row, index)));

		pushEntry({
			variant: 'rows_delete',
			count: rows.length,
			timestamp: Date.now(),
			undo: (currentData) => {
				const nextData = [...currentData];

				for (const { index, row } of rowsWithPositions) {
					const insertIndex = Math.min(index, nextData.length);
					nextData.splice(insertIndex, 0, cloneHistoryValue(row));
				}

				return nextData;
			},
			redo: (currentData) => {
				return currentData.filter((row, index) => !rowIds.has(getRowId(row, index)));
			}
		});
	}

	$effect(() => {
		return () => {
			if (pendingBatch.timeoutId) {
				clearTimeout(pendingBatch.timeoutId);
			}
		};
	});

	$effect(() => {
		if (!browser || !enabled) return;

		function handleKeyDown(event: KeyboardEvent) {
			const isCtrlOrCmd = event.ctrlKey || event.metaKey;
			const key = event.key.toLowerCase();

			if (!isCtrlOrCmd || (key !== 'z' && key !== 'y')) return;

			const activeElement = document.activeElement;
			if (activeElement instanceof HTMLElement) {
				const isInput = activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA';
				const isContentEditable = activeElement.isContentEditable;
				if (isInput || isContentEditable || getIsInPopover(activeElement)) {
					return;
				}
			}

			if (key === 'z' && !event.shiftKey) {
				event.preventDefault();
				onUndo();
				return;
			}

			if ((key === 'z' && event.shiftKey) || key === 'y') {
				event.preventDefault();
				onRedo();
			}
		}

		return on(document, 'keydown', handleKeyDown);
	});

	return {
		get canUndo() {
			return undoStack.length > 0 || hasPendingChanges;
		},
		get canRedo() {
			return redoStack.length > 0;
		},
		onUndo,
		onRedo,
		onClear,
		trackCellsUpdate,
		trackRowsAdd,
		trackRowsDelete
	};
}
