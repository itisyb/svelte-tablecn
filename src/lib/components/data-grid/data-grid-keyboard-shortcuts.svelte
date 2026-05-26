<script lang="ts">
	import { browser } from '$app/environment';
	import { Button } from '$lib/components/ui/button/index.js';
	import {
		Dialog,
		DialogContent,
		DialogClose,
		DialogHeader,
		DialogTitle,
		DialogDescription
	} from '$lib/components/ui/dialog/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { Kbd, KbdGroup } from '$lib/components/ui/kbd/index.js';

	// Icons
	import Search from '@lucide/svelte/icons/search';
	import X from '@lucide/svelte/icons/x';

	const SHORTCUT_KEY = '/';
	type Direction = 'ltr' | 'rtl';

	interface ShortcutGroup {
		title: string;
		shortcuts: Array<{
			keys: string[];
			description: string;
		}>;
	}

	interface Props {
		dir?: Direction;
		enableSearch?: boolean;
		enableUndoRedo?: boolean;
		enablePaste?: boolean;
		enableRowAdd?: boolean;
		enableRowsDelete?: boolean;
	}

	let {
		dir = 'ltr',
		enableSearch = false,
		enableUndoRedo = false,
		enablePaste = false,
		enableRowAdd = false,
		enableRowsDelete = false
	}: Props = $props();

	let open = $state(false);
	let input = $state('');
	let inputRef: HTMLInputElement | null = $state(null);

	const isMac = browser ? /Mac|iPhone|iPad|iPod/.test(navigator.userAgent) : false;
	const modKey = isMac ? '⌘' : 'Ctrl';

	function onOpenChange(isOpen: boolean) {
		open = isOpen;
		if (!isOpen) {
			input = '';
		}
	}

	function onOpenAutoFocus(event: Event) {
		event.preventDefault();
		inputRef?.focus();
	}

	const shortcutGroups = $derived.by((): ShortcutGroup[] => {
		const groups: ShortcutGroup[] = [
			{
				title: 'Navigation',
				shortcuts: [
					{ keys: ['↑', '↓', '←', '→'], description: 'Navigate between cells' },
					{ keys: ['Tab'], description: 'Move to next cell' },
					{ keys: ['Shift', 'Tab'], description: 'Move to previous cell' },
					{ keys: ['Home'], description: 'Move to first column' },
					{ keys: ['End'], description: 'Move to last column' },
					{ keys: [modKey, '↑'], description: 'Move to first row (same column)' },
					{ keys: [modKey, '↓'], description: 'Move to last row (same column)' },
					{ keys: [modKey, '←'], description: 'Move to first column (same row)' },
					{ keys: [modKey, '→'], description: 'Move to last column (same row)' },
					{ keys: [modKey, 'Home'], description: 'Move to first cell' },
					{ keys: [modKey, 'End'], description: 'Move to last cell' },
					{ keys: ['PgUp'], description: 'Move up one page' },
					{ keys: ['PgDn'], description: 'Move down one page' },
					{ keys: ['⌥', '↑'], description: 'Scroll up one page' },
					{ keys: ['⌥', '↓'], description: 'Scroll down one page' },
					{ keys: ['⌥', 'PgUp'], description: 'Scroll left one page of columns' },
					{ keys: ['⌥', 'PgDn'], description: 'Scroll right one page of columns' }
				]
			},
			{
				title: 'Selection',
				shortcuts: [
					{ keys: ['Shift', '↑↓←→'], description: 'Extend selection' },
					{ keys: [modKey, 'Shift', '↑'], description: 'Select to top of table' },
					{ keys: [modKey, 'Shift', '↓'], description: 'Select to bottom of table' },
					{ keys: [modKey, 'Shift', '←'], description: 'Select to first column' },
					{ keys: [modKey, 'Shift', '→'], description: 'Select to last column' },
					{ keys: [modKey, 'A'], description: 'Select all cells' },
					{ keys: [modKey, 'Click'], description: 'Toggle cell selection' },
					{ keys: ['Shift', 'Click'], description: 'Select range' },
					{ keys: ['Esc'], description: 'Clear selection' }
				]
			}
		];

		const editingShortcuts: ShortcutGroup['shortcuts'] = [
			{ keys: ['Enter'], description: 'Start editing cell' },
			{ keys: ['F2'], description: 'Start editing cell' },
			{ keys: ['Double Click'], description: 'Start editing cell' }
		];

		if (enableRowAdd) {
			editingShortcuts.push({ keys: ['Shift', 'Enter'], description: 'Insert row below' });
		}

		editingShortcuts.push(
			{ keys: [modKey, 'C'], description: 'Copy selected cells' },
			{ keys: [modKey, 'X'], description: 'Cut selected cells' },
		);

		if (enablePaste) {
			editingShortcuts.push({ keys: [modKey, 'V'], description: 'Paste cells' });
		}

		editingShortcuts.push(
			{ keys: ['Delete'], description: 'Clear selected cells' },
			{ keys: ['Backspace'], description: 'Clear selected cells' }
		);

		if (enableRowsDelete) {
			editingShortcuts.push(
				{ keys: [modKey, 'Backspace'], description: 'Delete selected rows' },
				{ keys: [modKey, 'Delete'], description: 'Delete selected rows' }
			);
		}

		if (enableUndoRedo) {
			editingShortcuts.push(
				{ keys: [modKey, 'Z'], description: 'Undo last action' },
				{ keys: [modKey, 'Shift', 'Z'], description: 'Redo last action' }
			);
		}

		groups.push({
			title: 'Editing',
			shortcuts: editingShortcuts
		});

		if (enableSearch) {
			groups.push({
				title: 'Search',
				shortcuts: [
					{ keys: [modKey, 'F'], description: 'Open search' },
					{ keys: ['Enter'], description: 'Next match' },
					{ keys: ['Shift', 'Enter'], description: 'Previous match' },
					{ keys: ['Esc'], description: 'Close search' }
				]
			});
		}

		groups.push(
			{
				title: 'Filtering',
				shortcuts: [
					{ keys: [modKey, 'Shift', 'F'], description: 'Toggle the filter menu' },
					{ keys: ['Backspace'], description: 'Remove filter (when focused)' },
					{ keys: ['Delete'], description: 'Remove filter (when focused)' }
				]
			},
			{
				title: 'Sorting',
				shortcuts: [
					{ keys: [modKey, 'Shift', 'S'], description: 'Toggle the sort menu' },
					{ keys: ['Backspace'], description: 'Remove sort (when focused)' },
					{ keys: ['Delete'], description: 'Remove sort (when focused)' }
				]
			},
			{
				title: 'General',
				shortcuts: [{ keys: [modKey, '/'], description: 'Show keyboard shortcuts' }]
			}
		);

		return groups;
	});

	const filteredGroups = $derived.by(() => {
		if (!input.trim()) return shortcutGroups;

		const query = input.toLowerCase();
		return shortcutGroups
			.map((group) => ({
				...group,
				shortcuts: group.shortcuts.filter(
					(shortcut) =>
						shortcut.description.toLowerCase().includes(query) ||
						shortcut.keys.some((key) => key.toLowerCase().includes(query))
				)
			}))
			.filter((group) => group.shortcuts.length > 0);
	});

	function handleKeyDown(event: KeyboardEvent) {
		if ((event.ctrlKey || event.metaKey) && event.key === SHORTCUT_KEY) {
			event.preventDefault();
			open = true;
		}
	}
