const prefixes: Record<string, unknown> = {};

interface GenerateIdOptions {
	length?: number;
	separator?: string;
}

function createId(length: number) {
	const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
	if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
		const values = new Uint8Array(length);
		crypto.getRandomValues(values);
		return Array.from(values, (value) => alphabet[value % alphabet.length]).join('');
	}

	return Array.from({ length }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join(
		''
	);
}

export function generateId(
	prefixOrOptions?: keyof typeof prefixes | GenerateIdOptions,
	inputOptions: GenerateIdOptions = {}
): string {
	const finalOptions = typeof prefixOrOptions === 'object' ? prefixOrOptions : inputOptions;
	const prefix = typeof prefixOrOptions === 'object' ? undefined : prefixOrOptions;
	const { length = 12, separator = '_' } = finalOptions;
	const id = createId(length);

	return prefix && prefix in prefixes ? `${prefixes[prefix]}${separator}${id}` : id;
}
