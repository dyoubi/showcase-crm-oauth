import { pgTable, text, boolean, uniqueIndex, primaryKey, integer, timestamp } from 'drizzle-orm/pg-core';
import { AuthenticationSchema } from '../schema';

export const TicketChallengeTable = AuthenticationSchema.table('ticket_challenges', {
	org_id: text('org_id').notNull(),
	tid: text('tid').notNull(),
	jti: text('jti').notNull(),
	cid: text('cid').notNull(),
	kid: text('kid').notNull(),
	usage: text('usage').notNull(),
	redirect_uri: text('redirect_uri').notNull(),
	user_id: text('user_id'),
	connection: text('connection').notNull(),
	app_sid: text('app_sid'),
	secret: text('secret').notNull(),
	expires: integer('expires').notNull(),
	issued_at: integer('issued_at').notNull(),
	revoked: boolean('revoked'),
	revoked_at: timestamp('revoked_at', { precision: 3 })
}, (TicketChallenge) => [
	uniqueIndex('uq_ticket_challenge_tid_jti')
		.on(TicketChallenge.org_id, TicketChallenge.tid, TicketChallenge.jti),
	primaryKey({
		name: 'pk_ticket_challenge',
		columns: [TicketChallenge.org_id, TicketChallenge.tid]
	})
]);

