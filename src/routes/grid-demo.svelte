<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import type { ColumnDef } from '@tanstack/table-core';
	import {
		DataGrid,
		DataGridFilterMenu,
		DataGridSortMenu,
		DataGridRowHeightMenu,
		DataGridViewMenu,
		DataGridKeyboardShortcuts,
		DataGridSkeleton,
		DataGridSkeletonGrid,
		DataGridSkeletonToolbar,
		getDataGridSelectColumn,
		useDataGrid,
		useDataGridUndoRedo,
		getFilterFn,
	} from '$lib';
	import {
		departments,
		generateDemoPeople,
		scheduleDemoPeopleLoad,
		skills,
		statuses,
		type DemoPerson
	} from '$lib/demo/person-data.js';

	interface Props {
		height: number;
	}

	let { height }: Props = $props();

	const DEMO_ROW_COUNT = 10_000;

	let data = $state<DemoPerson[]>([]);
	let isLoading = $state(true);

	onMount(() => {
		// Paint the shell immediately, then fill rows off the main thread.
		data = generateDemoPeople(250);
		isLoading = false;

		return scheduleDemoPeopleLoad(DEMO_ROW_COUNT, (people) => {
			data = people;
		});
	});

	const { trackRowsAdd, trackRowsDelete } = useDataGridUndoRedo({
		data: () => data,
		onDataChange: (newData) => {
			data = newData;
		},
		getRowId: (row) => row.id
	});

	const filterFn = getFilterFn<DemoPerson>();

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const columns: ColumnDef<DemoPerson, any>[] = [
		getDataGridSelectColumn<DemoPerson>({ enableRowMarkers: true }),
		{
			id: 'name',
			accessorKey: 'name',
			header: 'Name',
			minSize: 180,
			filterFn,
			meta: { label: 'Name', cell: { variant: 'short-text' } }
		},
		{
			id: 'age',
			accessorKey: 'age',
			header: 'Age',
			minSize: 100,
			filterFn,
			meta: { label: 'Age', cell: { variant: 'number', min: 18, max: 100, step: 1 } }
		},
		{
			id: 'email',
			accessorKey: 'email',
			header: 'Email',
			minSize: 240,
			filterFn,
			meta: { label: 'Email', cell: { variant: 'short-text' } }
		},
		{
			id: 'website',
			accessorKey: 'website',
			header: 'Website',
			minSize: 240,
			filterFn,
			meta: { label: 'Website', cell: { variant: 'url' } }
		},
		{
			id: 'notes',
			accessorKey: 'notes',
			header: 'Notes',
			minSize: 200,
			filterFn,
			meta: { label: 'Notes', cell: { variant: 'long-text' } }
		},
		{
			id: 'salary',
			accessorKey: 'salary',
			header: 'Salary',
			minSize: 180,
			filterFn,
			meta: { label: 'Salary', cell: { variant: 'number', min: 0, step: 1000 } }
		},
		{
			id: 'department',
			accessorKey: 'department',
			header: 'Department',
			minSize: 180,
			filterFn,
			meta: {
				label: 'Department',
				cell: {
					variant: 'select',
					options: departments.map((dept) => ({ label: dept, value: dept }))
				}
			}
		},
		{
			id: 'status',
			accessorKey: 'status',
			header: 'Status',
			minSize: 180,
			filterFn,
			meta: {
				label: 'Status',
				cell: {
					variant: 'select',
					options: statuses.map((status) => ({ label: status, value: status }))
				}
			}
		},
		{
			id: 'skills',
			accessorKey: 'skills',
			header: 'Skills',
			minSize: 240,
			filterFn,
			meta: {
				label: 'Skills',
				cell: {
					variant: 'multi-select',
					options: skills.map((skill) => ({ label: skill, value: skill }))
				}
			}
		},
		{
			id: 'isActive',
			accessorKey: 'isActive',
			header: 'Active',
			minSize: 140,
			filterFn,
			meta: { label: 'Active', cell: { variant: 'checkbox' } }
		},
		{
			id: 'startDate',
			accessorKey: 'startDate',
			header: 'Start Date',
			minSize: 150,
			filterFn,
			meta: { label: 'Start Date', cell: { variant: 'date' } }
		},
		{
			id: 'attachments',
			accessorKey: 'attachments',
			header: 'Attachments',
			minSize: 240,
			filterFn,
			meta: {
				label: 'Attachments',
				cell: {
					variant: 'file',
					maxFileSize: 10 * 1024 * 1024,
					maxFiles: 5,
					accept: 'image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx',
					multiple: true
				}
			}
		}
	];

	function onRowAdd() {
		const newRow = { id: crypto.randomUUID() };
		data = [...data, newRow];
		trackRowsAdd([newRow]);
		return { rowIndex: data.length - 1, columnId: 'name' };
	}

	function onRowsAdd(count: number) {
		const newRows = Array.from({ length: count }, () => ({ id: crypto.randomUUID() }));
		data = [...data, ...newRows];
		trackRowsAdd(newRows);
	}

	function onRowsDelete(rows: DemoPerson[]) {
		trackRowsDelete(rows);
		data = data.filter((row) => !rows.includes(row));
	}

	function onDataChange(newData: DemoPerson[]) {
		data = newData;
	}

	async function onFilesUpload({ files }: { files: File[] }) {
		await new Promise((resolve) => setTimeout(resolve, 800));
		return files.map((file) => ({
			id: crypto.randomUUID(),
			name: file.name,
			size: file.size,
			type: file.type,
			url: URL.createObjectURL(file)
		}));
	}

	async function onFilesDelete({
		fileIds,
		rowIndex,
		columnId
	}: {
		fileIds: string[];
		rowIndex: number;
		columnId: string;
	}) {
		console.log(
			`Deleting ${fileIds.length} file(s) from row ${rowIndex}, column ${columnId}:`,
			fileIds
		);
	}

	const { table, ...dataGridProps } = useDataGrid({
		columns,
		data: () => data,
		onDataChange,
		onRowAdd,
		onRowsAdd,
		onRowsDelete,
		onFilesUpload,
		onFilesDelete,
		getRowId: (row) => row.id,
		initialState: {
			columnPinning: {
				left: ['select']
			}
		},
		enableSearch: true,
		enablePaste: true
	});

	onDestroy(() => {
		dataGridProps.setDataGridRef(null);
		dataGridProps.setHeaderRef(null);
		dataGridProps.setFooterRef(null);
	});
</script>

<div class="flex flex-col gap-4">
	<div role="toolbar" aria-orientation="horizontal" class="flex items-center justify-between">
		<DataGridKeyboardShortcuts
			enableSearch={!!dataGridProps.searchState}
			enableUndoRedo
			enablePaste
		/>
		<div class="flex items-center gap-2">
			<DataGridFilterMenu {table} />
			<DataGridSortMenu {table} />
			<DataGridRowHeightMenu {table} />
			<DataGridViewMenu {table} />
		</div>
	</div>

	{#if isLoading && data.length === 0}
		<DataGridSkeleton>
			<DataGridSkeletonToolbar actionCount={4} />
			<DataGridSkeletonGrid />
		</DataGridSkeleton>
	{:else}
		<DataGrid {...dataGridProps} {table} {height} />
	{/if}
</div>
