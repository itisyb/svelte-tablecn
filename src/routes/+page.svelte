<script lang="ts">
	import { faker } from '@faker-js/faker';
	import type { ColumnDef } from '@tanstack/table-core';
	import {
		DataGrid,
		DataGridFilterMenu,
		DataGridSortMenu,
		DataGridRowHeightMenu,
		DataGridViewMenu,
		DataGridKeyboardShortcuts,
		useDataGrid,
		useWindowSize,
		getFilterFn,
		type FileCellData
	} from '$lib';
	import { RowSelectHeader } from '$lib/components/data-grid/cells';
	import { renderComponent } from '$lib/table';
	import { Toaster } from '$lib/components/ui/sonner';
	import ModeToggle from '$lib/components/mode-toggle.svelte';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import { getPersons, type Person } from './data.remote';

	const result = await getPersons();
	let data = $state<Person[]>(result.persons);
	const departments = result.departments;
	const statuses = result.statuses;
	const skills = result.skills;

	// Dynamic height based on window size
	const windowSize = useWindowSize({ defaultHeight: 760 });
	const gridHeight = $derived(Math.max(400, windowSize.height - 150));

	const filterFn = getFilterFn<Person>();

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const columns: ColumnDef<Person, any>[] = [
		{
			id: 'select',
			size: 40,
			enableSorting: false,
			enableHiding: false,
			enableResizing: false,
			header: ({ table }) => renderComponent(RowSelectHeader, { table }),
			meta: {
				label: 'Select',
				cell: {
					variant: 'row-select'
				}
			}
		},
		{
			id: 'name',
			accessorKey: 'name',
			header: 'Name',
			minSize: 180,
			filterFn,
			meta: {
				label: 'Name',
				cell: {
					variant: 'short-text'
				}
			}
		},
		{
			id: 'age',
			accessorKey: 'age',
			header: 'Age',
			minSize: 100,
			filterFn,
			meta: {
				label: 'Age',
				cell: {
					variant: 'number',
					min: 18,
					max: 100,
					step: 1
				}
			}
		},
		{
			id: 'email',
			accessorKey: 'email',
			header: 'Email',
			minSize: 240,
			filterFn,
			meta: {
				label: 'Email',
				cell: {
					variant: 'short-text'
				}
			}
		},
		{
			id: 'website',
			accessorKey: 'website',
			header: 'Website',
			minSize: 240,
			filterFn,
			meta: {
				label: 'Website',
				cell: {
					variant: 'url'
				}
			}
		},
		{
			id: 'notes',
			accessorKey: 'notes',
			header: 'Notes',
			minSize: 200,
			filterFn,
			meta: {
				label: 'Notes',
				cell: {
					variant: 'long-text'
				}
			}
		},
		{
			id: 'salary',
			accessorKey: 'salary',
			header: 'Salary',
			minSize: 180,
			filterFn,
			meta: {
				label: 'Salary',
				cell: {
					variant: 'number',
					min: 0,
					step: 1000
				}
			}
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
					options: departments.map((dept) => ({
						label: dept,
						value: dept
					}))
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
					options: statuses.map((status) => ({
						label: status,
						value: status
					}))
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
					options: skills.map((skill) => ({
						label: skill,
						value: skill
					}))
				}
			}
		},
		{
			id: 'isActive',
			accessorKey: 'isActive',
			header: 'Active',
			minSize: 140,
			filterFn,
			meta: {
				label: 'Active',
				cell: {
					variant: 'checkbox'
				}
			}
		},
		{
			id: 'startDate',
			accessorKey: 'startDate',
			header: 'Start Date',
			minSize: 150,
			filterFn,
			meta: {
				label: 'Start Date',
				cell: {
					variant: 'date'
				}
			}
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
					maxFileSize: 10 * 1024 * 1024, // 10MB
					maxFiles: 5,
					accept: 'image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx',
					multiple: true
				}
			}
		}
	];

	function onRowAdd() {
		data = [
			...data,
			{
				id: faker.string.nanoid(8)
			}
		];

		return {
			rowIndex: data.length - 1,
			columnId: 'name'
		};
	}

	function onRowsAdd(count: number) {
		const newRows = Array.from({ length: count }, () => ({
			id: faker.string.nanoid(8)
		}));
		data = [...data, ...newRows];
	}

	function onRowsDelete(rows: Person[]) {
		data = data.filter((row) => !rows.includes(row));
	}

	async function onFilesUpload({ files }: { files: File[] }) {
		// Simulate upload delay
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
		console.log(`Deleting ${fileIds.length} file(s) from row ${rowIndex}, column ${columnId}:`, fileIds);
	}

	const { table, ...dataGridProps } = useDataGrid({
		columns,
		data: () => data, // Pass as getter for Svelte 5 reactivity
		onDataChange: (newData) => {
			data = newData;
		},
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
</script>

<div class="mx-auto flex w-full max-w-[1600px] flex-col gap-4 px-6 py-6">
	<!-- Header -->
	<div class="flex flex-col gap-2">
		<div class="flex items-center justify-between">
			<div>
				<h1 class="text-2xl font-bold tracking-tight">svelte-tablecn</h1>
				<p class="text-sm text-muted-foreground">
					A powerful data grid for Svelte 5. Port of <a href="https://tablecn.com" target="_blank" rel="noopener noreferrer" class="underline underline-offset-4 hover:text-foreground">tablecn.com</a>
				</p>
			</div>
			<div class="flex items-center gap-2">
				<a
					href="https://github.com/itisyb/svelte-tablecn"
					target="_blank"
					rel="noopener noreferrer"
					class="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
				>
					GitHub
				</a>
				<ModeToggle />
			</div>
		</div>
	</div>

	<!-- Toolbar -->
	<div role="toolbar" aria-orientation="horizontal" class="flex items-center justify-between">
		<DataGridKeyboardShortcuts enableSearch={!!dataGridProps.searchState} />
		<div class="flex items-center gap-2">
			<DataGridFilterMenu {table} />
			<DataGridSortMenu {table} />
			<DataGridRowHeightMenu {table} />
			<DataGridViewMenu {table} />
		</div>
	</div>

	<!-- Data Grid -->
	<svelte:boundary>
		{#snippet pending()}
			<div class="flex flex-col border rounded-md overflow-hidden" style="height: {gridHeight}px">
				<!-- Header skeleton -->
				<div class="flex border-b bg-muted/50 h-10">
					{#each Array(6) as _}
						<div class="flex-1 px-4 py-2 border-r last:border-r-0">
							<Skeleton class="h-4 w-20" />
						</div>
					{/each}
				</div>
				<!-- Row skeletons -->
				<div class="flex-1 overflow-hidden">
					{#each Array(15) as _}
						<div class="flex border-b h-10">
							{#each Array(6) as _, i}
								<div class="flex-1 px-4 py-2 border-r last:border-r-0">
									<Skeleton class="h-4 {i === 0 ? 'w-32' : i === 1 ? 'w-8' : 'w-24'}" />
								</div>
							{/each}
						</div>
					{/each}
				</div>
			</div>
		{/snippet}

		<DataGrid {...dataGridProps} {table} height={gridHeight} />
	</svelte:boundary>
</div>

<Toaster />
