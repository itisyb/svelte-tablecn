<script lang="ts" generics="TData">
	import type { CellVariantProps } from '$lib/types/data-grid.js';
	import DataGridCellWrapper from '../data-grid-cell-wrapper.svelte';
	import { cn } from '$lib/utils.js';
	import { toast } from 'svelte-sonner';

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

	function getUrlHref(urlString: string): string {
		if (!urlString || urlString.trim() === '') return '';

		const trimmed = urlString.trim();

		// Reject dangerous protocols
		if (/^(javascript|data|vbscript|file):/i.test(trimmed)) {
			return '';
		}

		// Check if it already has a protocol
		if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
			return trimmed;
		}

		// Add http:// prefix for links without protocol
		return `http://${trimmed}`;
	}

	function handleBlur() {
		const currentValue = cellRef?.textContent?.trim() ?? '';
		const meta = table.options.meta;

		if (!readOnly && currentValue !== initialValue) {
			meta?.onDataUpdate?.({
				rowIndex,
				columnId,
				value: currentValue || null
			});
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
				const currentValue = cellRef?.textContent?.trim() ?? '';
				if (!readOnly && currentValue !== initialValue) {
					meta?.onDataUpdate?.({
						rowIndex,
						columnId,
						value: currentValue || null
					});
				}
				meta?.onCellEditingStop?.({ moveToNextRow: true });
			} else if (event.key === 'Tab') {
				event.preventDefault();
				const currentValue = cellRef?.textContent?.trim() ?? '';
				if (!readOnly && currentValue !== initialValue) {
					meta?.onDataUpdate?.({
						rowIndex,
						columnId,
						value: currentValue || null
					});
				}
				meta?.onCellEditingStop?.({
					direction: event.shiftKey ? 'left' : 'right'
				});
			} else if (event.key === 'Escape') {
				event.preventDefault();
				value = initialValue ?? '';
				cellRef?.blur();
			}
		} else if (isFocused && !readOnly && event.key.length === 1 && !event.ctrlKey && !event.metaKey) {
			// Handle typing to pre-fill the value when editing starts
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

	function handleLinkClick(event: MouseEvent) {
		if (isEditing) {
			event.preventDefault();
			return;
		}

		// Check if URL was rejected due to dangerous protocol
		const href = getUrlHref(value);
		if (!href) {
			event.preventDefault();
			toast.error('Invalid URL', {
				description: 'URL contains a dangerous protocol (javascript:, data:, vbscript:, or file:)'
			});
			return;
		}

		// Stop propagation to prevent grid from interfering with link navigation
		event.stopPropagation();
	}

	const displayValue = $derived(!isEditing ? (value ?? '') : '');
	const urlHref = $derived(displayValue ? getUrlHref(displayValue) : '');
	const isDangerousUrl = $derived(displayValue && !urlHref);
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
	{#if !isEditing && displayValue}
		<div data-slot="grid-cell-content" class="size-full overflow-hidden">
			<a
				data-focused={isFocused && !isDangerousUrl ? '' : undefined}
				data-invalid={isDangerousUrl ? '' : undefined}
				href={urlHref}
				target="_blank"
				rel="noopener noreferrer"
				class="truncate text-primary underline decoration-primary/30 underline-offset-2 hover:decoration-primary/60 data-[invalid]:cursor-not-allowed data-[focused]:text-foreground data-[invalid]:text-destructive data-[focused]:decoration-foreground/50 data-[invalid]:decoration-destructive/50 data-[focused]:hover:decoration-foreground/70 data-[invalid]:hover:decoration-destructive/70"
				onclick={handleLinkClick}
			>
				{displayValue}
			</a>
		</div>
	{:else}
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
	{/if}
</DataGridCellWrapper>
