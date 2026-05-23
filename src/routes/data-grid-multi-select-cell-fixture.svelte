<script lang="ts">
	import type { Cell, Table } from '@tanstack/table-core';
	import MultiSelectCell from '$lib/components/data-grid/cells/multi-select-cell.svelte';

	type Row = { skills: string[] };

	let value = $state(['react']);

	const options = [
		{ label: 'React', value: 'react' },
		{ label: 'Svelte', value: 'svelte' },
		{ label: 'Vue', value: 'vue' }
	];

	const cell = {
		id: '0_skills',
		row: { id: '0' },
		column: {
			id: 'skills',
			columnDef: {
				meta: {
					cell: {
						variant: 'multi-select',
						options
					}
				}
			}
		}
	} as unknown as Cell<Row, unknown>;

	const table = {
		options: {
			meta: {
				rowHeight: 'short',
				onDataUpdate: (update: { value: unknown }) => {
					value = update.value as string[];

					if (value.includes('vue')) {
						queueMicrotask(() => {
							value = ['svelte'];
						});
					}
				},
				onCellEditingStart: () => {},
				onCellEditingStop: () => {}
			}
		}
	} as unknown as Table<Row>;
</script>

<MultiSelectCell
	{cell}
	{table}
	rowIndex={0}
	columnId="skills"
	isEditing={true}
	isFocused={true}
	isSelected={false}
	cellValue={value}
/>
