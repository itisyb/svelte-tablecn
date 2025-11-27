<script lang="ts">
	import type { CellPosition } from '$lib/types/data-grid.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import ChevronUp from '@lucide/svelte/icons/chevron-up';
	import X from '@lucide/svelte/icons/x';

	// Pass individual values as props - NOT an object with getters
	// This is the Svelte 5 way: primitive/array props are properly reactive
	interface Props {
		searchOpen: boolean;
		searchQuery: string;
		searchMatches: CellPosition[];
		matchIndex: number;
		onSearchOpenChange: (open: boolean) => void;
		onSearchQueryChange: (query: string) => void;
		onSearch: (query: string) => void;
		onNavigateToNextMatch: () => void;
		onNavigateToPrevMatch: () => void;
	}

	let {
		searchOpen,
		searchQuery,
		searchMatches,
		matchIndex,
		onSearchOpenChange,
		onSearchQueryChange,
		onSearch,
		onNavigateToNextMatch,
		onNavigateToPrevMatch
	}: Props = $props();

	// Debug - DO NOT REMOVE until user says so
	$inspect('SearchComponent', { searchOpen, searchQuery, matchCount: searchMatches.length, matchIndex });

	let inputRef = $state<HTMLInputElement | null>(null);

	// Debounce timer
	let debounceTimer: ReturnType<typeof setTimeout> | null = null;

	// Focus input when opening
	$effect(() => {
		if (searchOpen && inputRef) {
			requestAnimationFrame(() => {
				inputRef?.focus();
			});
		}
	});

	// Cleanup debounce timer on unmount
	$effect(() => {
		return () => {
			if (debounceTimer) {
				clearTimeout(debounceTimer);
			}
		};
	});

	function handleWindowKeydown(event: KeyboardEvent) {
		if (!searchOpen) return;

		if (event.key === 'Escape') {
			event.preventDefault();
			onSearchOpenChange(false);
		}
	}

	function handleInput(event: Event) {
		const target = event.target as HTMLInputElement;
		const value = target.value;

		// Update query immediately for UI responsiveness
		onSearchQueryChange(value);

		// Clear previous timer
		if (debounceTimer) {
			clearTimeout(debounceTimer);
		}

		// Debounce the actual search (150ms like React)
		debounceTimer = setTimeout(() => {
			onSearch(value);
		}, 150);
	}

	function onKeyDown(event: KeyboardEvent) {
		event.stopPropagation();

		if (event.key === 'Enter') {
			event.preventDefault();
			if (event.shiftKey) {
				onNavigateToPrevMatch();
			} else {
				onNavigateToNextMatch();
			}
		}
	}

	function onClose() {
		onSearchOpenChange(false);
	}
</script>

<svelte:window onkeydown={handleWindowKeydown} />

{#if searchOpen}
	<div
		role="search"
		data-slot="grid-search"
		class="fade-in-0 slide-in-from-top-2 absolute top-4 right-4 z-50 flex animate-in flex-col gap-2 rounded-lg border bg-background p-2 shadow-lg"
	>
		<div class="flex items-center gap-2">
			<input
				bind:this={inputRef}
				type="text"
				autocomplete="off"
				autocorrect="off"
				autocapitalize="off"
				spellcheck="false"
				placeholder="Find in table..."
				class="flex h-8 w-64 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring md:text-sm"
				value={searchQuery}
				oninput={handleInput}
				onkeydown={onKeyDown}
			/>
			<div class="flex items-center gap-1">
				<Button
					aria-label="Previous match"
					variant="ghost"
					size="icon"
					class="size-7"
					onclick={onNavigateToPrevMatch}
					disabled={searchMatches.length === 0}
				>
					<ChevronUp />
				</Button>
				<Button
					aria-label="Next match"
					variant="ghost"
					size="icon"
					class="size-7"
					onclick={onNavigateToNextMatch}
					disabled={searchMatches.length === 0}
				>
					<ChevronDown />
				</Button>
				<Button aria-label="Close search" variant="ghost" size="icon" class="size-7" onclick={onClose}>
					<X />
				</Button>
			</div>
		</div>
		<div class="flex items-center gap-1 whitespace-nowrap text-muted-foreground text-xs">
			{#if searchMatches.length > 0}
				<span>
					{matchIndex + 1} of {searchMatches.length}
				</span>
			{:else if searchQuery}
				<span>No results</span>
			{:else}
				<span>Type to search</span>
			{/if}
		</div>
	</div>
{/if}
