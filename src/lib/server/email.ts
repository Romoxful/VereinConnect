import { db } from './db/index.js';
import { sentEmails } from './db/schema.js';

export function sendEmail(toEmail: string, subject: string, body: string) {
	db.insert(sentEmails).values({ toEmail, subject, body }).run();
}

export function sendPasswordResetEmail(toEmail: string, resetUrl: string) {
	const subject = 'Passwort zurücksetzen – Förderverein FF';
	const body =
		`Hallo,\n\n` +
		`Sie haben das Zurücksetzen Ihres Passworts angefordert.\n` +
		`Klicken Sie auf den folgenden Link, um ein neues Passwort zu vergeben:\n\n` +
		`${resetUrl}\n\n` +
		`Der Link ist eine Stunde gültig. Falls Sie keine Anfrage gestellt haben, können Sie diese E-Mail ignorieren.\n\n` +
		`Viele Grüße\nFörderverein FF`;
	sendEmail(toEmail, subject, body);
}
