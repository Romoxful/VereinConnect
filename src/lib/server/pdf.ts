/**
 * Minimal PDF 1.4 generator — no external dependencies.
 *
 * Produces A4 documents using the built-in Helvetica / Helvetica-Bold fonts
 * with WinAnsi encoding, so German umlauts (ä ö ü ß) encode directly as
 * single bytes matching the font's encoding vector.
 *
 * Callers describe a document as a list of blocks; the builder flows them
 * onto pages with word-wrapping and simple vertical spacing.
 */

export type PdfBlock = {
	text: string;
	size?: number;
	bold?: boolean;
	align?: 'left' | 'center';
	spaceAfter?: number;
};

const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;
const MARGIN = 72;
const CONTENT_WIDTH = PAGE_WIDTH - 2 * MARGIN;

function escapePdfString(text: string): string {
	return text.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

// Approximate Helvetica character widths as a fraction of font size.
// Good enough for word-wrapping short German text; exact metrics are not
// required because we only use this to decide line breaks.
function charWidth(c: string, size: number, bold: boolean): number {
	const narrow = 'iltIj.,;:!\'|f()[]';
	const wide = 'mwMW';
	let factor: number;
	if (narrow.includes(c)) factor = 0.28;
	else if (wide.includes(c)) factor = 0.83;
	else if (c === ' ') factor = 0.28;
	else factor = 0.55;
	if (bold) factor *= 1.05;
	return factor * size;
}

function textWidth(text: string, size: number, bold: boolean): number {
	let w = 0;
	for (const c of text) w += charWidth(c, size, bold);
	return w;
}

function wrap(text: string, size: number, bold: boolean, maxWidth: number): string[] {
	const paragraphs = text.split('\n');
	const out: string[] = [];
	for (const para of paragraphs) {
		if (para === '') {
			out.push('');
			continue;
		}
		const words = para.split(/\s+/).filter((w) => w.length > 0);
		let current = '';
		for (const w of words) {
			const candidate = current ? current + ' ' + w : w;
			if (textWidth(candidate, size, bold) <= maxWidth) {
				current = candidate;
			} else {
				if (current) out.push(current);
				current = w;
			}
		}
		if (current) out.push(current);
	}
	return out;
}

function toLatin1(text: string): Uint8Array {
	const bytes = new Uint8Array(text.length);
	for (let i = 0; i < text.length; i++) {
		const code = text.charCodeAt(i);
		// WinAnsi lacks glyphs above 0xFF; replace with '?'.
		bytes[i] = code > 255 ? 63 : code;
	}
	return bytes;
}

function layoutPages(blocks: PdfBlock[]): string[] {
	const pages: string[] = [];
	let current = '';
	let y = PAGE_HEIGHT - MARGIN;
	let pendingSpace = 0;

	for (const block of blocks) {
		const size = block.size ?? 12;
		const bold = block.bold ?? false;
		const align = block.align ?? 'left';
		const spaceAfter = block.spaceAfter ?? 6;
		const leading = size * 1.2;
		const lines = wrap(block.text, size, bold, CONTENT_WIDTH);

		for (const line of lines) {
			y -= leading + pendingSpace;
			pendingSpace = 0;
			if (y < MARGIN) {
				pages.push(current);
				current = '';
				y = PAGE_HEIGHT - MARGIN - leading;
			}
			let x = MARGIN;
			if (align === 'center') {
				const w = textWidth(line, size, bold);
				x = MARGIN + (CONTENT_WIDTH - w) / 2;
			}
			const fontKey = bold ? '/F2' : '/F1';
			current += `BT ${fontKey} ${size} Tf ${x.toFixed(2)} ${y.toFixed(2)} Td (${escapePdfString(line)}) Tj ET\n`;
		}
		pendingSpace += spaceAfter;
	}

	if (current) pages.push(current);
	if (pages.length === 0) pages.push('');
	return pages;
}

export function buildPdf(blocks: PdfBlock[]): Uint8Array {
	const pages = layoutPages(blocks);
	const n = pages.length;

	const catalogId = 1;
	const pagesId = 2;
	const fontRegId = 3;
	const fontBoldId = 4;
	const pageObjStart = 5;
	const contentObjStart = 5 + n;

	type Obj = { id: number; body: string };
	const objs: Obj[] = [];

	objs.push({ id: catalogId, body: `<< /Type /Catalog /Pages ${pagesId} 0 R >>` });

	const kids = Array.from({ length: n }, (_, i) => `${pageObjStart + i} 0 R`).join(' ');
	objs.push({ id: pagesId, body: `<< /Type /Pages /Kids [${kids}] /Count ${n} >>` });

	objs.push({
		id: fontRegId,
		body: `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>`
	});
	objs.push({
		id: fontBoldId,
		body: `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>`
	});

	for (let i = 0; i < n; i++) {
		objs.push({
			id: pageObjStart + i,
			body: `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 ${fontRegId} 0 R /F2 ${fontBoldId} 0 R >> >> /Contents ${contentObjStart + i} 0 R >>`
		});
	}

	for (let i = 0; i < n; i++) {
		const stream = pages[i];
		objs.push({
			id: contentObjStart + i,
			body: `<< /Length ${stream.length} >>\nstream\n${stream}endstream`
		});
	}

	objs.sort((a, b) => a.id - b.id);

	// Binary marker comment (>= 4 bytes with high bit set) hints to tools
	// that this file contains binary data. Required for well-formed PDFs.
	let out = '%PDF-1.4\n%\xE2\xE3\xCF\xD3\n';
	const offsets: number[] = [0];
	for (const obj of objs) {
		offsets[obj.id] = out.length;
		out += `${obj.id} 0 obj\n${obj.body}\nendobj\n`;
	}

	const xrefOffset = out.length;
	const totalObjs = objs.length + 1;
	out += `xref\n0 ${totalObjs}\n`;
	out += `0000000000 65535 f \n`;
	for (let i = 1; i < totalObjs; i++) {
		out += `${String(offsets[i] ?? 0).padStart(10, '0')} 00000 n \n`;
	}
	out += `trailer\n<< /Size ${totalObjs} /Root ${catalogId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

	return toLatin1(out);
}
