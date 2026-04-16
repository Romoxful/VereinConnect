import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	email: text('email').notNull().unique(),
	passwordHash: text('password_hash').notNull(),
	name: text('name').notNull(),
	role: text('role', { enum: ['vorstand', 'mitglied'] })
		.notNull()
		.default('mitglied'),
	createdAt: text('created_at')
		.notNull()
		.$defaultFn(() => new Date().toISOString())
});

export const sessions = sqliteTable('sessions', {
	id: text('id').primaryKey(),
	userId: integer('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	expiresAt: text('expires_at').notNull()
});

export const members = sqliteTable('members', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	firstName: text('first_name').notNull(),
	lastName: text('last_name').notNull(),
	email: text('email'),
	phone: text('phone'),
	street: text('street'),
	zip: text('zip'),
	city: text('city'),
	birthDate: text('birth_date'),
	profession: text('profession'),
	memberSince: text('member_since').notNull(),
	status: text('status', {
		enum: ['aktiv', 'inaktiv', 'ausgetreten', 'beantragt', 'abgelehnt']
	})
		.notNull()
		.default('aktiv'),
	notes: text('notes'),
	createdAt: text('created_at')
		.notNull()
		.$defaultFn(() => new Date().toISOString())
});

export const events = sqliteTable('events', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	title: text('title').notNull(),
	description: text('description'),
	location: text('location'),
	date: text('date').notNull(),
	time: text('time'),
	createdBy: integer('created_by').references(() => users.id),
	createdAt: text('created_at')
		.notNull()
		.$defaultFn(() => new Date().toISOString())
});

export const rsvps = sqliteTable('rsvps', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	eventId: integer('event_id')
		.notNull()
		.references(() => events.id, { onDelete: 'cascade' }),
	userId: integer('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	status: text('status', { enum: ['zugesagt', 'abgesagt', 'vielleicht'] })
		.notNull()
		.default('zugesagt'),
	createdAt: text('created_at')
		.notNull()
		.$defaultFn(() => new Date().toISOString())
});

export const documents = sqliteTable('documents', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	title: text('title').notNull(),
	filename: text('filename').notNull(),
	originalName: text('original_name').notNull(),
	category: text('category', { enum: ['satzung', 'bescheide', 'finanzen', 'sonstiges'] })
		.notNull()
		.default('sonstiges'),
	uploadedBy: integer('uploaded_by').references(() => users.id),
	createdAt: text('created_at')
		.notNull()
		.$defaultFn(() => new Date().toISOString())
});

export const documentVersions = sqliteTable('document_versions', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	documentId: integer('document_id')
		.notNull()
		.references(() => documents.id, { onDelete: 'cascade' }),
	filename: text('filename').notNull(),
	originalName: text('original_name').notNull(),
	size: integer('size').notNull().default(0),
	mimeType: text('mime_type').notNull().default(''),
	versionNumber: integer('version_number').notNull(),
	createdAt: text('created_at')
		.notNull()
		.$defaultFn(() => new Date().toISOString())
});

export const protocols = sqliteTable('protocols', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	date: text('date').notNull(),
	title: text('title').notNull(),
	attendees: text('attendees').notNull(),
	content: text('content').notNull(),
	createdBy: integer('created_by').references(() => users.id),
	createdAt: text('created_at')
		.notNull()
		.$defaultFn(() => new Date().toISOString()),
	updatedAt: text('updated_at')
		.notNull()
		.$defaultFn(() => new Date().toISOString())
});

export const dues = sqliteTable('dues', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	memberId: integer('member_id')
		.notNull()
		.references(() => members.id, { onDelete: 'cascade' }),
	amount: text('amount').notNull(),
	dueDate: text('due_date').notNull(),
	paidDate: text('paid_date'),
	status: text('status', { enum: ['offen', 'bezahlt', 'überfällig'] })
		.notNull()
		.default('offen'),
	year: integer('year').notNull(),
	notes: text('notes'),
	createdAt: text('created_at')
		.notNull()
		.$defaultFn(() => new Date().toISOString())
});

export const consents = sqliteTable('consents', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	memberId: integer('member_id')
		.notNull()
		.references(() => members.id, { onDelete: 'cascade' }),
	consentType: text('consent_type', { enum: ['datenverarbeitung', 'newsletter', 'foto_freigabe'] })
		.notNull(),
	givenAt: text('given_at')
		.notNull()
		.$defaultFn(() => new Date().toISOString()),
	withdrawnAt: text('withdrawn_at')
});
