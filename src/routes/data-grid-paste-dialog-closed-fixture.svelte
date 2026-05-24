<script lang="ts">
	import type { Table } from '@tanstack/table-core';
	import DataGridPasteDialog from '$lib/components/data-grid/data-grid-paste-dialog.svelte';

	const table = {
		options: {
			meta: {
				pasteDialog: {
					open: false,
					rowsNeeded: 2,
					clipboardText: 'Ada'
				},
				onPasteDialogOpenChange: () => {},
				onCellsPaste: () => {}
			}
		}
	} as unknown as Table<unknown>;
</script>

<DataGridPasteDialog {table} />
