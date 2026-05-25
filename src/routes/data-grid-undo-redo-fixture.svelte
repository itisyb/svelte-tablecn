<script lang="ts">
	import { useDataGridUndoRedo } from '$lib/hooks/use-data-grid-undo-redo.svelte.js';

	interface Row {
		id: string;
		name: string;
	}

	let data = $state<Row[]>([
		{ id: '1', name: 'Ada' },
		{ id: '2', name: 'Grace' }
	]);

	const undoRedo = useDataGridUndoRedo({
		data: () => data,
		onDataChange: (nextData) => {
			data = nextData;
		},
		getRowId: (row) => row.id
	});

	function updateFirstName(name: string) {
		const row = data[0];
		if (!row) return;

		undoRedo.trackCellsUpdate([
			{
				rowId: row.id,
				columnId: 'name',
				previousValue: row.name,
				newValue: name
			}
		]);

		data = data.map((item) => (item.id === row.id ? { ...item, name } : item));
	}
</script>

<button type="button" onclick={() => updateFirstName('Lin')}>Edit first name</button>
<button type="button" onclick={undoRedo.onUndo}>Undo</button>
<button type="button" onclick={undoRedo.onRedo}>Redo</button>

<span aria-label="first name">{data[0]?.name}</span>
<span aria-label="can undo">{undoRedo.canUndo ? 'yes' : 'no'}</span>
<span aria-label="can redo">{undoRedo.canRedo ? 'yes' : 'no'}</span>
