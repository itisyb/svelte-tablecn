import type { ColumnDef, RowData } from '@tanstack/table-core';
import RowSelectCell from './cells/row-select-cell.svelte';
import RowSelectHeader from './cells/row-select-header.svelte';
import { renderComponent } from '$lib/components/ui/data-table/render-helpers.js';
import type { DataGridSelectHitboxSize } from '$lib/types/data-grid.js';

export interface GetDataGridSelectColumnOptions<TData extends RowData> extends Omit<
	Partial<ColumnDef<TData, unknown>>,
	'id' | 'header' | 'cell' | 'meta'
> {
	enableRowMarkers?: boolean;
	readOnly?: boolean;
	hitboxSize?: DataGridSelectHitboxSize;
	debug?: boolean;
	meta?: ColumnDef<TData, unknown>['meta'];
}

export function getDataGridSelectColumn<TData extends RowData>(
	options: GetDataGridSelectColumnOptions<TData> = {}
): ColumnDef<TData, unknown> {
	const {
		size = 40,
		enableHiding = false,
		enableResizing = false,
		enableSorting = false,
		enableRowMarkers = false,
		readOnly = false,
		hitboxSize = 'default',
		debug = false,
		meta,
		...props
	} = options;

	return {
		id: 'select',
		header: ({ table }) =>
			renderComponent(RowSelectHeader, {
				table,
				hitboxSize,
				readOnly,
				debug
			}),
		cell: ({ row, table }) =>
			renderComponent(RowSelectCell, {
				row,
				table,
				rowIndex: row.index,
				enableRowMarkers,
				readOnly,
				hitboxSize,
				debug
			}),
		size,
		enableHiding,
		enableResizing,
		enableSorting,
		meta: {
			...meta,
			label: meta?.label ?? 'Select',
			cell: {
				variant: 'row-select',
				enableRowMarkers,
				readOnly,
				hitboxSize,
				debug
			}
		},
		...props
	};
}
