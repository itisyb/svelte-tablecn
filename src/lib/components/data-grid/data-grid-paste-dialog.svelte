<script lang="ts" generics="TData">
	import type { Table } from '@tanstack/table-core';
	import { cn } from '$lib/utils.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import {
		Dialog,
		DialogContent,
		DialogDescription,
		DialogFooter,
		DialogHeader,
		DialogTitle
	} from '$lib/components/ui/dialog/index.js';

	interface Props {
		table: Table<TData>;
	}

	let { table }: Props = $props();

	const meta = $derived(table.options.meta);
	const pasteDialog = $derived(meta?.pasteDialog);
	const onPasteDialogOpenChange = $derived(meta?.onPasteDialogOpenChange);
	const onPasteWithExpansion = $derived(meta?.onPasteWithExpansion);
	const onPasteWithoutExpansion = $derived(meta?.onPasteWithoutExpansion);

	let expandRadioRef = $state<HTMLInputElement | null>(null);

	function onCancel() {
		onPasteDialogOpenChange?.(false);
	}

	function onContinue() {
		if (expandRadioRef?.checked) {
			onPasteWithExpansion?.();
		} else {
			onPasteWithoutExpansion?.();
		}
	}
</script>

{#if pasteDialog}
	<Dialog open={pasteDialog.open} onOpenChange={onPasteDialogOpenChange}>
		<DialogContent data-grid-popover="">
			<DialogHeader>
				<DialogTitle>Do you want to add more rows?</DialogTitle>
				<DialogDescription>
					We need <strong>{pasteDialog.rowsNeeded}</strong> additional row{pasteDialog.rowsNeeded !==
					1
						? 's'
						: ''} to paste everything from your clipboard.
				</DialogDescription>
			</DialogHeader>
			<div class="flex flex-col gap-3 py-1">
				<label class="flex cursor-pointer items-start gap-3">
					<input
						bind:this={expandRadioRef}
						type="radio"
						name="expand-option"
						value="expand"
						checked
						class={cn(
							'relative size-4 shrink-0 appearance-none rounded-full border border-input bg-background shadow-xs outline-none transition-[color,box-shadow]',
							'text-primary focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
							'disabled:cursor-not-allowed disabled:opacity-50',
							"checked:before:-translate-x-1/2 checked:before:-translate-y-1/2 checked:before:absolute checked:before:top-1/2 checked:before:left-1/2 checked:before:size-2 checked:before:rounded-full checked:before:bg-primary checked:before:content-['']",
							'dark:bg-input/30'
						)}
					/>
					<div class="flex flex-col gap-1">
						<span class="font-medium text-sm leading-none"> Create new rows </span>
						<span class="text-muted-foreground text-sm">
							Add {pasteDialog.rowsNeeded} new row{pasteDialog.rowsNeeded !== 1 ? 's' : ''} to the
							table and paste all data
						</span>
					</div>
				</label>
				<label class="flex cursor-pointer items-start gap-3">
					<input
						type="radio"
						name="expand-option"
						value="no-expand"
						class={cn(
							'relative size-4 shrink-0 appearance-none rounded-full border border-input bg-background shadow-xs outline-none transition-[color,box-shadow]',
							'text-primary focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
							'disabled:cursor-not-allowed disabled:opacity-50',
							"checked:before:-translate-x-1/2 checked:before:-translate-y-1/2 checked:before:absolute checked:before:top-1/2 checked:before:left-1/2 checked:before:size-2 checked:before:rounded-full checked:before:bg-primary checked:before:content-['']",
							'dark:bg-input/30'
						)}
					/>
					<div class="flex flex-col gap-1">
						<span class="font-medium text-sm leading-none"> Keep current rows </span>
						<span class="text-muted-foreground text-sm">
							Paste only what fits in the existing rows
						</span>
					</div>
				</label>
			</div>
			<DialogFooter>
				<Button variant="outline" onclick={onCancel}>Cancel</Button>
				<Button onclick={onContinue}>Continue</Button>
			</DialogFooter>
		</DialogContent>
	</Dialog>
{/if}
