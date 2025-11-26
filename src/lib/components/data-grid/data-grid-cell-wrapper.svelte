<script lang="ts" generics="TData">
	import type { Cell, Table } from '@tanstack/table-core';
	import type { Snippet } from 'svelte';
	import { getCellKey, type RowHeightValue } from '$lib/types/data-grid.js';
	import { cn } from '$lib/utils.js';

	interface Props {
		cell: Cell<TData, unknown>;
		table: Table<TData>;
		rowIndex: number;
		columnId: string;
		isEditing: boolean;
		isFocused: boolean;
		isSelected: boolean;
		class?: string;
		wrapperRef?: HTMLDivElement | null;
		onclick?: (event: MouseEvent) => void;
		onkeydown?: (event: KeyboardEvent) => void;
		ondragenter?: (event: DragEvent) => void;
		ondragleave?: (event: DragEvent) => void;
		ondragover?: (event: DragEvent) => void;
		ondrop?: (event: DragEvent) => void;
		children?: Snippet;
	}

	let {
		cell,
		table,
		rowIndex,
		columnId,
		isEditing,
		isFocused,
		isSelected,
		class: className,
		wrapperRef = $bindable(null),
		onclick: onClickProp,
		onkeydown: onKeyDownProp,
		ondragenter: onDragEnterProp,
		ondragleave: onDragLeaveProp,
		ondragover: onDragOverProp,
		ondrop: onDropProp,
		children
	}: Props = $props();

	let internalRef = $state<HTMLDivElement | null>(null);
	// Track if cell was focused BEFORE mousedown (to prevent single-click opening edit)
	let wasFocusedOnMouseDown = $state(false);

	// Sync internal ref to bindable prop
	$effect(() => {
		if (internalRef) {
			wrapperRef = internalRef;
		}
	});

	// Register/unregister cell in cellMapRef
	$effect(() => {
		const meta = table.options.meta;
		if (internalRef && meta?.cellMapRef) {
			const cellKey = getCellKey(rowIndex, columnId);
			meta.cellMapRef.set(cellKey, internalRef);

			return () => {
				table.options.meta?.cellMapRef?.delete(cellKey);
			};
		}
	});

	// Derived state - access meta fresh each time via $derived.by
	const isSearchMatch = $derived.by(() => {
		const meta = table.options.meta;
		return meta?.getIsSearchMatch?.(rowIndex, columnId) ?? false;
	});
	const isActiveSearchMatch = $derived.by(() => {
		const meta = table.options.meta;
		return meta?.getIsActiveSearchMatch?.(rowIndex, columnId) ?? false;
	});
	const rowHeight = $derived.by<RowHeightValue>(() => {
		const meta = table.options.meta;
		return meta?.rowHeight ?? 'short';
	});

	function handleClick(event: MouseEvent) {
		if (!isEditing) {
			event.preventDefault();
			onClickProp?.(event);
			const meta = table.options.meta;
			// Only start editing if cell was ALREADY focused before this mousedown/click
			// Selection is handled by mousedown, so we only handle editing here
			if (wasFocusedOnMouseDown) {
				meta?.onCellEditingStart?.(rowIndex, columnId);
			}
		}
	}

	function handleContextMenu(event: MouseEvent) {
		if (!isEditing) {
			table.options.meta?.onCellContextMenu?.(rowIndex, columnId, event);
		}
	}

	function handleMouseDown(event: MouseEvent) {
		if (!isEditing) {
			// Capture focus state BEFORE mousedown changes it
			wasFocusedOnMouseDown = isFocused;
			table.options.meta?.onCellMouseDown?.(rowIndex, columnId, event);
		}
	}

	function handleMouseEnter(event: MouseEvent) {
		if (!isEditing) {
			table.options.meta?.onCellMouseEnter?.(rowIndex, columnId, event);
		}
	}

	function handleMouseUp() {
		if (!isEditing) {
			table.options.meta?.onCellMouseUp?.();
		}
	}

	function handleDoubleClick(event: MouseEvent) {
		if (!isEditing) {
			event.preventDefault();
			table.options.meta?.onCellDoubleClick?.(rowIndex, columnId);
		}
	}

	function handleKeyDown(event: KeyboardEvent) {
		onKeyDownProp?.(event);

		if (event.defaultPrevented) return;

		// When editing, don't interfere with navigation keys in the input
		if (isEditing) {
			return;
		}

		// Let navigation keys bubble up to grid handler when not editing
		if (
			event.key === 'ArrowUp' ||
			event.key === 'ArrowDown' ||
			event.key === 'ArrowLeft' ||
			event.key === 'ArrowRight' ||
			event.key === 'Home' ||
			event.key === 'End' ||
			event.key === 'PageUp' ||
			event.key === 'PageDown' ||
			event.key === 'Tab' ||
			event.key === 'Escape'
		) {
			// Don't prevent default - let the grid handler deal with it
			return;
		}

		// Handle editing keys when focused
		if (isFocused && !isEditing) {
			const meta = table.options.meta;
			if (event.key === 'F2' || event.key === 'Enter') {
				event.preventDefault();
				event.stopPropagation();
				meta?.onCellEditingStart?.(rowIndex, columnId);
				return;
			}

			if (event.key === ' ') {
				event.preventDefault();
				event.stopPropagation();
				meta?.onCellEditingStart?.(rowIndex, columnId);
				return;
			}

			// Printable character starts editing
			if (event.key.length === 1 && !event.ctrlKey && !event.metaKey) {
				event.preventDefault();
				event.stopPropagation();
				meta?.onCellEditingStart?.(rowIndex, columnId);
			}
		}
	}
</script>

<div
	bind:this={internalRef}
	role="button"
	data-slot="grid-cell-wrapper"
	data-editing={isEditing ? '' : undefined}
	data-focused={isFocused ? '' : undefined}
	data-selected={isSelected ? '' : undefined}
	tabindex={isFocused && !isEditing ? 0 : -1}
	class={cn(
		'size-full px-2 py-1.5 text-left text-sm outline-none has-data-[slot=checkbox]:pt-2.5',
		{
			'ring-1 ring-ring ring-inset': isFocused,
			'bg-yellow-100 dark:bg-yellow-900/30': isSearchMatch && !isActiveSearchMatch,
			'bg-orange-200 dark:bg-orange-900/50': isActiveSearchMatch,
			'bg-primary/10': isSelected && !isFocused && !isEditing,
			'cursor-default': !isEditing,
			'**:data-[slot=grid-cell-content]:line-clamp-1': !isEditing && rowHeight === 'short',
			'**:data-[slot=grid-cell-content]:line-clamp-2': !isEditing && rowHeight === 'medium',
			'**:data-[slot=grid-cell-content]:line-clamp-3': !isEditing && rowHeight === 'tall',
			'**:data-[slot=grid-cell-content]:line-clamp-4': !isEditing && rowHeight === 'extra-tall'
		},
		className
	)}
	onclick={handleClick}
	oncontextmenu={handleContextMenu}
	ondblclick={handleDoubleClick}
	onmousedown={handleMouseDown}
	onmouseenter={handleMouseEnter}
	onmouseup={handleMouseUp}
	onkeydown={handleKeyDown}
	ondragenter={onDragEnterProp}
	ondragleave={onDragLeaveProp}
	ondragover={onDragOverProp}
	ondrop={onDropProp}
>
	{@render children?.()}
</div>
