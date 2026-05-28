<script lang="ts" generics="TData">
	import { tick } from 'svelte';
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
	let wrapperRef = $state<HTMLDivElement | null>(null);

	// Track local edits separately - this only matters during editing
	let localEditValue = $state<string | null>(null);
	let previousInitialValue = $state<string | null>(null);

	$effect(() => {
		if (initialValue === previousInitialValue) return;

		previousInitialValue = initialValue;
		localEditValue = null;
	});

	// The display value is either the local edit (during editing) or the initial value
	const displayValue = $derived(!isEditing ? (initialValue ?? '') : '');

	// Value for tracking edits - use localEditValue if set, otherwise initialValue
	const value = $derived(localEditValue ?? initialValue ?? '');

	function getTextContent() {
		return isEditing ? value : displayValue;
	}

	function setTextContent(nextValue: string | null) {
		if (isEditing) {
			localEditValue = nextValue ?? '';
		}
	}

	function getCurrentTextValue() {
		return cellRef?.textContent ?? value;
	}

	function moveCaretToEnd() {
		if (!cellRef?.textContent) return;

		const range = document.createRange();
		const selection = window.getSelection();
		range.selectNodeContents(cellRef);
		range.collapse(false);
		selection?.removeAllRanges();
		selection?.addRange(range);
	}

	// Focus cell when entering edit mode
	$effect(() => {
		if (isEditing && cellRef) {
			cellRef.focus();
			moveCaretToEnd();
		}
	});

	function handleBlur(event: FocusEvent) {
		const relatedTarget = event.relatedTarget;
		if (relatedTarget instanceof Node && wrapperRef?.contains(relatedTarget)) {
			requestAnimationFrame(() => cellRef?.focus());
			return;
		}

		const currentValue = getCurrentTextValue();
		const meta = table.options.meta;
		if (!readOnly && currentValue !== initialValue) {
			meta?.onDataUpdate?.({ rowIndex, columnId, value: currentValue });
		}
		localEditValue = null;
		meta?.onCellEditingStop?.();
	}

	function handleWrapperKeyDown(event: KeyboardEvent) {
		const meta = table.options.meta;
		if (isEditing) {
			if (event.key === 'Enter') {
				event.preventDefault();
				event.stopPropagation();
				const currentValue = getCurrentTextValue();
				if (currentValue !== initialValue) {
					meta?.onDataUpdate?.({ rowIndex, columnId, value: currentValue });
				}
				localEditValue = null;
				meta?.onCellEditingStop?.({ moveToNextRow: true });
			} else if (event.key === 'Tab') {
				event.preventDefault();
				event.stopPropagation();
				const currentValue = getCurrentTextValue();
				if (currentValue !== initialValue) {
					meta?.onDataUpdate?.({ rowIndex, columnId, value: currentValue });
				}
				localEditValue = null;
				meta?.onCellEditingStop?.({
					direction: event.shiftKey ? 'left' : 'right'
				});
			} else if (event.key === 'Escape') {
				event.preventDefault();
				event.stopPropagation();
				localEditValue = initialValue;
				if (cellRef) {
					cellRef.textContent = initialValue;
				}
				cellRef?.blur();
			}
		} else if (isFocused && event.key.length === 1 && !event.ctrlKey && !event.metaKey) {
			// Pre-fill value when typing starts
			localEditValue = event.key;

			void tick().then(() => {
				if (cellRef && cellRef.contentEditable === 'true') {
					moveCaretToEnd();
				}
			});
		}
	}
</script>

<DataGridCellWrapper
	bind:wrapperRef
	{cell}
	{table}
	{rowIndex}
	{columnId}
	{isEditing}
	{isFocused}
	{isSelected}
	onkeydown={handleWrapperKeyDown}
>
	{#if isEditing}
		<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
		<div
			role="textbox"
			data-slot="grid-cell-content"
			contenteditable="true"
			tabindex={-1}
			bind:this={cellRef}
			bind:textContent={getTextContent, setTextContent}
			onblur={handleBlur}
			class={cn(
				'size-full overflow-hidden text-start outline-none',
				'whitespace-nowrap **:inline **:whitespace-nowrap [&_br]:hidden'
			)}
		></div>
	{:else}
		<div data-slot="grid-cell-content" class="size-full overflow-hidden text-start outline-none">
			{displayValue}
		</div>
	{/if}
</DataGridCellWrapper>
