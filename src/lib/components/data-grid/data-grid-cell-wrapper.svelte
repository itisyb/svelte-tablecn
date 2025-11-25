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

	// Sync internal ref to bindable prop
	$effect(() => {
		if (internalRef) {
			wrapperRef = internalRef;
		}
	});

	const meta = $derived(table.options.meta);

	// Register/unregister cell in cellMapRef
	$effect(() => {
		if (internalRef && meta?.cellMapRef) {
			const cellKey = getCellKey(rowIndex, columnId);
			meta.cellMapRef.set(cellKey, internalRef);

			return () => {
				meta.cellMapRef?.delete(cellKey);
			};
		}
	});

	// Derived state
	const isSearchMatch = $derived(meta?.getIsSearchMatch?.(rowIndex, columnId) ?? false);
	const isActiveSearchMatch = $derived(meta?.getIsActiveSearchMatch?.(rowIndex, columnId) ?? false);
	const rowHeight = $derived<RowHeightValue>(meta?.rowHeight ?? 'short');

	function handleClick(event: MouseEvent) {
		if (!isEditing) {
			event.preventDefault();
			onClickProp?.(event);
			if (isFocused) {
				meta?.onCellEditingStart?.(rowIndex, columnId);
			} else {
				meta?.onCellClick?.(rowIndex, columnId, event);
			}
		}
	}

	function handleContextMenu(event: MouseEvent) {
		if (!isEditing) {
			meta?.onCellContextMenu?.(rowIndex, columnId, event);
		}
	}

	function handleMouseDown(event: MouseEvent) {
		if (!isEditing) {
			meta?.onCellMouseDown?.(rowIndex, columnId, event);
		}
	}

	function handleMouseEnter(event: MouseEvent) {
		if (!isEditing) {
			meta?.onCellMouseEnter?.(rowIndex, columnId, event);
		}
	}

	function handleMouseUp() {
		if (!isEditing) {
			meta?.onCellMouseUp?.();
		}
	}

	function handleDoubleClick(event: MouseEvent) {
		if (!isEditing) {
			event.preventDefault();
			meta?.onCellDoubleClick?.(rowIndex, columnId);
		}
	}

	function handleKeyDown(event: KeyboardEvent) {
		onKeyDownProp?.(event);

		if (event.defaultPrevented) return;

		// Let navigation keys bubble up to grid handler
		if (
			event.key === 'ArrowUp' ||
			event.key === 'ArrowDown' ||
			event.key === 'ArrowLeft' ||
			event.key === 'ArrowRight' ||
			event.key === 'Home' ||
			event.key === 'End' ||
			event.key === 'PageUp' ||
			event.key === 'PageDown' ||
			event.key === 'Tab'
		) {
			return;
		}

		if (isFocused && !isEditing) {
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
			'bg-primary/10': isSelected && !isEditing,
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
