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
	
	// Value for display and tracking - use localEditValue if set, otherwise initialValue
	const value = $derived(localEditValue ?? initialValue ?? '');

	// Reset local edit value when editing stops
	$effect(() => {
		if (!isEditing) {
			localEditValue = null;
		}
	});

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
		if (saveTimeoutId) {
			clearTimeout(saveTimeoutId);
			saveTimeoutId = null;
		}
		const meta = table.options.meta;
		if (!readOnly && value !== initialValue) {
			meta?.onDataUpdate?.({ rowIndex, columnId, value });
		}
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
			if (!readOnly && value !== initialValue) {
				meta?.onDataUpdate?.({ rowIndex, columnId, value });
			}
			meta?.onCellEditingStop?.();
		}
	}

	function handleOpenAutoFocus(event: Event) {
		event.preventDefault();
		if (textareaRef) {
			textareaRef.focus();
			const length = textareaRef.value.length;
			textareaRef.setSelectionRange(length, length);
		}
	}

	function handleBlur() {
		const meta = table.options.meta;
		if (!readOnly && value !== initialValue) {
			meta?.onDataUpdate?.({ rowIndex, columnId, value });
		}
		meta?.onCellEditingStop?.();
	}

	function handleInput(event: Event) {
		const target = event.currentTarget as HTMLTextAreaElement;
		const newValue = target.value;
		localEditValue = newValue;
		debouncedSave(newValue);
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			event.preventDefault();
			handleCancel();
		} else if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
			event.preventDefault();
			handleSave();
		} else if (event.key === 'Tab') {
			event.preventDefault();
			const meta = table.options.meta;
			if (value !== initialValue) {
				meta?.onDataUpdate?.({ rowIndex, columnId, value });
			}
			meta?.onCellEditingStop?.({
				direction: event.shiftKey ? 'left' : 'right'
			});
			return;
		}
		event.stopPropagation();
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
>
	<span data-slot="grid-cell-content">{value}</span>
</DataGridCellWrapper>

{#if isEditing}
	<PopoverPrimitive.Root open={isEditing} onOpenChange={handleOpenChange}>
		<PopoverContent
			data-grid-cell-editor=""
			align="start"
			side="bottom"
			sideOffset={sideOffset}
			class="w-[400px] rounded-none p-0"
			onOpenAutoFocus={handleOpenAutoFocus}
			customAnchor={containerRef}
		>
			<Textarea
				bind:ref={textareaRef}
				placeholder="Enter text..."
				class="min-h-[150px] resize-none rounded-none border-0 shadow-none focus-visible:ring-0"
				{value}
				onblur={handleBlur}
				oninput={handleInput}
				onkeydown={handleKeyDown}
			/>
		</PopoverContent>
	</PopoverPrimitive.Root>
{/if}
