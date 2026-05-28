<script lang="ts">
	import type { Table } from '@tanstack/table-core';
	import DataGridRowHeightMenu from '$lib/components/data-grid/data-grid-row-height-menu.svelte';

	const table = {
		options: {
			meta: {
				rowHeight: 'short',
				onRowHeightChange: () => {}
			}
		}
	} as unknown as Table<unknown>;
</script>

<DataGridRowHeightMenu {table} class="row-height-content-fixture" />
