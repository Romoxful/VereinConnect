import { describe, it, expect } from 'vitest';
import { parseCsv, stringifyCsv } from './csv.js';

describe('parseCsv', () => {
	it('parses simple rows', () => {
		const input = 'a,b,c\r\n1,2,3\r\n';
		expect(parseCsv(input)).toEqual([
			['a', 'b', 'c'],
			['1', '2', '3']
		]);
	});

	it('parses quoted fields containing commas', () => {
		const input = 'name,city\r\n"Müller, Hans","Berlin, DE"\r\n';
		expect(parseCsv(input)).toEqual([
			['name', 'city'],
			['Müller, Hans', 'Berlin, DE']
		]);
	});

	it('parses escaped double quotes', () => {
		const input = 'quote\r\n"He said ""hi"""\r\n';
		expect(parseCsv(input)).toEqual([['quote'], ['He said "hi"']]);
	});

	it('handles LF-only line endings', () => {
		const input = 'a,b\n1,2\n';
		expect(parseCsv(input)).toEqual([
			['a', 'b'],
			['1', '2']
		]);
	});

	it('strips BOM', () => {
		const input = '\uFEFFa,b\n1,2';
		expect(parseCsv(input)).toEqual([
			['a', 'b'],
			['1', '2']
		]);
	});

	it('preserves empty trailing fields', () => {
		expect(parseCsv('a,b,c\n1,,3')).toEqual([
			['a', 'b', 'c'],
			['1', '', '3']
		]);
	});
});

describe('stringifyCsv', () => {
	it('joins simple rows', () => {
		expect(stringifyCsv([['a', 'b'], ['1', '2']])).toBe('a,b\r\n1,2\r\n');
	});

	it('quotes fields with commas', () => {
		expect(stringifyCsv([['hello, world']])).toBe('"hello, world"\r\n');
	});

	it('escapes embedded quotes', () => {
		expect(stringifyCsv([['say "hi"']])).toBe('"say ""hi"""\r\n');
	});

	it('handles null and undefined as empty', () => {
		expect(stringifyCsv([['a', null, undefined, 'd']])).toBe('a,,,d\r\n');
	});

	it('round-trips through parse', () => {
		const rows = [
			['Vorname', 'Nachname', 'Notes'],
			['Max', 'Müller', 'Likes, commas'],
			['Erika', 'Schmidt', 'Says "hello"']
		];
		const csv = stringifyCsv(rows);
		expect(parseCsv(csv)).toEqual(rows);
	});
});
