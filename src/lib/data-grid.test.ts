import { describe, expect, it } from 'vitest';
import { parseTsv } from './data-grid.js';

describe('parseTsv', () => {
	it('parses simple multi-row TSV', () => {
		expect(parseTsv('Alice\tKickflip\t95\nBob\tOllie\t88', 3)).toEqual([
			['Alice', 'Kickflip', '95'],
			['Bob', 'Ollie', '88']
		]);
	});

	it('handles quoted multiline content', () => {
		const text = 'Alice\tKickflip\t95\nBob\t"Trick with\nmultiple\nlines"\t98';

		expect(parseTsv(text, 3)).toEqual([
			['Alice', 'Kickflip', '95'],
			['Bob', 'Trick with\nmultiple\nlines', '98']
		]);
	});

	it('handles escaped quotes', () => {
		expect(parseTsv('"She said ""hello"""\t42', 2)).toEqual([['She said "hello"', '42']]);
	});

	it('handles unquoted multiline content by tab count', () => {
		const text = 'Alice\tShort note\t95\nBob\tLine 1\nLine 2\nLine 3\t88\nCharlie\tSimple\t77';

		expect(parseTsv(text, 3)).toEqual([
			['Alice', 'Short note', '95'],
			['Bob', 'Line 1\nLine 2\nLine 3', '88'],
			['Charlie', 'Simple', '77']
		]);
	});

	it('falls back to single-column rows when no tabs are detected', () => {
		expect(parseTsv('line1\nline2\nline3', 1)).toEqual([['line1'], ['line2'], ['line3']]);
	});
});
