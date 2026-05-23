<script lang="ts" generics="TData">
	import type { CellVariantProps } from '$lib/types/data-grid.js';
	import DataGridCellWrapper from '../data-grid-cell-wrapper.svelte';
	import { Popover as PopoverPrimitive } from 'bits-ui';
	import { PopoverContent } from '$lib/components/ui/popover/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';

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
	let textareaRef = $state<HTMLTextAreaElement | null>(null);
	let containerRef = $state<HTMLDivElement | null>(null);
	const sideOffset = $derived(-(containerRef?.clientHeight ?? 0));

	// Track timeout for debounced save
	let saveTimeoutId: ReturnType<typeof setTimeout> | null = null;

	// Track local edits separately - this only matters during editing
	let localEditValue = $state<string | null>(null);
	let previousInitialValue = $state<string | null>(null);
	let pendingChar = $state<string | null>(null);

	$effect(() => {
		if (initialValue === previousInitialValue) return;

		previousInitialValue = initialValue;
		localEditValue = null;
	});

	// Value for display and tracking - use localEditValue if set, otherwise initialValue
	const value = $derived(localEditValue ?? initialValue ?? '');

	// Debounced auto-save (300ms delay)
	function debouncedSave(newValue: string) {
		if (saveTimeoutId) {
			clearTimeout(saveTimeoutId);
		}
		saveTimeoutId = setTimeout(() => {
			if (!readOnly) {
				table.options.meta?.onDataUpdate?.({ rowIndex, columnId, value: newValue });
			}
		}, 300);
	}

	function handleSave() {
		const nextValue = value;
		if (saveTimeoutId) {
			clearTimeout(saveTimeoutId);
			saveTimeoutId = null;
		}
		const meta = table.options.meta;
		if (!readOnly && nextValue !== initialValue) {
			meta?.onDataUpdate?.({ rowIndex, columnId, value: nextValue });
		}
		localEditValue = null;
		meta?.onCellEditingStop?.();
	}

	function handleCancel() {
		if (saveTimeoutId) {
			clearTimeout(saveTimeoutId);
			saveTimeoutId = null;
		}
		localEditValue = null;
		const meta = table.options.meta;
		if (!readOnly) {
			meta?.onDataUpdate?.({ rowIndex, columnId, value: initialValue });
		}
		meta?.onCellEditingStop?.();
	}

	function handleOpenChange(isOpen: boolean) {
		const meta = table.options.meta;
		if (isOpen && !readOnly) {
			meta?.onCellEditingStart?.(rowIndex, columnId);
		} else {
			const nextValue = value;
			if (!readOnly && nextValue !== initialValue) {
				meta?.onDataUpdate?.({ rowIndex, columnId, value: nextValue });
			}
			localEditValue = null;
			meta?.onCellEditingStop?.();
		}
	}

	function handleOpenAutoFocus(event: Event) {
		event.preventDefault();
		if (textareaRef) {
			textareaRef.focus();
			const length = textareaRef.value.length;
			textareaRef.setSelectionRange(length, length);
			insertPendingChar();
		}
	}

	function insertPendingChar() {
		const char = pendingChar;
		pendingChar = null;
		if (!char) return;

		requestAnimationFrame(() => {
			const textarea = textareaRef;
			if (!textarea || document.activeElement !== textarea) return;

			const start = textarea.selectionStart ?? textarea.value.length;
			const end = textarea.selectionEnd ?? start;
			const nextValue = textarea.value.slice(0, start) + char + textarea.value.slice(end);
			const nextCaret = start + char.length;

			textarea.value = nextValue;
			textarea.setSelectionRange(nextCaret, nextCaret);
			textarea.scrollTop = textarea.scrollHeight;
			setTextareaValue(nextValue);
		});
	}

	function handleBlur() {
		const nextValue = value;
		const meta = table.options.meta;
		if (!readOnly && nextValue !== initialValue) {
			meta?.onDataUpdate?.({ rowIndex, columnId, value: nextValue });
		}
		localEditValue = null;
		meta?.onCellEditingStop?.();
	}

	function setTextareaValue(newValue: string) {
		localEditValue = newValue;
		debouncedSave(newValue);
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			event.preventDefault();
			event.stopPropagation();
			handleCancel();
		} else if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
			event.preventDefault();
			event.stopPropagation();
			handleSave();
		} else if (event.key === 'Tab') {
			event.preventDefault();
			event.stopPropagation();
			const nextValue = value;
			const meta = table.options.meta;
			if (nextValue !== initialValue) {
				meta?.onDataUpdate?.({ rowIndex, columnId, value: nextValue });
			}
			localEditValue = null;
			meta?.onCellEditingStop?.({
				direction: event.shiftKey ? 'left' : 'right'
			});
			return;
		}
		event.stopPropagation();
	}

	function handleWrapperKeyDown(event: KeyboardEvent) {
		if (
			isFocused &&
			!isEditing &&
			!readOnly &&
			event.key.length === 1 &&
			!event.ctrlKey &&
			!event.metaKey
		) {
			pendingChar = event.key;
		}
	}
</script>

<DataGridCellWrapper
	bind:wrapperRef={containerRef}
	{cell}
	{table}
	{rowIndex}
	{columnId}
	{isEditing}
	{isFocused}
	{isSelected}
	onkeydown={handleWrapperKeyDown}
>
	<span data-slot="grid-cell-content">{value}</span>
</DataGridCellWrapper>

{#if isEditing}
	<PopoverPrimitive.Root open={isEditing} onOpenChange={handleOpenChange}>
		<PopoverContent
			data-grid-cell-editor=""
			align="start"
			side="bottom"
			{sideOffset}
			class="w-[400px] rounded-none p-0"
			onOpenAutoFocus={handleOpenAutoFocus}
			customAnchor={containerRef}
		>
			<Textarea
				bind:ref={textareaRef}
				placeholder="Enter text..."
				class="max-h-[300px] min-h-[150px] resize-none overflow-y-auto rounded-none border-0 shadow-none focus-visible:ring-1 focus-visible:ring-ring"
				bind:value={() => value, setTextareaValue}
				onblur={handleBlur}
				onkeydown={handleKeyDown}
			/>
		</PopoverContent>
	</PopoverPrimitive.Root>
{/if}
