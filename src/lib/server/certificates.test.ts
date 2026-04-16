import { describe, it, expect } from 'vitest';
import {
	buildMembershipCertificate,
	buildResignationCertificate,
	type CertificateMember
} from './certificates.js';

function toStringLatin1(bytes: Uint8Array): string {
	let s = '';
	for (const b of bytes) s += String.fromCharCode(b);
	return s;
}

const alice: CertificateMember = {
	firstName: 'Anna',
	lastName: 'Müller',
	memberSince: '2021-03-15',
	status: 'aktiv'
};

describe('buildMembershipCertificate', () => {
	it('produces a valid PDF', () => {
		const pdf = buildMembershipCertificate(alice);
		const s = toStringLatin1(pdf);
		expect(s.startsWith('%PDF-1.4')).toBe(true);
		expect(s).toContain('%%EOF');
	});

	it('contains the member name and entry date', () => {
		const pdf = buildMembershipCertificate(alice);
		const s = toStringLatin1(pdf);
		expect(s).toContain('Anna M');
		expect(s).toContain('15.03.2021');
	});

	it('includes the Mitgliedsbescheinigung title', () => {
		const pdf = buildMembershipCertificate(alice);
		const s = toStringLatin1(pdf);
		expect(s).toContain('Mitgliedsbescheinigung');
	});

	it('includes the member status', () => {
		const pdf = buildMembershipCertificate(alice);
		const s = toStringLatin1(pdf);
		expect(s).toContain('aktiv');
	});
});

describe('buildResignationCertificate', () => {
	it('produces a valid PDF', () => {
		const pdf = buildResignationCertificate(alice);
		const s = toStringLatin1(pdf);
		expect(s.startsWith('%PDF-1.4')).toBe(true);
		expect(s).toContain('%%EOF');
	});

	it('contains the Austrittsbestätigung title', () => {
		const pdf = buildResignationCertificate(alice);
		const s = toStringLatin1(pdf);
		expect(s).toContain('Austrittsbest');
	});

	it('mentions both entry and resignation dates', () => {
		const pdf = buildResignationCertificate(alice);
		const s = toStringLatin1(pdf);
		expect(s).toContain('Eintrittsdatum');
		expect(s).toContain('Austrittsdatum');
		expect(s).toContain('15.03.2021');
	});
});
