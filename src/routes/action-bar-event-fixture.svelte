<script lang="ts">
	import {
		ActionBar,
		ActionBarGroup,
		ActionBarItem
	} from '$lib/components/ui/action-bar/index.js';

	let groupRef = $state<HTMLDivElement | null>(null);
	let selectGroupRef = $state<HTMLDivElement | null>(null);
	let open = $state(true);
	let entryFocusCanceled = $state('no');
	let entryFocusActiveElement = $state('');
	let itemSelectDefaultPrevented = $state('no');
	let itemSelectCalled = $state('no');

	$effect(() => {
		if (!groupRef) return;

		function onEntryFocus(event: Event) {
			entryFocusCanceled = 'yes';
			event.preventDefault();
		}

		groupRef.addEventListener('actionbarFocusGroup.onEntryFocus', onEntryFocus);
		return () => groupRef?.removeEventListener('actionbarFocusGroup.onEntryFocus', onEntryFocus);
	});

	$effect(() => {
		if (!selectGroupRef) return;

		function onItemSelect(event: Event) {
			itemSelectDefaultPrevented = event.defaultPrevented ? 'yes' : 'no';
		}

		selectGroupRef.addEventListener('actionbar.itemSelect', onItemSelect);
		return () => selectGroupRef?.removeEventListener('actionbar.itemSelect', onItemSelect);
	});

	function focusGroup() {
		groupRef?.focus();
		entryFocusActiveElement = document.activeElement === groupRef ? 'group' : 'item';
	}

	function preventSelect(event: Event) {
		itemSelectCalled = 'yes';
		event.preventDefault();
	}

	function onOpenChange(nextOpen: boolean) {
		open = nextOpen;
	}
</script>

<button type="button" onclick={focusGroup}>Focus entry group</button>
<span aria-label="entry focus canceled">{entryFocusCanceled}</span>
<span aria-label="entry focus active element">{entryFocusActiveElement}</span>
<span aria-label="item select default prevented">{itemSelectDefaultPrevented}</span>
<span aria-label="item select called">{itemSelectCalled}</span>
<span aria-label="action bar open">{open ? 'open' : 'closed'}</span>

<ActionBar open>
	<ActionBarGroup bind:ref={groupRef}>
		<ActionBarItem>Entry target</ActionBarItem>
	</ActionBarGroup>
</ActionBar>

<ActionBar {open} {onOpenChange}>
	<ActionBarGroup bind:ref={selectGroupRef}>
		<ActionBarItem onselect={preventSelect}>Prevent select</ActionBarItem>
	</ActionBarGroup>
</ActionBar>
