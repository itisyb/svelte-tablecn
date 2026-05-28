export function formatDate(
	date: Date | string | number | undefined,
	opts: Intl.DateTimeFormatOptions = {}
): string {
	if (!date) return '';

	try {
		return new Intl.DateTimeFormat('en-US', {
			month: opts.month ?? 'long',
			day: opts.day ?? 'numeric',
			year: opts.year ?? 'numeric',
			...opts
		}).format(new Date(date));
	} catch {
		return '';
	}
}
