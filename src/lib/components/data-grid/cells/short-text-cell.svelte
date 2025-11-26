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
		readOnly = false
	}: CellVariantProps<TData> = $props();

	const initialValue = $derived(cell.getValue() as string);
	let value = $state('');
	let cellRef = $state<HTMLDivElement | null>(null);

	// Initialize and sync value
	$effect(() => {
		const iv = initialValue ?? '';
		if (iv !== value && !isEditing) {
			value = iv;
			if (cellRef) {
				cellRef.textContent = iv;
			}
		}
	});

	// Focus cell when entering edit mode
	$effect(() => {
		if (isEditing && cellRef) {
			cellRef.focus();

			if (!cellRef.textContent && value) {
				cellRef.textContent = value;
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
		value = target.textContent ?? '';
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
				value = initialValue ?? '';
				cellRef?.blur();
			}
		} else if (isFocused && event.key.length === 1 && !event.ctrlKey && !event.metaKey) {
			// Pre-fill value when typing starts
			value = event.key;

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

	const displayValue = $derived(!isEditing ? (value ?? '') : '');
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
