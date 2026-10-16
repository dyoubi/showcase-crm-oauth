import { pgTable, text, integer, boolean, timestamp, foreignKey, primaryKey } from 'drizzle-orm/pg-core';
import { AuthenticationSchema } from '../schema';

export const LoginSessionTable = AuthenticationSchema.table('login_sessions', {
	org_id: text('org_id').notNull(),
	sid: text('sid').notNull(),
	client_id: text('client_id').notNull(),
	subject: text('subject').notNull(),
	audience: text('audience').notNull(),
	scope: text('scope').notNull(),
	auth_time: integer('auth_time').notNull(),
	last_active_time: integer('last_active_time').notNull(),
	max_age: integer('max_age').notNull(),
	expires: integer('expires'),
	app_sid: text('app_sid'),
	revoked: boolean('revoked'),
	revoked_at: timestamp('revoked_at', { precision: 3 })
}, (table) => [
	primaryKey({
		name: 'pk_login_session',
		columns: [table.org_id, table.sid]
	})
]);