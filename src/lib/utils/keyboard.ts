// Keyboard handling utilities for DataGrid
import type { DataGridStore } from '$lib/stores/data-grid.svelte';
import { KEYBOARD_SHORTCUTS } from '$lib/config/data-grid';

export type KeyboardAction =
	| 'navigate-up'
	| 'navigate-down'
	| 'navigate-left'
	| 'navigate-right'
	| 'navigate-home'
	| 'navigate-end'
	| 'navigate-first'
	| 'navigate-last'
	| 'select-all'
	| 'copy'
	| 'cut'
	| 'paste'
	| 'delete'
	| 'edit'
	| 'cancel'
	| 'search'
	| 'next-match'
	| 'prev-match'
	| 'undo'
	| 'redo';

export interface KeyBinding {
	key: string;
	ctrl?: boolean;
	meta?: boolean;
	shift?: boolean;
	alt?: boolean;
}

export const DEFAULT_KEY_BINDINGS: Record<KeyboardAction, KeyBinding[]> = {
	'navigate-up': [{ key: 'ArrowUp' }],
	'navigate-down': [{ key: 'ArrowDown' }],
	'navigate-left': [{ key: 'ArrowLeft' }, { key: 'Tab', shift: true }],
	'navigate-right': [{ key: 'ArrowRight' }, { key: 'Tab' }],
	'navigate-home': [{ key: 'Home' }],
	'navigate-end': [{ key: 'End' }],
	'navigate-first': [{ key: 'Home', ctrl: true }],
	'navigate-last': [{ key: 'End', ctrl: true }],
	'select-all': [{ key: 'a', ctrl: true }, { key: 'a', meta: true }],
	copy: [{ key: 'c', ctrl: true }, { key: 'c', meta: true }],
	cut: [{ key: 'x', ctrl: true }, { key: 'x', meta: true }],
	paste: [{ key: 'v', ctrl: true }, { key: 'v', meta: true }],
	delete: [{ key: 'Delete' }, { key: 'Backspace' }],
	edit: [{ key: 'Enter' }, { key: 'F2' }],
	cancel: [{ key: 'Escape' }],
	search: [{ key: 'f', ctrl: true }, { key: 'f', meta: true }],
	'next-match': [{ key: 'F3' }, { key: 'g', ctrl: true }, { key: 'g', meta: true }],
	'prev-match': [
		{ key: 'F3', shift: true },
		{ key: 'g', ctrl: true, shift: true },
		{ key: 'g', meta: true, shift: true }
	],
	undo: [{ key: 'z', ctrl: true }, { key: 'z', meta: true }],
	redo: [
		{ key: 'z', ctrl: true, shift: true },
		{ key: 'z', meta: true, shift: true },
		{ key: 'y', ctrl: true },
		{ key: 'y', meta: true }
	]
};

/**
 * Checks if a keyboard event matches a key binding
 */
export function matchesKeyBinding(event: KeyboardEvent, binding: KeyBinding): boolean {
	const keyMatches = event.key.toLowerCase() === binding.key.toLowerCase();
	const ctrlMatches = binding.ctrl ? event.ctrlKey : !event.ctrlKey;
	const metaMatches = binding.meta ? event.metaKey : !event.metaKey;
	const shiftMatches = binding.shift ? event.shiftKey : !event.shiftKey;
	const altMatches = binding.alt ? event.altKey : !event.altKey;

	// Handle modifier keys - allow either ctrl or meta for cross-platform
	if (binding.ctrl || binding.meta) {
		return keyMatches && (event.ctrlKey || event.metaKey) && shiftMatches && altMatches;
	}

	return keyMatches && ctrlMatches && metaMatches && shiftMatches && altMatches;
}

/**
 * Gets the keyboard action from a keyboard event
 */
export function getKeyboardAction(event: KeyboardEvent): KeyboardAction | null {
	for (const [action, bindings] of Object.entries(DEFAULT_KEY_BINDINGS)) {
		for (const binding of bindings) {
			if (matchesKeyBinding(event, binding)) {
				return action as KeyboardAction;
			}
		}
	}
	return null;
}

/**
 * Creates a keyboard event handler for the data grid
 */
