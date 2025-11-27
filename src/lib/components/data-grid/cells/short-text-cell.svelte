<script lang="ts" generics="TData">
	import type { CellVariantProps } from '$lib/types/data-grid.js';
	import DataGridCellWrapper from '../data-grid-cell-wrapper.svelte';
	import { cn } from '$lib/utils.js';

	let {
		cell,
		table,
		rowIndex,
		columnId,
		isEditing,
		isFocused,
		isSelected,
		readOnly = false,
		cellValue
	}: CellVariantProps<TData> = $props();

	// Use centralized cellValue prop - fine-grained reactivity is handled by DataGridCell
	const initialValue = $derived((cellValue as string) ?? '');
	let cellRef = $state<HTMLDivElement | null>(null);
	
	// Track local edits separately - this only matters during editing
	let localEditValue = $state<string | null>(null);
	
	// The display value is either the local edit (during editing) or the initial value
	const displayValue = $derived(!isEditing ? (initialValue ?? '') : '');
	
	// Value for tracking edits - use localEditValue if set, otherwise initialValue
	const value = $derived(localEditValue ?? initialValue ?? '');

	// Reset local edit value when editing stops or initialValue changes
	$effect(() => {
		if (!isEditing) {
			localEditValue = null;
		}
	});
	
	// Update DOM when initialValue changes (for non-editing state)
	$effect(() => {
		const iv = initialValue ?? '';
		if (cellRef && !isEditing && cellRef.textContent !== iv) {
			cellRef.textContent = iv;
		}
	});

	// Focus cell when entering edit mode
	$effect(() => {
		if (isEditing && cellRef) {
			cellRef.focus();

			if (!cellRef.textContent && initialValue) {
				cellRef.textContent = initialValue;
			}

			// Move cursor to end
			if (cellRef.textContent) {
				const range = document.createRange();
				const selection = window.getSelection();
				range.selectNodeContents(cellRef);
				range.collapse(false);
				selection?.removeAllRanges();
				selection?.addRange(range);
			}
		}
	});

	function handleBlur() {
		const currentValue = cellRef?.textContent ?? '';
		const meta = table.options.meta;
		if (!readOnly && currentValue !== initialValue) {
			meta?.onDataUpdate?.({ rowIndex, columnId, value: currentValue });
		}
		meta?.onCellEditingStop?.();
	}

	function handleInput(event: Event) {
		const target = event.currentTarget as HTMLDivElement;
		localEditValue = target.textContent ?? '';
	}

	function handleWrapperKeyDown(event: KeyboardEvent) {
		const meta = table.options.meta;
		if (isEditing) {
			if (event.key === 'Enter') {
				event.preventDefault();
				const currentValue = cellRef?.textContent ?? '';
				if (currentValue !== initialValue) {
					meta?.onDataUpdate?.({ rowIndex, columnId, value: currentValue });
				}
				meta?.onCellEditingStop?.({ moveToNextRow: true });
			} else if (event.key === 'Tab') {
				event.preventDefault();
				const currentValue = cellRef?.textContent ?? '';
				if (currentValue !== initialValue) {
					meta?.onDataUpdate?.({ rowIndex, columnId, value: currentValue });
				}
				meta?.onCellEditingStop?.({
					direction: event.shiftKey ? 'left' : 'right'
				});
			} else if (event.key === 'Escape') {
				event.preventDefault();
				localEditValue = null;
				if (cellRef) {
					cellRef.textContent = initialValue ?? '';
				}
				cellRef?.blur();
			}
		} else if (isFocused && event.key.length === 1 && !event.ctrlKey && !event.metaKey) {
			// Pre-fill value when typing starts
			localEditValue = event.key;

			queueMicrotask(() => {
				if (cellRef && cellRef.contentEditable === 'true') {
					cellRef.textContent = event.key;
					const range = document.createRange();
					const selection = window.getSelection();
					range.selectNodeContents(cellRef);
					range.collapse(false);
					selection?.removeAllRanges();
					selection?.addRange(range);
				}
			});
		}
	}
</script>

<DataGridCellWrapper
	{cell}
	{table}
	{rowIndex}
	{columnId}
	{isEditing}
	{isFocused}
	{isSelected}
	onkeydown={handleWrapperKeyDown}
>
	<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
	<div
		role="textbox"
		data-slot="grid-cell-content"
		contenteditable={isEditing}
		tabindex={-1}
		bind:this={cellRef}
		onblur={handleBlur}
		oninput={handleInput}
		class={cn('size-full overflow-hidden outline-none', {
			'whitespace-nowrap **:inline **:whitespace-nowrap [&_br]:hidden': isEditing
		})}
	>
		{displayValue}
	</div>
</DataGridCellWrapper>
