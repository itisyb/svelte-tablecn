<script lang="ts">
	import type { Table } from '@tanstack/table-core';
	import DataGridPasteDialog from '$lib/components/data-grid/data-grid-paste-dialog.svelte';

	let pasteMode = $state('');

	const table = {
		options: {
			meta: {
				pasteDialog: {
					open: true,
					rowsNeeded: 2,
					clipboardText: 'Ada'
				},
				onPasteDialogOpenChange: () => {},
				onCellsPaste: (expand?: boolean) => {
					pasteMode = expand ? 'expand' : 'fit';
				}
			}
		}
	} as unknown as Table<unknown>;
</script>

<DataGridPasteDialog {table} />
<output aria-label="paste mode">{pasteMode}</output>
