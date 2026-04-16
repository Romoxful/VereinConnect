import { describe, it, expect } from 'vitest';
import { buildIcsCalendar, type IcsEvent } from './ics.js';

const baseEvent: IcsEvent = {
	uid: 'event-1@test.local',
	title: 'Mitgliederversammlung',
	description: 'Jährliche Hauptversammlung',
	location: 'Feuerwache',
	date: '2026-05-15',
	time: '19:30',
	createdAt: '2026-04-01T12:00:00.000Z'
};

describe('buildIcsCalendar', () => {
	it('produces a valid calendar envelope', () => {
		const ics = buildIcsCalendar([baseEvent]);
		expect(ics).toContain('BEGIN:VCALENDAR');
		expect(ics).toContain('VERSION:2.0');
		expect(ics).toContain('END:VCALENDAR');
		expect(ics).toContain('BEGIN:VEVENT');
		expect(ics).toContain('END:VEVENT');
	});

	it('includes title and location', () => {
		const ics = buildIcsCalendar([baseEvent]);
		expect(ics).toContain('SUMMARY:Mitgliederversammlung');
		expect(ics).toContain('LOCATION:Feuerwache');
		expect(ics).toContain('UID:event-1@test.local');
	});

	it('formats timed events with DTSTART/DTEND', () => {
		const ics = buildIcsCalendar([baseEvent]);
		expect(ics).toContain('DTSTART:20260515T193000');
		expect(ics).toContain('DTEND:20260515T213000');
	});

	it('formats all-day events without a time', () => {
		const ics = buildIcsCalendar([{ ...baseEvent, time: null }]);
		expect(ics).toContain('DTSTART;VALUE=DATE:20260515');
		expect(ics).toContain('DTEND;VALUE=DATE:20260516');
	});

	it('escapes commas and semicolons in text', () => {
		const ics = buildIcsCalendar([
			{ ...baseEvent, title: 'Party, jetzt; echt!', description: null, location: null }
		]);
		expect(ics).toContain('SUMMARY:Party\\, jetzt\\; echt!');
	});

	it('uses CRLF line endings', () => {
		const ics = buildIcsCalendar([baseEvent]);
		expect(ics).toContain('\r\n');
		expect(ics.startsWith('BEGIN:VCALENDAR\r\n')).toBe(true);
	});

	it('handles empty event list', () => {
		const ics = buildIcsCalendar([]);
		expect(ics).toContain('BEGIN:VCALENDAR');
		expect(ics).toContain('END:VCALENDAR');
		expect(ics).not.toContain('BEGIN:VEVENT');
	});
});
