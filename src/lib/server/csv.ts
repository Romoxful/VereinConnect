/**
 * Minimal CSV utilities per RFC 4180.
 * Handles quoted fields, embedded quotes ("" -> "), commas, and CRLF.
 */

function escapeField(value: unknown): string {
	if (value === null || value === undefined) return '';
	const str = String(value);
	if (/[",\r\n]/.test(str)) {
		return '"' + str.replace(/"/g, '""') + '"';
	}
	return str;
}

export function stringifyCsv(rows: (string | number | null | undefined)[][]): string {
	return rows.map((row) => row.map(escapeField).join(',')).join('\r\n') + '\r\n';
}

export function parseCsv(input: string): string[][] {
	const rows: string[][] = [];
	let field = '';
	let row: string[] = [];
	let inQuotes = false;
	let i = 0;

	// Strip UTF-8 BOM if present
	if (input.charCodeAt(0) === 0xfeff) {
		i = 1;
	}

	while (i < input.length) {
		const ch = input[i];

		if (inQuotes) {
			if (ch === '"') {
				if (input[i + 1] === '"') {
					field += '"';
					i += 2;
					continue;
				}
				inQuotes = false;
				i++;
				continue;
			}
			field += ch;
			i++;
			continue;
		}

		if (ch === '"') {
			inQuotes = true;
			i++;
			continue;
		}

		if (ch === ',') {
			row.push(field);
			field = '';
			i++;
			continue;
		}

		if (ch === '\r') {
			if (input[i + 1] === '\n') i++;
			row.push(field);
			rows.push(row);
			field = '';
			row = [];
			i++;
			continue;
		}

		if (ch === '\n') {
			row.push(field);
			rows.push(row);
			field = '';
			row = [];
			i++;
			continue;
		}

		field += ch;
		i++;
	}

	// Flush trailing field/row
	if (field.length > 0 || row.length > 0) {
		row.push(field);
		rows.push(row);
	}

	// Drop a completely empty trailing row (common after final newline)
	if (rows.length > 0) {
		const last = rows[rows.length - 1];
		if (last.length === 1 && last[0] === '') rows.pop();
	}

	return rows;
}
