import { describe, it, expect } from 'vitest';
import { buildPreview } from './memberImport.js';

describe('buildPreview', () => {
	it('maps German headers to canonical fields', () => {
		const csv = 'Vorname,Nachname,E-Mail\r\nMax,Müller,max@test.de\r\n';
		const result = buildPreview(csv);
		expect(result.mapping.firstName).toBe('Vorname');
		expect(result.mapping.lastName).toBe('Nachname');
		expect(result.mapping.email).toBe('E-Mail');
		expect(result.missingRequired).toEqual([]);
		expect(result.rows).toHaveLength(1);
		expect(result.rows[0].data?.firstName).toBe('Max');
		expect(result.rows[0].data?.email).toBe('max@test.de');
		expect(result.rows[0].errors).toEqual([]);
	});

	it('maps English header aliases', () => {
		const csv = 'First Name,Last Name,Email\r\nErika,Schmidt,e@test.de\r\n';
		const result = buildPreview(csv);
		expect(result.mapping.firstName).toBe('First Name');
		expect(result.mapping.lastName).toBe('Last Name');
		expect(result.mapping.email).toBe('Email');
	});

	it('reports missing required fields', () => {
		const csv = 'E-Mail,Stadt\r\ntest@test.de,Berlin\r\n';
		const result = buildPreview(csv);
		expect(result.missingRequired).toContain('firstName');
		expect(result.missingRequired).toContain('lastName');
	});

	it('reports unmapped headers', () => {
		const csv = 'Vorname,Nachname,Custom\r\nMax,Müller,xyz\r\n';
		const result = buildPreview(csv);
		expect(result.unmappedHeaders).toContain('Custom');
	});

	it('parses German date format DD.MM.YYYY', () => {
		const csv = 'Vorname,Nachname,Geburtsdatum\r\nMax,Müller,15.03.1980\r\n';
		const result = buildPreview(csv);
		expect(result.rows[0].data?.birthDate).toBe('1980-03-15');
		expect(result.rows[0].errors).toEqual([]);
	});

	it('accepts ISO date format', () => {
		const csv = 'Vorname,Nachname,Mitglied seit\r\nMax,Müller,2024-01-15\r\n';
		const result = buildPreview(csv);
		expect(result.rows[0].data?.memberSince).toBe('2024-01-15');
	});

	it('flags invalid dates as errors', () => {
		const csv = 'Vorname,Nachname,Geburtsdatum\r\nMax,Müller,not-a-date\r\n';
		const result = buildPreview(csv);
		expect(result.rows[0].errors.length).toBeGreaterThan(0);
		expect(result.rows[0].errors[0]).toContain('Geburtsdatum');
	});

	it('defaults memberSince to today when missing', () => {
		const csv = 'Vorname,Nachname\r\nMax,Müller\r\n';
		const today = new Date().toISOString().slice(0, 10);
		const result = buildPreview(csv);
		expect(result.rows[0].data?.memberSince).toBe(today);
	});

	it('defaults status to aktiv when missing', () => {
		const csv = 'Vorname,Nachname\r\nMax,Müller\r\n';
		const result = buildPreview(csv);
		expect(result.rows[0].data?.status).toBe('aktiv');
	});

	it('accepts valid status values', () => {
		const csv = 'Vorname,Nachname,Status\r\nMax,Müller,inaktiv\r\n';
		const result = buildPreview(csv);
		expect(result.rows[0].data?.status).toBe('inaktiv');
		expect(result.rows[0].errors).toEqual([]);
	});

	it('flags unknown status as error', () => {
		const csv = 'Vorname,Nachname,Status\r\nMax,Müller,superuser\r\n';
		const result = buildPreview(csv);
		expect(result.rows[0].errors[0]).toContain('superuser');
	});

	it('errors when required field missing on a row', () => {
		const csv = 'Vorname,Nachname\r\n,Müller\r\n';
		const result = buildPreview(csv);
		expect(result.rows[0].errors).toContain('Vorname fehlt');
		expect(result.rows[0].data).toBeNull();
	});

	it('skips blank rows', () => {
		const csv = 'Vorname,Nachname\r\nMax,Müller\r\n,\r\nErika,Schmidt\r\n';
		const result = buildPreview(csv);
		expect(result.rows).toHaveLength(2);
	});

	it('treats empty optional fields as null', () => {
		const csv = 'Vorname,Nachname,E-Mail\r\nMax,Müller,\r\n';
		const result = buildPreview(csv);
		expect(result.rows[0].data?.email).toBeNull();
	});
});
