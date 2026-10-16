import { text, boolean, integer, jsonb, timestamp, foreignKey, primaryKey } from 'drizzle-orm/pg-core';
import { PermissionTable } from './resource_server.table';
import { InstanceTable } from './instance.table';
import { InstancesSchema } from '../schema';
import { AccessGrantType, ClientType, JwtSignAlg, JWTUse, Kty, PKCEMethod } from '../../public/schema';

export const ClientTable = InstancesSchema.table('clients', {
	org_id: text('org_id').notNull(),
	client_id: text('client_id').notNull(),
	name: text('name').notNull(),
	logo_uri: text('logo_uri'),
	type: ClientType('type').notNull(),
	secret: text('secret').notNull(),
	use_pkce: boolean('use_pkce').notNull(),
	pkce_method: PKCEMethod('pkce_method').notNull().default("S256"),
	allow_implicit: boolean('allow_implicit').notNull(),
	login_url: text('login_url').notNull(),
	allowed_callback_urls: text('allowed_callback_urls').array().notNull().default([]),
	allowed_logout_urls: text('allowed_logout_urls').array().notNull().default([]),
	allowed_web_origins: text('allowed_web_origins').array().notNull().default([]),
	backchannel_logout_uri: text('backchannel_logout_uri'),
	grant_types: AccessGrantType('grant_types').array().notNull().default([]),
	id_token_expiration: integer('id_token_expiration').notNull().default(3600),
	refresh_token_expiration: integer('refresh_token_expiration').notNull().default(3600),
	logout_token_expiration: integer('logout_token_expiration').notNull().default(320),
	inactive_time_limit: integer('inactive_time_limit').default(86400),
	token_sender_constraining: boolean('token_sender_constraining').notNull(),
	jwks: jsonb('jwks').notNull().default("{}"),
	request_object_signing_key: jsonb('request_object_signing_key'),
	internal: boolean('internal'),
	labels: text('labels').array().notNull().default([]),
	created_at: timestamp('created_at', { precision: 3 }).notNull().defaultNow(),
	created_by: text('created_by').notNull().default("system"),
	updated_at: timestamp('updated_at', { precision: 3 }),
	updated_by: text('updated_by')
}, (Client) => [
	foreignKey({
		name: 'fk_clients_instance',
		columns: [Client.org_id],
		foreignColumns: [InstanceTable.org_id]
	})
		.onDelete('cascade')
		.onUpdate('cascade'),
	primaryKey({
		name: 'pk_client',
		columns: [Client.org_id, Client.client_id]
	})
]);

export const ClientSigningKeyTable = InstancesSchema.table('clients_signing_keys', {
	org_id: text('org_id').notNull(),
	client_id: text('client_id').notNull(),
	kid: text('kid').notNull(),
	jwk: jsonb('jwk').notNull(),
	kty: Kty('kty').notNull(),
	use: JWTUse('use').notNull(),
	alg_allowed: JwtSignAlg('alg_allowed').array().notNull(),
	status: text('status').notNull(),
	not_before: integer('not_before').notNull(),
	first_seen_at: timestamp('first_seen_at', { precision: 3 }),
	last_seen_at: timestamp('last_seen_at', { precision: 3 }),
	revoked: boolean('revoked'),
	revoked_at: timestamp('revoked_at', { precision: 3 }),
	created_at: timestamp('created_at', { precision: 3 }).notNull().defaultNow(),
	created_by: text('created_by').notNull().default("system"),
	updated_at: timestamp('updated_at', { precision: 3 }),
	updated_by: text('updated_by')
}, (ClientSigningKey) => [
	foreignKey({
		name: 'fk_clients_signing_keys_client',
		columns: [ClientSigningKey.org_id, ClientSigningKey.client_id],
		foreignColumns: [ClientTable.org_id, ClientTable.client_id]
	})
		.onDelete('cascade')
		.onUpdate('cascade'),
	primaryKey({
		name: 'pk_client_signing_key',
		columns: [ClientSigningKey.org_id, ClientSigningKey.client_id, ClientSigningKey.kid]
	})
]);

export const ClientPermissionTable = InstancesSchema.table('clients_perms', {
	org_id: text('org_id').notNull(),
	client_id: text('client_id').notNull(),
	resource_server_identifier: text('resource_server_identifier').notNull(),
	scope_value: text('scope_value').notNull(),
	created_at: timestamp('created_at', { precision: 3 }).notNull().defaultNow(),
	created_by: text('created_by').notNull().default("system"),
	updated_at: timestamp('updated_at', { precision: 3 }),
	updated_by: text('updated_by')
}, (ClientPermission) => [
	foreignKey({
		name: 'clients_perms_client_fkey',
		columns: [ClientPermission.org_id, ClientPermission.client_id],
		foreignColumns: [ClientTable.org_id, ClientTable.client_id]
	})
		.onDelete('cascade')
		.onUpdate('cascade'),
	foreignKey({
		name: 'fk_clients_perms_permission',
		columns: [ClientPermission.org_id, ClientPermission.resource_server_identifier, ClientPermission.scope_value],
		foreignColumns: [PermissionTable.org_id, PermissionTable.resource_server_identifier, PermissionTable.scope_value]
	})
		.onDelete('cascade')
		.onUpdate('cascade'),
	primaryKey({
		name: 'pk_client_permission',
		columns: [ClientPermission.org_id, ClientPermission.resource_server_identifier, ClientPermission.scope_value, ClientPermission.client_id]
	})
]);
