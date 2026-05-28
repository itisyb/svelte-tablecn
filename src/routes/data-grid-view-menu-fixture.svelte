<script lang="ts">
	import type { Table } from '@tanstack/table-core';
	import DataGridViewMenu from '$lib/components/data-grid/data-grid-view-menu.svelte';

	const table = {
		getAllColumns: () => [],
		getState: () => ({ columnVisibility: {} })
	} as unknown as Table<unknown>;
</script>

<DataGridViewMenu {table} disabled />
