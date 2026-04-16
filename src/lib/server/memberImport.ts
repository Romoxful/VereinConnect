import { parseCsv } from './csv.js';

export type MemberImportRow = {
	firstName: string;
	lastName: string;
	email: string | null;
	phone: string | null;
	street: string | null;
	zip: string | null;
	city: string | null;
	birthDate: string | null;
	profession: string | null;
	memberSince: string;
	status: 'aktiv' | 'inaktiv' | 'ausgetreten' | 'beantragt' | 'abgelehnt';
	notes: string | null;
};

export type RowDiagnostic = {
	rowNumber: number; // 1-based, excluding header
	data: MemberImportRow | null;
	errors: string[];
	duplicateEmail?: boolean; // set by the import server action during preview
};

export type PreviewResult = {
	mapping: Record<string, string>; // canonical field -> actual header used
	unmappedHeaders: string[];
	missingRequired: string[];
	rows: RowDiagnostic[];
};

const FIELD_ALIASES: Record<keyof MemberImportRow, string[]> = {
	firstName: ['vorname', 'first name', 'firstname'],
	lastName: ['nachname', 'last name', 'lastname', 'name'],
	email: ['e-mail', 'email', 'e mail', 'mail'],
	phone: ['telefon', 'phone', 'tel'],
	street: ['straße', 'strasse', 'street', 'anschrift'],
	zip: ['plz', 'postleitzahl', 'zip'],
	city: ['ort', 'stadt', 'city'],
	birthDate: ['geburtsdatum', 'geburtstag', 'birth date', 'birthday'],
	profession: ['beruf', 'profession', 'job'],
	memberSince: ['mitglied seit', 'mitgliedschaft seit', 'eintrittsdatum', 'member since'],
	status: ['status'],
	notes: ['notizen', 'notes', 'bemerkung']
};

const REQUIRED_FIELDS: (keyof MemberImportRow)[] = ['firstName', 'lastName'];

const VALID_STATUSES = ['aktiv', 'inaktiv', 'ausgetreten', 'beantragt', 'abgelehnt'] as const;

function normalizeHeader(h: string): string {
	return h.trim().toLowerCase().replace(/\s+/g, ' ');
}

function buildHeaderMap(headers: string[]): {
	mapping: Record<string, number>;
	headerUsed: Record<string, string>;
	unmapped: string[];
} {
	const mapping: Record<string, number> = {};
	const headerUsed: Record<string, string> = {};
	const normalized = headers.map(normalizeHeader);
	const matchedIndices = new Set<number>();

	for (const [field, aliases] of Object.entries(FIELD_ALIASES)) {
		for (const alias of aliases) {
			const idx = normalized.indexOf(alias);
			if (idx !== -1 && !matchedIndices.has(idx)) {
				mapping[field] = idx;
				headerUsed[field] = headers[idx];
				matchedIndices.add(idx);
				break;
			}
		}
	}

	const unmapped = headers.filter((_, i) => !matchedIndices.has(i) && headers[i].trim() !== '');
	return { mapping, headerUsed, unmapped };
}

function parseDate(value: string): string | null {
	const trimmed = value.trim();
	if (!trimmed) return null;

	// Already ISO (YYYY-MM-DD)
	if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;

	// German: DD.MM.YYYY
	const dm = trimmed.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
	if (dm) {
		const [, d, m, y] = dm;
		return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
	}

	// DD/MM/YYYY
	const dms = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
	if (dms) {
		const [, d, m, y] = dms;
		return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
	}

	return null;
}

function emptyToNull(value: string | undefined): string | null {
	if (value === undefined) return null;
	const trimmed = value.trim();
	return trimmed === '' ? null : trimmed;
}

export function buildPreview(csvText: string): PreviewResult {
	const rows = parseCsv(csvText);
	if (rows.length === 0) {
		return { mapping: {}, unmappedHeaders: [], missingRequired: REQUIRED_FIELDS, rows: [] };
	}

	const headers = rows[0];
	const { mapping, headerUsed, unmapped } = buildHeaderMap(headers);
	const missingRequired = REQUIRED_FIELDS.filter((f) => !(f in mapping));

	const dataRows: RowDiagnostic[] = [];
	for (let i = 1; i < rows.length; i++) {
		const raw = rows[i];
		// Skip rows that are entirely empty
		if (raw.every((v) => v.trim() === '')) continue;

		const errors: string[] = [];
		const getField = (field: keyof MemberImportRow): string | null => {
			const idx = mapping[field];
			if (idx === undefined) return null;
			return emptyToNull(raw[idx]);
		};

		const firstName = getField('firstName');
		const lastName = getField('lastName');

		if (!firstName) errors.push('Vorname fehlt');
		if (!lastName) errors.push('Nachname fehlt');

		const birthDateRaw = getField('birthDate');
		let birthDate: string | null = null;
		if (birthDateRaw) {
			birthDate = parseDate(birthDateRaw);
			if (!birthDate) errors.push(`Geburtsdatum "${birthDateRaw}" ungültig`);
		}

		const memberSinceRaw = getField('memberSince');
		let memberSince: string | null = null;
		if (memberSinceRaw) {
			memberSince = parseDate(memberSinceRaw);
			if (!memberSince) errors.push(`"Mitglied seit" "${memberSinceRaw}" ungültig`);
		}

		const statusRaw = getField('status');
		let status: MemberImportRow['status'] = 'aktiv';
		if (statusRaw) {
			const lower = statusRaw.toLowerCase();
			if ((VALID_STATUSES as readonly string[]).includes(lower)) {
				status = lower as MemberImportRow['status'];
			} else {
				errors.push(`Status "${statusRaw}" unbekannt (verwende 'aktiv')`);
			}
		}

		const data: MemberImportRow | null =
			firstName && lastName
				? {
						firstName,
						lastName,
						email: getField('email'),
						phone: getField('phone'),
						street: getField('street'),
						zip: getField('zip'),
						city: getField('city'),
						birthDate,
						profession: getField('profession'),
						memberSince: memberSince ?? new Date().toISOString().slice(0, 10),
						status,
						notes: getField('notes')
					}
				: null;

		dataRows.push({ rowNumber: i, data, errors });
	}

	return {
		mapping: headerUsed,
		unmappedHeaders: unmapped,
		missingRequired,
		rows: dataRows
	};
}
