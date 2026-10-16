import { text, integer, boolean, timestamp, foreignKey, primaryKey, uniqueIndex } from 'drizzle-orm/pg-core';
import { LoginSessionTable } from './login-session.table';
import { AuthenticationSchema } from '../schema';

export const AccessTokenTable = AuthenticationSchema.table('access_tokens', {
	org_id: text('org_id').notNull(),
	jti: text('jti').notNull(),
	sid: text('sid').notNull(),
	client_id: text('client_id').notNull(),
	subject: text('subject').notNull(),
	audience: text('audience').notNull(),
	access_token: text('access_token').notNull(),
	expires: integer('expires').notNull(),
	issued_at: integer('issued_at').notNull(),
	ip: text('ip'),
	user_agent: text('user_agent'),
	revoked: boolean('revoked'),
	revoked_at: timestamp('revoked_at', { precision: 3 })
}, (AccessToken) => [
	foreignKey({
		name: 'fk_access_tokens_login_session',
		columns: [AccessToken.org_id, AccessToken.sid],
		foreignColumns: [LoginSessionTable.org_id, LoginSessionTable.sid]
	})
		.onDelete('cascade')
		.onUpdate('cascade'),
	uniqueIndex('ix_access_token_sid_jti')
		.on(AccessToken.org_id, AccessToken.sid, AccessToken.jti),
	primaryKey({
		name: 'pk_access_token',
		columns: [AccessToken.org_id, AccessToken.jti]
	})
]);
