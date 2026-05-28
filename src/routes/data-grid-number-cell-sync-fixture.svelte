<script lang="ts">
	import type { Cell, Table } from '@tanstack/table-core';
	import NumberCell from '$lib/components/data-grid/cells/number-cell.svelte';

	type Row = { score: number };

	let value = $state(10);

	const cell = {
		id: '0_score',
		row: { id: '0' },
		column: {
			id: 'score',
			columnDef: {
				meta: {
					cell: {
						variant: 'number'
					}
				}
			}
		}
	} as unknown as Cell<Row, unknown>;

	const table = {
		options: {
			meta: {
				onDataUpdate: (update: { value: unknown }) => {
					value = update.value as number;
				},
				onCellEditingStart: () => {},
				onCellEditingStop: () => {}
			}
		}
	} as unknown as Table<Row>;
</script>

<button type="button" onclick={() => (value = 42)}>External score</button>

<NumberCell
	{cell}
	{table}
	rowIndex={0}
	columnId="score"
	isEditing={true}
	isFocused={true}
	isSelected={false}
	cellValue={value}
/>
