<script lang="ts">
	import type { ColumnDef } from '@tanstack/table-core';
	import { useDataGrid } from '$lib/components/data-grid';

	type Row = {
		id: string;
		name: string;
	};

	let data = $state<Row[]>([{ id: '1', name: 'Ada' }]);

	const columns: ColumnDef<Row, unknown>[] = [
		{
			id: 'name',
			accessorKey: 'name',
			header: 'Name',
			meta: {
				cell: {
					variant: 'short-text'
				}
			}
		}
	];

	const { table } = useDataGrid({
		columns,
		data: () => data,
		onDataChange: (nextData) => {
			data = nextData;
		},
		getRowId: (row) => row.id,
		enablePaste: true
	});

	function pasteWithoutFocus() {
		table.options.meta?.onCellsPaste?.();
	}
</script>

<button type="button" onclick={pasteWithoutFocus}>Paste without focus</button>
<output aria-label="first name">{data[0]?.name}</output>
