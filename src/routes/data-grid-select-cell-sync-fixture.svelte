<script lang="ts">
	import type { Cell, Table } from '@tanstack/table-core';
	import SelectCell from '$lib/components/data-grid/cells/select-cell.svelte';

	type Row = { department: string };

	let value = $state('engineering');

	const options = [
		{ label: 'Engineering', value: 'engineering' },
		{ label: 'Marketing', value: 'marketing' },
		{ label: 'Sales', value: 'sales' }
	];

	const cell = {
		id: '0_department',
		row: { id: '0' },
		column: {
			id: 'department',
			columnDef: {
				meta: {
					cell: {
						variant: 'select',
						options
					}
				}
			}
		}
	} as unknown as Cell<Row, unknown>;

	const table = {
		options: {
			meta: {
				onDataUpdate: (update: { value: unknown }) => {
					value = update.value as string;

					if (value === 'marketing') {
						queueMicrotask(() => {
							value = 'sales';
						});
					}
				},
				onCellEditingStart: () => {},
				onCellEditingStop: () => {}
			}
		}
	} as unknown as Table<Row>;
</script>

<SelectCell
	{cell}
	{table}
	rowIndex={0}
	columnId="department"
	isEditing={true}
	isFocused={true}
	isSelected={false}
	cellValue={value}
/>
