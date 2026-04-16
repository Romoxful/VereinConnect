/**
 * Minimal RFC 5545 ICS generator for events.
 */

export type IcsEvent = {
	uid: string;
	title: string;
	description?: string | null;
	location?: string | null;
	date: string; // YYYY-MM-DD
	time?: string | null; // HH:MM (24h) — optional
	createdAt: string; // ISO timestamp
};

function escapeText(value: string): string {
	return value
		.replace(/\\/g, '\\\\')
		.replace(/\r\n/g, '\\n')
		.replace(/\n/g, '\\n')
		.replace(/\r/g, '\\n')
		.replace(/,/g, '\\,')
		.replace(/;/g, '\\;');
}

function formatDate(date: string): string {
	// YYYY-MM-DD -> YYYYMMDD
	return date.replace(/-/g, '');
}

function formatDateTime(date: string, time: string): string {
	// YYYY-MM-DD + HH:MM -> YYYYMMDDTHHMMSS
	const d = formatDate(date);
	const t = time.replace(/:/g, '') + '00';
	return `${d}T${t}`;
}

function formatTimestampUTC(iso: string): string {
	const d = new Date(iso);
	const pad = (n: number) => String(n).padStart(2, '0');
	return (
		d.getUTCFullYear().toString() +
		pad(d.getUTCMonth() + 1) +
		pad(d.getUTCDate()) +
		'T' +
		pad(d.getUTCHours()) +
		pad(d.getUTCMinutes()) +
		pad(d.getUTCSeconds()) +
		'Z'
	);
}

function addDays(date: string, days: number): string {
	const [y, m, d] = date.split('-').map(Number);
	const dt = new Date(Date.UTC(y, m - 1, d));
	dt.setUTCDate(dt.getUTCDate() + days);
	return dt.toISOString().slice(0, 10);
}

function foldLine(line: string): string {
	// RFC 5545 line folding: lines > 75 octets must be wrapped with CRLF + space
	if (line.length <= 75) return line;
	const out: string[] = [];
	let i = 0;
	while (i < line.length) {
		const chunk = line.slice(i, i + 75);
		out.push(i === 0 ? chunk : ' ' + chunk);
		i += 75;
	}
	return out.join('\r\n');
}

export function buildIcsCalendar(events: IcsEvent[], calendarName = 'Veranstaltungen'): string {
	const lines: string[] = [];
	lines.push('BEGIN:VCALENDAR');
	lines.push('VERSION:2.0');
	lines.push('PRODID:-//VereinConnect//Foerderverein FF//DE');
	lines.push('CALSCALE:GREGORIAN');
	lines.push('METHOD:PUBLISH');
	lines.push(`X-WR-CALNAME:${escapeText(calendarName)}`);

	for (const ev of events) {
		lines.push('BEGIN:VEVENT');
		lines.push(`UID:${ev.uid}`);
		lines.push(`DTSTAMP:${formatTimestampUTC(ev.createdAt)}`);

		if (ev.time) {
			// Assume local time; consumers will interpret in their own timezone.
			lines.push(`DTSTART:${formatDateTime(ev.date, ev.time)}`);
			// 2-hour default duration when only start time is known
			const [h, m] = ev.time.split(':').map(Number);
			const endH = (h + 2) % 24;
			const endTime = `${String(endH).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
			const endDate = h + 2 >= 24 ? addDays(ev.date, 1) : ev.date;
			lines.push(`DTEND:${formatDateTime(endDate, endTime)}`);
		} else {
			// All-day event
			lines.push(`DTSTART;VALUE=DATE:${formatDate(ev.date)}`);
			lines.push(`DTEND;VALUE=DATE:${formatDate(addDays(ev.date, 1))}`);
		}

		lines.push(`SUMMARY:${escapeText(ev.title)}`);
		if (ev.description) lines.push(`DESCRIPTION:${escapeText(ev.description)}`);
		if (ev.location) lines.push(`LOCATION:${escapeText(ev.location)}`);
		lines.push('END:VEVENT');
	}

	lines.push('END:VCALENDAR');
	return lines.map(foldLine).join('\r\n') + '\r\n';
}
