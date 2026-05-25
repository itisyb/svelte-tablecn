<script lang="ts">
	import {
		Sortable,
		SortableContent,
		SortableItem,
		SortableItemHandle,
		type SortableItemData
	} from '$lib/components/ui/sortable';

	type Item = {
		id: string;
		label: string;
	};

	let items = $state<Item[]>([
		{ id: 'one', label: 'One' },
		{ id: 'two', label: 'Two' },
		{ id: 'three', label: 'Three' }
	]);
	let contentRef = $state<HTMLDivElement | null>(null);

	function getItemValue(item: Item) {
		return item.id;
	}

	function dispatchFinalize() {
		const nextItems: SortableItemData<Item>[] = [items[1], items[0], items[2]]
			.filter((item): item is Item => Boolean(item))
			.map((item, index) => ({
				id: item.id,
				value: item,
				_sortableIndex: index
			}));

		contentRef?.dispatchEvent(
			new CustomEvent('finalize', {
				bubbles: true,
				detail: {
					items: nextItems,
					info: {
						id: 'two',
						trigger: 'droppedIntoZone'
					}
				}
			})
		);
	}
</script>

<button type="button" onclick={dispatchFinalize}>Finalize reorder</button>
<Sortable value={items} {getItemValue} onValueChange={(nextItems) => (items = nextItems)}>
	<SortableContent bind:ref={contentRef} class="flex flex-col gap-2">
		{#each items as item (item.id)}
			<SortableItem value={item.id} class="rounded border p-2">
				<span>{item.label}</span>
				<SortableItemHandle aria-label={`Drag ${item.label}`}>Drag</SortableItemHandle>
			</SortableItem>
		{/each}
	</SortableContent>
</Sortable>
<output aria-label="sortable order">{items.map((item) => item.id).join(',')}</output>
