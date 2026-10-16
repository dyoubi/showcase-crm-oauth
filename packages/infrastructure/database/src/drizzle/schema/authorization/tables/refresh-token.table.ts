import { pgTable, text, integer, boolean, timestamp, primaryKey, foreignKey } from 'drizzle-orm/pg-core';
import { LoginSessionTable } from './login-session.table';
import { AccessTokenTable } from './access-token.table';
import { AuthenticationSchema } from '../schema';

export const RefreshTokenTable = AuthenticationSchema.table('refresh_tokens', {
	org_id: text('org_id').notNull(),
	client_id: text('client_id').notNull(),
	subject: text('subject').notNull(),
	sid: text('sid').notNull(),
	jti: text('jti').notNull(),
	jti_access: text('jti_access').notNull(),
	refresh_token: text('refresh_token').notNull(),
	expires: integer('expires').notNull(),
	issued_at: integer('issued_at').notNull(),
	revoked: boolean('revoked'),
	revoked_at: timestamp('revoked_at', { precision: 3 })
}, (RefreshToken) => [
	foreignKey({
		name: 'fk_refresh_tokens_login_session',
		columns: [RefreshToken.org_id, RefreshToken.sid],
		foreignColumns: [LoginSessionTable.org_id, LoginSessionTable.sid]
	})
		.onDelete('cascade')
		.onUpdate('cascade'),
	foreignKey({
		name: 'fk_refresh_tokens_access_token',
		columns: [RefreshToken.org_id, RefreshToken.jti_access],
		foreignColumns: [AccessTokenTable.org_id, AccessTokenTable.jti]
	})
		.onDelete('cascade')
		.onUpdate('cascade'),
	primaryKey({
		name: 'pk_refresh_token',
		columns: [RefreshToken.org_id, RefreshToken.jti]
	})
]);