export function createKeyboardHandler(
	store: DataGridStore<any>,
	options: {
		onCopy?: () => void;
		onCut?: () => void;
		onPaste?: () => void;
		onDelete?: () => void;
		onUndo?: () => void;
		onRedo?: () => void;
	} = {}
) {
	return function handleKeydown(event: KeyboardEvent): void {
		const action = getKeyboardAction(event);

		if (!action) {
			// Handle character keys for quick edit
			if (
				event.key.length === 1 &&
				!event.ctrlKey &&
				!event.metaKey &&
				!event.altKey &&
				store.focusedCell &&
				!store.isEditing &&
				!store.readOnly
			) {
				// Start editing and type the character
				store.startEditing(store.focusedCell);
				return;
			}
			return;
		}

		// Prevent default for handled actions
		const handledActions: KeyboardAction[] = [
			'navigate-up',
			'navigate-down',
			'navigate-left',
			'navigate-right',
			'navigate-home',
			'navigate-end',
			'navigate-first',
			'navigate-last',
			'select-all',
			'search',
			'next-match',
			'prev-match',
			'edit',
			'cancel'
		];

		if (handledActions.includes(action)) {
			event.preventDefault();
		}

		// Don't handle most actions while editing
		if (store.isEditing) {
			if (action === 'cancel') {
				store.stopEditing();
			}
			return;
		}

		switch (action) {
			case 'navigate-up':
				if (event.shiftKey && store.focusedCell && store.selectionRange) {
					// Extend selection
					const newEnd = {
						rowIndex: Math.max(0, store.selectionRange.end.rowIndex - 1),
						columnId: store.selectionRange.end.columnId
					};
					store.selectRange(store.selectionRange.start, newEnd);
				} else {
					store.moveFocus('up');
				}
				break;

			case 'navigate-down':
				if (event.shiftKey && store.focusedCell && store.selectionRange) {
					const newEnd = {
						rowIndex: Math.min(store.data.length - 1, store.selectionRange.end.rowIndex + 1),
						columnId: store.selectionRange.end.columnId
					};
					store.selectRange(store.selectionRange.start, newEnd);
				} else {
					store.moveFocus('down');
				}
				break;

			case 'navigate-left':
				store.moveFocus('left');
				break;

			case 'navigate-right':
				store.moveFocus('right');
				break;

			case 'navigate-home':
				store.moveFocus('home');
				break;

			case 'navigate-end':
				store.moveFocus('end');
				break;

			case 'navigate-first':
				store.moveToFirstCell();
				break;

			case 'navigate-last':
				store.moveToLastCell();
				break;

			case 'select-all':
				store.selectAll();
				break;

			case 'copy':
				options.onCopy?.();
				break;

			case 'cut':
				if (!store.readOnly) {
					store.markCellsAsCut();
					options.onCut?.();
				}
				break;

			case 'paste':
				if (!store.readOnly) {
					options.onPaste?.();
				}
				break;

			case 'delete':
				if (!store.readOnly) {
					options.onDelete?.();
				}
				break;

			case 'edit':
				if (!store.readOnly && store.focusedCell) {
					store.startEditing(store.focusedCell);
				}
				break;

			case 'cancel':
				if (store.searchState.searchOpen) {
					store.closeSearch();
				} else {
					store.clearSelection();
					store.clearCut();
				}
				break;

			case 'search':
				store.openSearch();
				break;

			case 'next-match':
				store.nextMatch();
				break;

			case 'prev-match':
				store.previousMatch();
				break;

			case 'undo':
				options.onUndo?.();
				break;

			case 'redo':
				options.onRedo?.();
				break;
		}
	};
}

/**
 * Formats a key binding for display
 */
export function formatKeyBinding(binding: KeyBinding): string {
	const parts: string[] = [];

	if (binding.ctrl || binding.meta) {
		parts.push(navigator.platform.includes('Mac') ? '⌘' : 'Ctrl');
	}
	if (binding.shift) {
		parts.push('Shift');
	}
	if (binding.alt) {
		parts.push(navigator.platform.includes('Mac') ? '⌥' : 'Alt');
	}

	// Format the key
	let key = binding.key;
	const keyMap: Record<string, string> = {
		ArrowUp: '↑',
		ArrowDown: '↓',
		ArrowLeft: '←',
		ArrowRight: '→',
		Enter: '↵',
		Escape: 'Esc',
		Delete: 'Del',
		Backspace: '⌫',
		Tab: '⇥',
		Home: 'Home',
		End: 'End'
	};
	key = keyMap[key] || key.toUpperCase();

	parts.push(key);
	return parts.join('+');
}
