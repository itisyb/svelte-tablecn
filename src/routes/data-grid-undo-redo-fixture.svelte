<script lang="ts">
	import { useDataGridUndoRedo } from '$lib/hooks/use-data-grid-undo-redo.svelte.js';

	interface Row {
		id: string;
		name: string;
		role: string;
	}

	let data = $state<Row[]>([
		{ id: '1', name: 'Ada', role: 'Engineer' },
		{ id: '2', name: 'Grace', role: 'Manager' }
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

	function pasteBatch() {
		const nextData = data.map((row) => {
			if (row.id === '1') return { ...row, name: 'Lin', role: 'Researcher' };
			if (row.id === '2') return { ...row, name: 'Katherine', role: 'Analyst' };
			return row;
		});

		const updates = data.flatMap((row, rowIndex) => {
			const nextRow = nextData[rowIndex];
			if (!nextRow) return [];

			return [
				{
					rowId: row.id,
					columnId: 'name',
					previousValue: row.name,
					newValue: nextRow.name
				},
				{
					rowId: row.id,
					columnId: 'role',
					previousValue: row.role,
					newValue: nextRow.role
				}
			];
		});

		undoRedo.trackCellsUpdate(updates);
		data = nextData;
	}
</script>

<button type="button" onclick={() => updateFirstName('Lin')}>Edit first name</button>
<button type="button" onclick={pasteBatch}>Paste batch</button>
<button type="button" onclick={undoRedo.onUndo}>Undo</button>
<button type="button" onclick={undoRedo.onRedo}>Redo</button>

<span aria-label="first name">{data[0]?.name}</span>
<span aria-label="first role">{data[0]?.role}</span>
<span aria-label="second name">{data[1]?.name}</span>
<span aria-label="second role">{data[1]?.role}</span>
<span aria-label="can undo">{undoRedo.canUndo ? 'yes' : 'no'}</span>
<span aria-label="can redo">{undoRedo.canRedo ? 'yes' : 'no'}</span>