</script>

<svelte:window onkeydown={handleKeyDown} />

<Dialog {open} {onOpenChange}>
	<DialogContent {dir} class="max-w-2xl px-0" {onOpenAutoFocus} showCloseButton={false}>
		<DialogClose class="absolute top-6 end-6">
			{#snippet child({ props })}
				<Button {...props} variant="ghost" size="icon" class="size-6">
					<X />
				</Button>
			{/snippet}
		</DialogClose>
		<DialogHeader class="px-6">
			<DialogTitle>Keyboard shortcuts</DialogTitle>
			<DialogDescription class="sr-only">
				Use these keyboard shortcuts to navigate and interact with the data grid more efficiently.
			</DialogDescription>
		</DialogHeader>
		<div class="px-6">
			<div class="relative">
				<Search class="-translate-y-1/2 absolute top-1/2 start-3 size-3.5 text-muted-foreground" />
				<Input
					bind:ref={inputRef}
					placeholder="Search shortcuts..."
					class="h-8 ps-8"
					bind:value={input}
				/>
			</div>
		</div>
		<Separator class="mx-auto data-[orientation=horizontal]:w-[calc(100%-(--spacing(12)))]" />
		<div class="h-[40vh] overflow-y-auto px-6">
			{#if filteredGroups.length === 0}
				<div class="flex h-full flex-col items-center justify-center gap-3 text-center">
					<div
						class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground"
					>
						<Search class="pointer-events-none size-6" />
					</div>
					<div class="flex flex-col gap-1">
						<div class="font-medium text-lg tracking-tight">No shortcuts found</div>
						<p class="text-muted-foreground text-sm">Try searching for a different term.</p>
					</div>
				</div>
			{:else}
				<div class="flex flex-col gap-6">
					{#each filteredGroups as shortcutGroup (shortcutGroup.title)}
						<div class="flex flex-col gap-2">
							<h3 class="font-semibold text-foreground text-sm">
								{shortcutGroup.title}
							</h3>
							<div class="divide-y divide-border rounded-md border">
								{#each shortcutGroup.shortcuts as shortcut, index (index)}
									<div class="flex items-center gap-4 px-3 py-2">
										<span class="flex-1 text-sm">{shortcut.description}</span>
										<KbdGroup class="shrink-0">
											{#each shortcut.keys as key, keyIndex (key)}
												{#if keyIndex > 0}
													<span class="text-muted-foreground text-xs">+</span>
												{/if}
												<Kbd>{key}</Kbd>
											{/each}
										</KbdGroup>
									</div>
								{/each}
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</DialogContent>
</Dialog>
