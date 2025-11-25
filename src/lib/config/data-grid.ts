// Data Grid Configuration Constants

// Virtualization settings
export const OVERSCAN = 3;
export const VIEWPORT_OFFSET = 1;

// Column sizing
export const MIN_COLUMN_SIZE = 60;
export const MAX_COLUMN_SIZE = 800;
export const DEFAULT_COLUMN_SIZE = 150;

// Row heights in pixels
export const ROW_HEIGHTS = {
	short: 36,
	medium: 56,
	tall: 76,
	'extra-tall': 96
} as const;

// Line counts for text wrapping
export const ROW_LINE_COUNTS = {
	short: 1,
	medium: 2,
	tall: 3,
	'extra-tall': 4
} as const;

// Keyboard shortcuts
export const KEYBOARD_SHORTCUTS = {
	// Navigation
	ARROW_UP: 'ArrowUp',
	ARROW_DOWN: 'ArrowDown',
	ARROW_LEFT: 'ArrowLeft',
	ARROW_RIGHT: 'ArrowRight',
	TAB: 'Tab',
	ENTER: 'Enter',
	ESCAPE: 'Escape',
	HOME: 'Home',
	END: 'End',
	PAGE_UP: 'PageUp',
	PAGE_DOWN: 'PageDown',

	// Actions
	DELETE: 'Delete',
	BACKSPACE: 'Backspace',

	// With modifiers (handled separately)
	// Ctrl+A - Select all
	// Ctrl+C - Copy
	// Ctrl+X - Cut
	// Ctrl+V - Paste
	// Ctrl+F - Find
	// Ctrl+Home - Go to first cell
	// Ctrl+End - Go to last cell
} as const;

// Selection
export const SELECTION_BORDER_WIDTH = 2;

// Animation durations (ms)
export const ANIMATION_DURATION = {
	fast: 100,
	normal: 200,
	slow: 300
} as const;

// Debounce delays (ms)
export const DEBOUNCE_DELAY = {
	search: 300,
	resize: 100,
	scroll: 16
} as const;

// Cell variants configuration
export const CELL_VARIANTS = [
	'short-text',
	'long-text',
	'number',
	'checkbox',
	'select',
	'multi-select',
	'date',
	'url',
	'file'
] as const;

// Default cell variant
export const DEFAULT_CELL_VARIANT = 'short-text';

// File upload defaults
export const FILE_UPLOAD_DEFAULTS = {
	maxFileSize: 10 * 1024 * 1024, // 10MB
	maxFiles: 5,
	accept: '*/*'
} as const;

// Date format
export const DATE_FORMAT = 'yyyy-MM-dd';
export const DATE_TIME_FORMAT = 'yyyy-MM-dd HH:mm';

// Clipboard format
export const CLIPBOARD_MIME_TYPE = 'text/plain';
export const CLIPBOARD_SEPARATOR = '\t'; // TSV format
export const CLIPBOARD_ROW_SEPARATOR = '\n';
