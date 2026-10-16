import { text, boolean, timestamp, foreignKey, primaryKey } from 'drizzle-orm/pg-core';
import { InstanceTable } from './instance.table';
import { PermissionTable } from './resource_server.table';
import { InstancesSchema } from '../schema';

export const RoleTable = InstancesSchema.table('roles', {
	org_id: text('org_id').notNull(),
	identifier: text('identifier').notNull(),
	name: text('name').notNull(),
	description: text('description'),
	internal: boolean('internal'),
	created_at: timestamp('created_at', { precision: 3 }).notNull().defaultNow(),
	created_by: text('created_by').notNull().default("system"),
	updated_at: timestamp('updated_at', { precision: 3 }),
	updated_by: text('updated_by')
}, (Role) => [
	foreignKey({
		name: 'roles_instance_fkey',
		columns: [Role.org_id],
		foreignColumns: [InstanceTable.org_id]
	})
		.onDelete('cascade')
		.onUpdate('cascade'),
	primaryKey({
		name: 'Role_cpk',
		columns: [Role.org_id, Role.identifier]
	})
]);

export const RolePermissionTable = InstancesSchema.table('roles_permissions', {
	org_id: text('org_id').notNull(),
	role_identifier: text('role_identifier').notNull(),
	resource_server_identifier: text('resource_server_identifier').notNull(),
	scope_value: text('scope_value').notNull(),
	created_at: timestamp('created_at', { precision: 3 }).notNull().defaultNow(),
	created_by: text('created_by').notNull().default("system"),
	updated_at: timestamp('updated_at', { precision: 3 }),
	updated_by: text('updated_by')
}, (RolePermission) => [
	foreignKey({
		name: 'roles_permissions_role_fkey',
		columns: [RolePermission.org_id, RolePermission.role_identifier],
		foreignColumns: [RoleTable.org_id, RoleTable.identifier]
	})
		.onDelete('cascade')
		.onUpdate('cascade'),
	foreignKey({
		name: 'roles_permissions_permission_fkey',
		columns: [RolePermission.org_id, RolePermission.resource_server_identifier, RolePermission.scope_value],
		foreignColumns: [PermissionTable.org_id, PermissionTable.resource_server_identifier, PermissionTable.scope_value]
	})
		.onDelete('cascade')
		.onUpdate('cascade'),
	primaryKey({
		name: 'RolePermission_cpk',
		columns: [RolePermission.org_id, RolePermission.role_identifier, RolePermission.resource_server_identifier, RolePermission.scope_value]
	})
]);
