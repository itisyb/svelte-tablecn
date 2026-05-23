<script lang="ts">
	import type { Table } from '@tanstack/table-core';
	import DataGridViewMenu from '$lib/components/data-grid/data-grid-view-menu.svelte';

	let columnVisibility = $state<Record<string, boolean>>({});

	const columns = [
		{
			id: 'user_name',
			accessorFn: () => undefined,
			getCanHide: () => true,
			columnDef: { meta: { label: 'Full Name' } },
			toggleVisibility: (value: boolean) => {
				columnVisibility = { ...columnVisibility, user_name: value };
			}
		},
		{
			id: 'team',
			accessorFn: () => undefined,
			getCanHide: () => true,
			columnDef: { meta: { label: 'Team' } },
			toggleVisibility: (value: boolean) => {
				columnVisibility = { ...columnVisibility, team: value };
			}
		}
	];

	const table = {
		getAllColumns: () => columns,
		getState: () => ({ columnVisibility })
	} as unknown as Table<unknown>;
</script>

<DataGridViewMenu {table} />
