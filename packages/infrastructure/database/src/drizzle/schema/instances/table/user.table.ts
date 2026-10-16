import { InstancesSchema } from '../schema';
import {
	boolean, foreignKey, jsonb, primaryKey,
	text, timestamp, uniqueIndex
} from 'drizzle-orm/pg-core';
import { InstanceTable } from './instance.table';
import { PermissionTable, ResourceServerTable } from './resource_server.table';
import { RoleTable } from './role.table';
import { DatabaseTable } from './database.table';
import { CredentialType } from '../../public/schema';

export const UserTable = InstancesSchema.table('users', {
	org_id: text('org_id').notNull(),
	user_id: text('user_id').notNull(),
	connection: text('connection').notNull(),
	email: text('email').notNull(),
	username: text('username'),
	name: text('name'),
	metadata: jsonb('metadata').notNull().default("{}"),
	created_at: timestamp('created_at', { precision: 3 }).notNull().defaultNow(),
	created_by: text('created_by').notNull().default("system"),
	updated_at: timestamp('updated_at', { precision: 3 }),
	updated_by: text('updated_by')
}, (User) => [
	foreignKey({
		name: 'fk_users_instance',
		columns: [User.org_id],
		foreignColumns: [InstanceTable.org_id]
	})
		.onDelete('cascade')
		.onUpdate('cascade'),
	foreignKey({
		name: 'fk_users_database',
		columns: [User.org_id, User.connection],
		foreignColumns: [DatabaseTable.org_id, DatabaseTable.identifier]
	})
		.onDelete('cascade')
		.onUpdate('cascade'),
	uniqueIndex('uq_user_email_connection')
		.on(User.org_id, User.email, User.connection),
	primaryKey({
		name: 'pk_user',
		columns: [User.org_id, User.user_id]
	})
]);

export const UserCredentialsTable = InstancesSchema.table('users_credentials', {
	org_id: text('org_id').notNull(),
	user_id: text('user_id').notNull(),
	connection: text('connection').notNull(),
	email: text('email').notNull(),
	username: text('username'),
	type: CredentialType('type').notNull(),
	value: text('value').notNull(),
	revoked: boolean('revoked'),
	revoked_at: timestamp('revoked_at', { precision: 3 })
}, (UserCredentials) => ({
	'UserCredentials_cpk': primaryKey({
		name: 'UserCredentials_cpk',
		columns: [UserCredentials.org_id, UserCredentials.user_id, UserCredentials.connection, UserCredentials.value]
	})
}));

export const UserPermissionTable = InstancesSchema.table('users_permissions', {
	org_id: text('org_id').notNull(),
	user_id: text('user_id').notNull(),
	resource_server_identifier: text('resource_server_identifier').notNull(),
	scope_value: text('scope_value').notNull(),
	created_at: timestamp('created_at', { precision: 3 }).notNull().defaultNow(),
	created_by: text('created_by').notNull().default("system"),
	updated_at: timestamp('updated_at', { precision: 3 }),
	updated_by: text('updated_by')
}, (UserPermission) => [
	foreignKey({
		name: 'fk_users_permissions_user',
		columns: [UserPermission.org_id, UserPermission.user_id],
		foreignColumns: [UserTable.org_id, UserTable.user_id]
	})
		.onDelete('cascade')
		.onUpdate('cascade'),
	foreignKey({
		name: 'fk_users_permissions_resource_server',
		columns: [UserPermission.org_id, UserPermission.resource_server_identifier],
		foreignColumns: [ResourceServerTable.org_id, ResourceServerTable.identifier]
	})
		.onDelete('cascade')
		.onUpdate('cascade'),
	foreignKey({
		name: 'fk_users_permissions_permission',
		columns: [UserPermission.org_id, UserPermission.resource_server_identifier, UserPermission.scope_value],
		foreignColumns: [PermissionTable.org_id, PermissionTable.resource_server_identifier, PermissionTable.scope_value]
	})
		.onDelete('cascade')
		.onUpdate('cascade'),
	primaryKey({
		name: 'pk_users_permissions',
		columns: [UserPermission.org_id, UserPermission.resource_server_identifier, UserPermission.scope_value, UserPermission.user_id]
	})
]);

export const UserRoleTable = InstancesSchema.table('users_roles', {
	org_id: text('org_id').notNull(),
	user_id: text('user_id').notNull(),
	role_identifier: text('role_identifier').notNull(),
	created_at: timestamp('created_at', { precision: 3 }).notNull().defaultNow(),
	created_by: text('created_by').notNull().default("system"),
	updated_at: timestamp('updated_at', { precision: 3 }),
	updated_by: text('updated_by')
}, (UserRole) => [
	foreignKey({
		name: 'fk_users_roles_users',
		columns: [UserRole.org_id, UserRole.user_id],
		foreignColumns: [UserTable.org_id, UserTable.user_id]
	})
		.onDelete('cascade')
		.onUpdate('cascade'),
	foreignKey({
		name: 'fk_users_roles_role',
		columns: [UserRole.org_id, UserRole.role_identifier],
		foreignColumns: [RoleTable.org_id, RoleTable.identifier]
	})
		.onDelete('cascade')
		.onUpdate('cascade'),
	primaryKey({
		name: 'pk_user_role',
		columns: [UserRole.org_id, UserRole.role_identifier, UserRole.user_id]
	})
]);
