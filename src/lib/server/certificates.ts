import { buildPdf, type PdfBlock } from './pdf.js';

export const VEREIN_NAME = 'Förderverein Freiwillige Feuerwehr';

export type CertificateMember = {
	firstName: string;
	lastName: string;
	memberSince: string;
	status: string;
};

function formatGermanDate(iso: string): string {
	if (!iso) return '';
	const [y, m, d] = iso.split('-');
	if (!y || !m || !d) return iso;
	return `${d}.${m}.${y}`;
}

function today(): string {
	const d = new Date();
	const pad = (n: number) => String(n).padStart(2, '0');
	return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`;
}

export function buildMembershipCertificate(member: CertificateMember): Uint8Array {
	const fullName = `${member.firstName} ${member.lastName}`;
	const blocks: PdfBlock[] = [
		{ text: VEREIN_NAME, size: 14, bold: true, align: 'center', spaceAfter: 48 },
		{ text: 'Mitgliedsbescheinigung', size: 22, bold: true, align: 'center', spaceAfter: 40 },
		{
			text: `Hiermit wird bestätigt, dass ${fullName} seit dem ${formatGermanDate(member.memberSince)} Mitglied im ${VEREIN_NAME} ist.`,
			size: 12,
			spaceAfter: 20
		},
		{ text: `Status der Mitgliedschaft: ${statusLabel(member.status)}`, size: 12, spaceAfter: 40 },
		{
			text: 'Diese Bescheinigung dient zur Vorlage bei Behörden, Arbeitgebern oder zur eigenen Dokumentation.',
			size: 11,
			spaceAfter: 80
		},
		{ text: `Ausgestellt am ${today()}`, size: 11, spaceAfter: 60 },
		{ text: '______________________________', size: 11, spaceAfter: 4 },
		{ text: 'Unterschrift Vorstand', size: 10 }
	];
	return buildPdf(blocks);
}

export function buildResignationCertificate(member: CertificateMember): Uint8Array {
	const fullName = `${member.firstName} ${member.lastName}`;
	const blocks: PdfBlock[] = [
		{ text: VEREIN_NAME, size: 14, bold: true, align: 'center', spaceAfter: 48 },
		{ text: 'Austrittsbestätigung', size: 22, bold: true, align: 'center', spaceAfter: 40 },
		{
			text: `Hiermit bestätigen wir den Austritt von ${fullName} aus dem ${VEREIN_NAME}.`,
			size: 12,
			spaceAfter: 16
		},
		{ text: `Eintrittsdatum: ${formatGermanDate(member.memberSince)}`, size: 12, spaceAfter: 4 },
		{ text: `Austrittsdatum: ${today()}`, size: 12, spaceAfter: 40 },
		{
			text: 'Mit diesem Schreiben ist die Mitgliedschaft im Verein beendet. Für die gemeinsame Zeit bedanken wir uns herzlich.',
			size: 11,
			spaceAfter: 80
		},
		{ text: `Ausgestellt am ${today()}`, size: 11, spaceAfter: 60 },
		{ text: '______________________________', size: 11, spaceAfter: 4 },
		{ text: 'Unterschrift Vorstand', size: 10 }
	];
	return buildPdf(blocks);
}

function statusLabel(status: string): string {
	const map: Record<string, string> = {
		aktiv: 'aktiv',
		inaktiv: 'inaktiv',
		ausgetreten: 'ausgetreten',
		beantragt: 'Aufnahme beantragt',
		abgelehnt: 'abgelehnt'
	};
	return map[status] ?? status;
}
