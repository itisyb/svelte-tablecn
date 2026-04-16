export function formatDate(
	value: Date | string | number | undefined,
	options: Intl.DateTimeFormatOptions = {
		month: 'short',
		day: 'numeric',
		year: 'numeric'
	}
): string {
	if (value === undefined || value === null || value === '') {
		return '';
	}

	const date = value instanceof Date ? value : new Date(value);
	if (Number.isNaN(date.getTime())) {
		return '';
	}

	return new Intl.DateTimeFormat(undefined, options).format(date);
}
