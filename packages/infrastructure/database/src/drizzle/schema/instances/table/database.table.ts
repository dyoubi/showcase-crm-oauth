import { pgTable, text, boolean, timestamp, primaryKey, foreignKey } from 'drizzle-orm/pg-core';
import { InstanceTable } from './instance.table';
import { ClientTable } from './client.table';
import { InstancesSchema } from '../schema';
import { UserAction } from '../../public/schema';

export const DatabaseTable = InstancesSchema.table('databases', {
	org_id: text('org_id').notNull(),
	identifier: text('identifier').notNull(),
	name: text('name').notNull(),
	salt: text('salt').notNull(),
	internal: boolean('internal'),
	labels: text('labels').array().notNull().default([]),
	created_at: timestamp('created_at', { precision: 3 }).notNull().defaultNow(),
	created_by: text('created_by').notNull().default("system"),
	updated_at: timestamp('updated_at', { precision: 3 }),
	updated_by: text('updated_by')
}, (Database) => [
	foreignKey({
		name: 'fk_databases_instance',
		columns: [Database.org_id],
		foreignColumns: [InstanceTable.org_id]
	})
		.onDelete('cascade')
		.onUpdate('cascade'),
	primaryKey({
		name: 'pk_database',
		columns: [Database.org_id, Database.identifier]
	})
]);

export const ConnectionTable = InstancesSchema.table('connections', {
	org_id: text('org_id').notNull(),
	client_id: text('client_id').notNull(),
	database_identifier: text('database_identifier').notNull(),
	enable: boolean('enable').notNull().default(true),
	allow_actions: UserAction('allow_actions').array().notNull().default([]),
	template_email_validation: text('template_email_validation'),
	template_password_reset: text('template_password_reset'),
	created_at: timestamp('created_at', { precision: 3 }).notNull().defaultNow(),
	created_by: text('created_by').notNull().default("system"),
	updated_at: timestamp('updated_at', { precision: 3 }),
	updated_by: text('updated_by')
}, (Connection) => [
	foreignKey({
		name: 'fk_connections_client',
		columns: [Connection.org_id, Connection.client_id],
		foreignColumns: [ClientTable.org_id, ClientTable.client_id]
	})
		.onDelete('cascade')
		.onUpdate('cascade'),
	foreignKey({
		name: 'fk_connections_database',
		columns: [Connection.org_id, Connection.database_identifier],
		foreignColumns: [DatabaseTable.org_id, DatabaseTable.identifier]
	})
		.onDelete('cascade')
		.onUpdate('cascade'),
	primaryKey({
		name: 'pk_connection',
		columns: [Connection.org_id, Connection.client_id, Connection.database_identifier]
	})
]);

