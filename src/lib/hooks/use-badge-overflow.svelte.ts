/**
 * useBadgeOverflow - Svelte 5 port of TableCN's useBadgeOverflow hook
 * 
 * Calculates how many badge items can fit in a container across multiple lines,
 * by actually measuring badge widths in the DOM and caching results.
 */

// Cache for measured badge widths
const badgeWidthCache = new Map<string, number>();

const DEFAULT_CONTAINER_PADDING = 16; // px-2 = 8px * 2
const DEFAULT_BADGE_GAP = 4; // gap-1 = 4px
const DEFAULT_OVERFLOW_BADGE_WIDTH = 40; // Approximate width of "+N" badge

interface MeasureBadgeWidthProps {
	label: string;
	cacheKey: string;
	iconSize?: number;
	maxWidth?: number;
	className?: string;
}

/**
 * Measures the actual rendered width of a badge by temporarily adding it to the DOM
 */
function measureBadgeWidth({
	label,
	cacheKey,
	iconSize,
	maxWidth,
	className
}: MeasureBadgeWidthProps): number {
	const cached = badgeWidthCache.get(cacheKey);
	if (cached !== undefined) {
		return cached;
	}

	const measureEl = document.createElement('div');
	measureEl.className = `inline-flex items-center rounded-md border px-1.5 text-xs font-semibold h-5 gap-1 shrink-0 absolute invisible pointer-events-none ${className ?? ''}`;
	measureEl.style.whiteSpace = 'nowrap';

	if (iconSize) {
		const icon = document.createElement('span');
		icon.className = 'shrink-0';
		icon.style.width = `${iconSize}px`;
		icon.style.height = `${iconSize}px`;
		measureEl.appendChild(icon);
	}

	if (maxWidth) {
		const text = document.createElement('span');
		text.className = 'truncate';
		text.style.maxWidth = `${maxWidth}px`;
		text.textContent = label;
		measureEl.appendChild(text);
	} else {
		measureEl.textContent = label;
	}

	document.body.appendChild(measureEl);
	const width = measureEl.offsetWidth;
	document.body.removeChild(measureEl);

	badgeWidthCache.set(cacheKey, width);
	return width;
}

export interface UseBadgeOverflowOptions<T> {
	/** Array of items to display as badges */
	items: T[];
	/** Function to get the label text from an item */
	getLabel: (item: T) => string;
	/** Reference to the container element */
	containerRef: HTMLElement | null;
	/** Number of lines badges can wrap to */
	lineCount: number;
	/** Optional prefix for cache keys to avoid collisions */
	cacheKeyPrefix?: string;
	/** Icon size in pixels (if badges have icons) */
	iconSize?: number;
	/** Max width for badge text (for truncation) */
	maxWidth?: number;
	/** Additional CSS classes for measurement */
	className?: string;
	/** Container padding in pixels (default: 16) */
	containerPadding?: number;
	/** Gap between badges in pixels (default: 4) */
	badgeGap?: number;
	/** Width of overflow badge "+N" in pixels (default: 40) */
	overflowBadgeWidth?: number;
}

export interface UseBadgeOverflowReturn<T> {
	/** Items that fit in the visible area */
	visibleItems: T[];
	/** Count of items that don't fit (for "+N" badge) */
	hiddenCount: number;
	/** Current container width */
	containerWidth: number;
}

/**
 * Calculates which badges fit in a container with proper overflow handling.
 * Uses actual DOM measurement for accurate badge width calculation.
 */
export function useBadgeOverflow<T>(
	options: () => UseBadgeOverflowOptions<T>
): { readonly value: UseBadgeOverflowReturn<T> } {
	let containerWidth = $state(0);
	let resizeObserver: ResizeObserver | null = null;

	// Setup resize observer when containerRef changes
	$effect(() => {
		const opts = options();
		const container = opts.containerRef;
		const padding = opts.containerPadding ?? DEFAULT_CONTAINER_PADDING;

		if (!container) {
			containerWidth = 0;
			return;
		}

		function measureWidth() {
			if (container) {
				containerWidth = container.clientWidth - padding;
			}
		}

		measureWidth();

		resizeObserver = new ResizeObserver(measureWidth);
		resizeObserver.observe(container);

		return () => {
			resizeObserver?.disconnect();
			resizeObserver = null;
		};
	});

	// Calculate visible items based on container width
	const result = $derived.by((): UseBadgeOverflowReturn<T> => {
		const opts = options();
		const {
			items,
			getLabel,
			lineCount,
			cacheKeyPrefix = '',
			iconSize,
			maxWidth,
			className,
			badgeGap = DEFAULT_BADGE_GAP,
			overflowBadgeWidth = DEFAULT_OVERFLOW_BADGE_WIDTH
		} = opts;

		if (!containerWidth || items.length === 0) {
			return { visibleItems: items, hiddenCount: 0, containerWidth };
		}

		let currentLineWidth = 0;
		let currentLine = 1;
		const visible: T[] = [];

		for (const item of items) {
			const label = getLabel(item);
			const cacheKey = cacheKeyPrefix ? `${cacheKeyPrefix}:${label}` : label;
			const badgeWidth = measureBadgeWidth({
				label,
				cacheKey,
				iconSize,
				maxWidth,
				className
			});
			const widthWithGap = badgeWidth + badgeGap;

			if (currentLineWidth + widthWithGap <= containerWidth) {
				// Badge fits on current line
				currentLineWidth += widthWithGap;
				visible.push(item);
			} else if (currentLine < lineCount) {
				// Start a new line
				currentLine++;
				currentLineWidth = widthWithGap;
				visible.push(item);
			} else {
				// No more space - check if we need to remove last badge for overflow indicator
				if (currentLineWidth + overflowBadgeWidth > containerWidth && visible.length > 0) {
					visible.pop();
				}
				break;
			}
		}

		return {
			visibleItems: visible,
			hiddenCount: Math.max(0, items.length - visible.length),
			containerWidth
		};
	});

	return {
		get value() {
			return result;
		}
	};
}

/**
 * Clears the badge width cache - useful if styles change
 */
export function clearBadgeWidthCache(): void {
	badgeWidthCache.clear();
}
