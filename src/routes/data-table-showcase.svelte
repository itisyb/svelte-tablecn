<script lang="ts">
	import type { ColumnDef, FilterFn } from '@tanstack/table-core';
	import {
		DataTable,
		DataTableAdvancedToolbar,
		DataTableColumnHeader,
		DataTableFilterList,
		DataTableFilterMenu,
		DataTableSortList,
		DataTableToolbar,
		useDataTable
	} from '$lib/components/data-table';
	import { renderComponent } from '$lib/table/index.js';

	type DemoMode = 'basic' | 'advanced';
	/** Matches tablecn filterFlag: advancedFilters (list) vs commandFilters (menu) */
	type AdvancedFilterUi = 'advancedFilters' | 'commandFilters';

	interface Person {
		id: string;
		name?: string;
		email?: string;
		salary?: number;
		department?: string;
		status?: string;
		skills?: string[];
		isActive?: boolean;
		startDate?: string;
	}

	interface Props {
		mode: DemoMode;
		advancedFilterUi?: AdvancedFilterUi;
		rows: Person[];
		departments: readonly string[];
		statuses: readonly string[];
		skills: readonly string[];
	}

	let {
		mode,
		advancedFilterUi = 'commandFilters',
		rows,
		departments,
		statuses,
		skills
	}: Props = $props();

	const currencyFormatter = new Intl.NumberFormat(undefined, {
		style: 'currency',
		currency: 'USD',
		maximumFractionDigits: 0
	});

	function createColumnHeader(label: string) {
		return ({ column }: { column: ColumnDef<Person, unknown> extends never ? never : any }) =>
			renderComponent(DataTableColumnHeader, { column, label });
	}

	function createFilterFn(
		variant:
			| 'text'
			| 'number'
			| 'range'
			| 'date'
			| 'dateRange'
			| 'select'
			| 'multiSelect'
			| 'boolean'
	): FilterFn<Person> {
		return (row, columnId, filterValue) => {
			const cellValue = row.getValue(columnId);

			if (
				filterValue === undefined ||
				filterValue === null ||
				filterValue === '' ||
				(Array.isArray(filterValue) && filterValue.length === 0)
			) {
				return true;
			}

			switch (variant) {
				case 'text':
					return String(cellValue ?? '')
						.toLowerCase()
						.includes(String(filterValue).toLowerCase());
				case 'number':
					return Number(cellValue ?? Number.NaN) === Number(filterValue);
				case 'range': {
					if (!Array.isArray(filterValue)) return true;
					const [min, max] = filterValue as Array<number | undefined>;
					const value = Number(cellValue ?? Number.NaN);
					if (Number.isNaN(value)) return false;
					return (
						(min === undefined || value >= Number(min)) &&
						(max === undefined || value <= Number(max))
					);
				}
				case 'date': {
					if (typeof filterValue !== 'string') return true;
					return String(cellValue ?? '').slice(0, 10) === filterValue;
				}
				case 'dateRange': {
					if (!Array.isArray(filterValue)) return true;
					const [start, end] = filterValue as string[];
					const value = String(cellValue ?? '').slice(0, 10);
					if (!value) return false;
					return (!start || value >= start) && (!end || value <= end);
				}
				case 'select': {
					const values = Array.isArray(filterValue)
						? filterValue.map(String)
						: [String(filterValue)];
					return values.includes(String(cellValue ?? ''));
				}
				case 'multiSelect': {
					const values = Array.isArray(filterValue)
						? filterValue.map(String)
						: [String(filterValue)];
					const cellValues = Array.isArray(cellValue) ? cellValue.map(String) : [];
					return values.some((value) => cellValues.includes(value));
				}
				case 'boolean': {
					const values = Array.isArray(filterValue)
						? filterValue.map(String)
						: [String(filterValue)];
					return values.includes(String(Boolean(cellValue)));
				}
				default:
					return true;
			}
		};
	}

	const columns = $derived.by((): ColumnDef<Person>[] => [
		{
			id: 'name',
			accessorKey: 'name',
			header: createColumnHeader('Name'),
			enableColumnFilter: true,
			filterFn: createFilterFn('text'),
			meta: {
				label: 'Name',
				placeholder: 'Search names...',
				variant: 'text'
			}
		},
		{
			id: 'email',
			accessorKey: 'email',
			header: createColumnHeader('Email'),
			enableColumnFilter: true,
			filterFn: createFilterFn('text'),
			meta: {
				label: 'Email',
				placeholder: 'Search email...',
				variant: 'text'
			}
		},
		{
			id: 'department',
			accessorKey: 'department',
			header: createColumnHeader('Department'),
			enableColumnFilter: true,
			filterFn: createFilterFn('select'),
			meta: {
				label: 'Department',
				variant: 'select',
				options: departments.map((department) => ({
					label: department,
					value: department
				}))
			}
		},
		{
			id: 'status',
			accessorKey: 'status',
			header: createColumnHeader('Status'),
			enableColumnFilter: true,
			filterFn: createFilterFn('select'),
			meta: {
				label: 'Status',
				variant: 'select',
				options: statuses.map((status) => ({
					label: status,
					value: status
				}))
			}
		},
		{
			id: 'salary',
			accessorKey: 'salary',
			header: createColumnHeader('Salary'),
			enableColumnFilter: true,
			filterFn: createFilterFn('range'),
			cell: ({ row }) => currencyFormatter.format(row.original.salary ?? 0),
			meta: {
				label: 'Salary',
				variant: 'range',
				range: [40000, 150000],
				unit: '$'
			}
		},
		{
			id: 'skills',
			accessorKey: 'skills',
			header: createColumnHeader('Skills'),
			enableColumnFilter: true,
			filterFn: createFilterFn('multiSelect'),
			cell: ({ row }) => row.original.skills?.join(', ') ?? '—',
			meta: {
				label: 'Skills',
				variant: 'multiSelect',
				options: skills.map((skill) => ({
					label: skill,
					value: skill
				}))
			}
		},
		{
			id: 'isActive',
			accessorKey: 'isActive',
			header: createColumnHeader('Active'),
			enableColumnFilter: true,
			filterFn: createFilterFn('boolean'),
			cell: ({ row }) => (row.original.isActive ? 'Active' : 'Inactive'),
			meta: {
				label: 'Active',
				variant: 'boolean'
			}
		},
		{
			id: 'startDate',
			accessorKey: 'startDate',
			header: createColumnHeader('Start Date'),
			enableColumnFilter: true,
			filterFn: createFilterFn('date'),
			cell: ({ row }) => row.original.startDate ?? '—',
			meta: {
				label: 'Start Date',
				variant: 'date'
			}
		}
	]);

	const description = $derived.by(() =>
		mode === 'advanced'
			? advancedFilterUi === 'advancedFilters'
				? `Advanced list UI (tablecn advancedFilters): multi-rule filters with AND/OR, drag reorder, and URL-synced filters + joinOperator. Showing ${rows.length} demo rows (10 per page).`
				: `Command filter menu (tablecn commandFilters): compact popover filters with operators, synced to the URL. Showing ${rows.length} demo rows (10 per page).`
			: `Basic mode showcases per-column toolbar filters (tablecn default toolbar), client-side sort/filter, and faceted controls. Showing ${rows.length} demo rows (10 per page).`
	);

	// Keep the hook return object — destructuring breaks getter reactivity in Svelte 5.
	const dataTable = useDataTable({
		data: () => rows,
		columns: () => columns,
		getRowId: (row) => row.id,
		enableAdvancedFilter: () => mode === 'advanced',
		// Demo uses client-side filtering so URL + UI stay in sync with local rows
		manualFiltering: false,
		clearOnDefault: true,
		initialState: {
			pagination: {
				pageIndex: 0,
				pageSize: 10
			}
		}
	});
</script>

<div class="flex flex-col gap-3">
	<div class="rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">
		{description}
	</div>

	{#if mode === 'basic'}
		<DataTable table={dataTable.table}>
			{#snippet children()}
				<DataTableToolbar table={dataTable.table} />
			{/snippet}
		</DataTable>
	{:else}
		<DataTable table={dataTable.table}>
			{#snippet children()}
				<DataTableAdvancedToolbar table={dataTable.table}>
					{#snippet children()}
						<DataTableSortList table={dataTable.table} align="start" />
						{#if advancedFilterUi === 'advancedFilters'}
							<DataTableFilterList
								table={dataTable.table}
								setColumnFilters={dataTable.setColumnFilters}
								align="start"
							/>
						{:else}
							<DataTableFilterMenu
								table={dataTable.table}
								setColumnFilters={dataTable.setColumnFilters}
								align="start"
							/>
						{/if}
					{/snippet}
				</DataTableAdvancedToolbar>
			{/snippet}
		</DataTable>
	{/if}
</div>
