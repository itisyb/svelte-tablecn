import type { Table } from '@tanstack/table-core';

export function exportTableToCSV<TData>(
	table: Table<TData>,
	opts: {
		filename?: string;
		excludeColumns?: (keyof TData | 'select' | 'actions')[];
		onlySelected?: boolean;
	} = {}
): void {
	const { filename = 'table', excludeColumns = [], onlySelected = false } = opts;

	const headers = table
		.getAllLeafColumns()
		.map((column) => column.id)
		.filter((id) => !excludeColumns.includes(id as keyof TData | 'select' | 'actions'));

	const rows = onlySelected
		? table.getFilteredSelectedRowModel().rows
		: table.getRowModel().rows;

	const csvContent = [
		headers.join(','),
		...rows.map((row) =>
			headers
				.map((header) => {
					const cellValue = row.getValue(header);
					return typeof cellValue === 'string'
						? `"${cellValue.replace(/"/g, '""')}"`
						: cellValue;
				})
				.join(',')
		)
	].join('\n');

	const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.setAttribute('href', url);
	link.setAttribute('download', `${filename}.csv`);
	link.style.visibility = 'hidden';
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
}
