import { describe, it, expect } from 'vitest';
import { buildPdf, type PdfBlock } from './pdf.js';

function toStringLatin1(bytes: Uint8Array): string {
	let s = '';
	for (const b of bytes) s += String.fromCharCode(b);
	return s;
}

describe('buildPdf', () => {
	it('produces a well-formed PDF envelope', () => {
		const pdf = buildPdf([{ text: 'Hallo Welt' }]);
		const s = toStringLatin1(pdf);
		expect(s.startsWith('%PDF-1.4\n')).toBe(true);
		expect(s).toContain('%%EOF');
		expect(s).toContain('xref');
		expect(s).toContain('trailer');
		expect(s).toContain('/Root 1 0 R');
	});

	it('declares Helvetica with WinAnsi encoding', () => {
		const pdf = buildPdf([{ text: 'Test' }]);
		const s = toStringLatin1(pdf);
		expect(s).toContain('/BaseFont /Helvetica');
		expect(s).toContain('/BaseFont /Helvetica-Bold');
		expect(s).toContain('/Encoding /WinAnsiEncoding');
	});

	it('embeds the rendered text into the content stream', () => {
		const pdf = buildPdf([{ text: 'Mitgliedsbescheinigung' }]);
		const s = toStringLatin1(pdf);
		expect(s).toContain('(Mitgliedsbescheinigung) Tj');
	});

	it('encodes German umlauts as single WinAnsi bytes', () => {
		const pdf = buildPdf([{ text: 'Grüße Fußweg' }]);
		// ü = 0xFC, ß = 0xDF, ö = 0xF6
		expect(Array.from(pdf)).toContain(0xfc);
		expect(Array.from(pdf)).toContain(0xdf);
	});

	it('escapes parentheses and backslashes in text', () => {
		const pdf = buildPdf([{ text: 'Foo (bar) \\baz' }]);
		const s = toStringLatin1(pdf);
		expect(s).toContain('(Foo \\(bar\\) \\\\baz)');
	});

	it('renders a bold block using Helvetica-Bold', () => {
		const pdf = buildPdf([{ text: 'Titel', bold: true }]);
		const s = toStringLatin1(pdf);
		expect(s).toContain('/F2');
	});

	it('wraps long text onto multiple lines', () => {
		const long = 'Wort '.repeat(200).trim();
		const pdf = buildPdf([{ text: long }]);
		const s = toStringLatin1(pdf);
		const tjCount = (s.match(/ Tj/g) ?? []).length;
		expect(tjCount).toBeGreaterThan(1);
	});

	it('paginates when content overflows the page', () => {
		const blocks: PdfBlock[] = [];
		for (let i = 0; i < 120; i++) blocks.push({ text: `Zeile ${i}` });
		const pdf = buildPdf(blocks);
		const s = toStringLatin1(pdf);
		const count = Number(s.match(/\/Count (\d+)/)?.[1] ?? '0');
		expect(count).toBeGreaterThan(1);
	});

	it('centers text when align is center', () => {
		const pdf = buildPdf([{ text: 'Mitte', align: 'center' }]);
		const s = toStringLatin1(pdf);
		// center x of an A4 page (content width 451pt) for "Mitte" at 12pt
		// should be noticeably greater than the left margin of 72pt
		const match = s.match(/BT \/F1 12 Tf (\d+\.\d+) /);
		expect(match).toBeTruthy();
		if (match) expect(Number(match[1])).toBeGreaterThan(72);
	});

	it('generates a valid xref table matching object count', () => {
		const pdf = buildPdf([{ text: 'X' }]);
		const s = toStringLatin1(pdf);
		const sizeMatch = s.match(/\/Size (\d+)/);
		expect(sizeMatch).toBeTruthy();
		// 1 catalog + 1 pages + 2 fonts + 1 page + 1 content + 1 free entry = 7
		expect(Number(sizeMatch![1])).toBe(7);
	});
});
