import {
	pgTable, text, integer, boolean, jsonb,
	timestamp, foreignKey, primaryKey,
	uniqueIndex
} from 'drizzle-orm/pg-core';
import { InstanceTable } from './instance.table';
import { JwtSignAlg } from '../../public/schema';
import { InstancesSchema } from '../schema';

export const ResourceServerTable = InstancesSchema.table('resource_servers', {
	org_id: text('org_id').notNull(),
	identifier: text('identifier').notNull(),
	name: text('name').notNull(),
	access_token_life_time: integer('access_token_life_time').notNull().default(86400),
	jwt_signing_algorithm: JwtSignAlg('jwt_signing_algorithm').notNull(),
	enable_rbac: boolean('enable_rbac'),
	enable_access_token_scope: boolean('enable_access_token_scope'),
	enable_rar: boolean('enable_rar'),
	authorization_schemas: jsonb('authorization_schemas').array().notNull().default([]),
	internal: boolean('internal'),
	labels: text('labels').array().notNull().default([]),
	created_at: timestamp('created_at', { precision: 3 }).notNull().defaultNow(),
	created_by: text('created_by').notNull().default("system"),
	updated_at: timestamp('updated_at', { precision: 3 }),
	updated_by: text('updated_by')
}, (ResourceServer) => [
	foreignKey({
		name: 'fk_resource_servers_instance',
		columns: [ResourceServer.org_id],
		foreignColumns: [InstanceTable.org_id]
	})
		.onDelete('cascade')
		.onUpdate('cascade'),
	primaryKey({
		name: 'pk_resource_server',
		columns: [ResourceServer.org_id, ResourceServer.identifier]
	})
]);

export const PermissionTable = InstancesSchema.table('permissions', {
	org_id: text('org_id').notNull(),
	resource_server_identifier: text('resource_server_identifier').notNull(),
	scope_value: text('scope_value').notNull(),
	created_at: timestamp('created_at', { precision: 3 }).notNull().defaultNow(),
	created_by: text('created_by').notNull().default("system"),
	updated_at: timestamp('updated_at', { precision: 3 }),
	updated_by: text('updated_by')
}, (Permission) => [
	foreignKey({
		name: 'fk_permissions_resource_server',
		columns: [Permission.org_id, Permission.resource_server_identifier],
		foreignColumns: [ResourceServerTable.org_id, ResourceServerTable.identifier]
	})
		.onDelete('cascade')
		.onUpdate('cascade'),
	uniqueIndex('uq_permission_rs_scope_value')
		.on(Permission.org_id, Permission.resource_server_identifier, Permission.scope_value),
	primaryKey({
		name: 'pk_permission',
		columns: [Permission.org_id, Permission.resource_server_identifier, Permission.scope_value]
	})
]);