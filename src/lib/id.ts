export function generateId({ length = 8 }: { length?: number } = {}): string {
	const alphabet = '0123456789abcdefghijklmnopqrstuvwxyz';

	if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
		const values = new Uint8Array(length);
		crypto.getRandomValues(values);
		return Array.from(values, (value) => alphabet[value % alphabet.length]).join('');
	}

	return Array.from({ length }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join(
		''
	);
}
