<script lang="ts">
	import type { SearchState } from '$lib/types/data-grid.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import ChevronUp from '@lucide/svelte/icons/chevron-up';
	import X from '@lucide/svelte/icons/x';

	interface Props {
		searchState: SearchState;
	}

	let { searchState }: Props = $props();

	// Local state only
	let query = $state('');
	let matchCount = $state(0);
	let currentMatchIndex = $state(0);
	let isOpen = $state(false);
	let inputRef = $state<HTMLInputElement | null>(null);
	
	// Sync isOpen from searchState on mount and when it changes
	$effect(() => {
		const open = searchState.searchOpen;
		console.log('Effect 1: isOpen sync, open=', open);
		isOpen = open;
		
		// Focus input when opening
		if (open && inputRef) {
			console.log('Focusing input');
			requestAnimationFrame(() => {
				inputRef?.focus();
			});
		}
	});

	function handleWindowKeydown(event: KeyboardEvent) {
		if (!isOpen) return;
		
		if (event.key === 'Escape') {
			event.preventDefault();
			searchState.onSearchOpenChange(false);
		}
	}

	// Simple search without debounce for testing
	function handleInput(event: Event) {
		console.log('handleInput called');
		const target = event.target as HTMLInputElement;
		const newQuery = target.value;
		console.log('New query:', newQuery);
		
		query = newQuery;
		console.log('Query state updated');
		
		// DON'T call search - just update local state for now
		// searchState.onSearch(query);
		
		// matchCount = searchState.searchMatches.length;
		// currentMatchIndex = searchState.matchIndex;
		console.log('handleInput done');
	}

	function handleNavigateNext() {
		searchState.onNavigateToNextMatch();
		currentMatchIndex = searchState.matchIndex;
	}
	
	function handleNavigatePrev() {
		searchState.onNavigateToPrevMatch();
		currentMatchIndex = searchState.matchIndex;
	}

	function onKeyDown(event: KeyboardEvent) {
		event.stopPropagation();

		if (event.key === 'Enter') {
			event.preventDefault();
			if (event.shiftKey) {
				handleNavigatePrev();
			} else {
				handleNavigateNext();
			}
		}
	}

	function onClose() {
		searchState.onSearchOpenChange(false);
	}
</script>

<svelte:window onkeydown={handleWindowKeydown} />

{#if isOpen}
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
				value={query}
				oninput={handleInput}
				onkeydown={onKeyDown}
			/>
			<div class="flex items-center gap-1">
				<Button
					aria-label="Previous match"
					variant="ghost"
					size="icon"
					class="size-7"
					onclick={handleNavigatePrev}
					disabled={matchCount === 0}
				>
					<ChevronUp />
				</Button>
				<Button
					aria-label="Next match"
					variant="ghost"
					size="icon"
					class="size-7"
					onclick={handleNavigateNext}
					disabled={matchCount === 0}
				>
					<ChevronDown />
				</Button>
				<Button aria-label="Close search" variant="ghost" size="icon" class="size-7" onclick={onClose}>
					<X />
				</Button>
			</div>
		</div>
		<div class="flex items-center gap-1 whitespace-nowrap text-muted-foreground text-xs">
			{#if matchCount > 0}
				<span>
					{currentMatchIndex + 1} of {matchCount}
				</span>
			{:else if query}
				<span>No results</span>
			{:else}
				<span>Type to search</span>
			{/if}
		</div>
	</div>
{/if}
