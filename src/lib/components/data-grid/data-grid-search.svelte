<script lang="ts">
	import type { SearchState } from '$lib/types/data-grid.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import ChevronUp from '@lucide/svelte/icons/chevron-up';
	import X from '@lucide/svelte/icons/x';

	interface Props extends SearchState {}

	let {
		searchMatches,
		matchIndex,
		searchOpen,
		onSearchOpenChange,
		searchQuery,
		onSearchQueryChange,
		onSearch,
		onNavigateToNextMatch,
		onNavigateToPrevMatch
	}: Props = $props();

	let inputRef = $state<HTMLInputElement | null>(null);

	// Focus input when search opens
	$effect(() => {
		if (searchOpen) {
			requestAnimationFrame(() => {
				inputRef?.focus();
			});
		}
	});

	// Handle escape key
	$effect(() => {
		if (!searchOpen) return;

		function onEscape(event: KeyboardEvent) {
			if (event.key === 'Escape') {
				event.preventDefault();
				onSearchOpenChange(false);
			}
		}

		document.addEventListener('keydown', onEscape);
		return () => document.removeEventListener('keydown', onEscape);
	});

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

	// Simple debounce
	let debounceTimer: ReturnType<typeof setTimeout> | null = null;
	function debouncedSearch(query: string) {
		if (debounceTimer) {
			clearTimeout(debounceTimer);
		}
		debounceTimer = setTimeout(() => {
			onSearch(query);
		}, 150);
	}

	function onChange(event: Event) {
		const target = event.target as HTMLInputElement;
		const value = target.value;
		onSearchQueryChange(value);
		debouncedSearch(value);
	}

	function onTriggerPointerDown(event: PointerEvent) {
		// prevent implicit pointer capture
		const target = event.target;
		if (!(target instanceof HTMLElement)) return;
		if (target.hasPointerCapture(event.pointerId)) {
			target.releasePointerCapture(event.pointerId);
		}

		// Only prevent default if we're not clicking on the input
		if (
			event.button === 0 &&
			event.ctrlKey === false &&
			event.pointerType === 'mouse' &&
			!(event.target instanceof HTMLInputElement)
		) {
			event.preventDefault();
		}
	}

	function onClose() {
		onSearchOpenChange(false);
	}
</script>

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
				oninput={onChange}
				onkeydown={onKeyDown}
			/>
			<div class="flex items-center gap-1">
				<Button
					aria-label="Previous match"
					variant="ghost"
					size="icon"
					class="size-7"
					onclick={onNavigateToPrevMatch}
					onpointerdown={onTriggerPointerDown}
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
					onpointerdown={onTriggerPointerDown}
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
