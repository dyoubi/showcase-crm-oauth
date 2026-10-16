import { relations } from "drizzle-orm";
import { LoginSessionTable, AccessTokenTable, RefreshTokenTable } from "./authorization";
import { HTMLTemplateTable, ThemeTable, I18nTable } from "./branding";
import {
	ClientPermissionTable, ClientSigningKeyTable, ClientTable, InstanceJwtKeyPairTable,
	InstanceTable, PermissionTable, ResourceServerTable,
	RolePermissionTable, RoleTable, UserPermissionTable, UserRoleTable, UserTable
} from "./instances";
import { ConnectionTable, DatabaseTable } from "./instances/table/database.table";

export const ClientRelations = relations(ClientTable, ({ one, many }) => ({
	instance: one(InstanceTable, {
		relationName: 'ClientToInstance',
		fields: [ClientTable.org_id],
		references: [InstanceTable.org_id]
	}),
	connections: many(ConnectionTable, {
		relationName: 'ClientToConnection'
	}),
	ClientPermission: many(ClientPermissionTable, {
		relationName: 'ClientToClientPermission'
	}),
	ClientSigningKey: many(ClientSigningKeyTable, {
		relationName: 'ClientToClientSigningKey'
	})
}));

export const ClientSigningKeyRelations = relations(ClientSigningKeyTable, ({ one }) => ({
	client: one(ClientTable, {
		relationName: 'ClientToClientSigningKey',
		fields: [ClientSigningKeyTable.org_id, ClientSigningKeyTable.client_id],
		references: [ClientTable.org_id, ClientTable.client_id]
	})
}));

export const ClientPermissionRelations = relations(ClientPermissionTable, ({ one }) => ({
	client: one(ClientTable, {
		relationName: 'ClientToClientPermission',
		fields: [ClientPermissionTable.org_id, ClientPermissionTable.client_id],
		references: [ClientTable.org_id, ClientTable.client_id]
	}),
	permission: one(PermissionTable, {
		relationName: 'ClientPermissionToPermission',
		fields: [ClientPermissionTable.org_id, ClientPermissionTable.resource_server_identifier, ClientPermissionTable.scope_value],
		references: [PermissionTable.org_id, PermissionTable.resource_server_identifier, PermissionTable.scope_value]
	})
}));

export const DatabaseRelations = relations(DatabaseTable, ({ one, many }) => ({
	instance: one(InstanceTable, {
		relationName: 'DatabaseToInstance',
		fields: [DatabaseTable.org_id],
		references: [InstanceTable.org_id]
	}),
	connections: many(ConnectionTable, {
		relationName: 'ConnectionToDatabase'
	}),
	users: many(UserTable, {
		relationName: 'DatabaseToUser'
	})
}));

export const ConnectionRelations = relations(ConnectionTable, ({ one }) => ({
	client: one(ClientTable, {
		relationName: 'ClientToConnection',
		fields: [ConnectionTable.org_id, ConnectionTable.client_id],
		references: [ClientTable.org_id, ClientTable.client_id]
	}),
	database: one(DatabaseTable, {
		relationName: 'ConnectionToDatabase',
		fields: [ConnectionTable.org_id, ConnectionTable.database_identifier],
		references: [DatabaseTable.org_id, DatabaseTable.identifier]
	})
}));

export const InstanceRelations = relations(InstanceTable, ({ many }) => ({
	clients: many(ClientTable, {
		relationName: 'ClientToInstance'
	}),
	databases: many(DatabaseTable, {
		relationName: 'DatabaseToInstance'
	}),
	resource_servers: many(ResourceServerTable, {
		relationName: 'InstanceToResourceServer'
	}),
	users: many(UserTable, {
		relationName: 'InstanceToUser'
	}),
	roles: many(RoleTable, {
		relationName: 'InstanceToRole'
	}),
	jwt_keypairs: many(InstanceJwtKeyPairTable, {
		relationName: 'InstanceToInstanceJwtKeyPair'
	}),
	html_templates: many(HTMLTemplateTable, {
		relationName: 'HTMLTemplateToInstance'
	}),
	themes: many(ThemeTable, {
		relationName: 'InstanceToTheme'
	}),
	i18n: many(I18nTable, {
		relationName: 'I18nToInstance'
	})
}));

export const InstanceJwtKeyPairRelations = relations(InstanceJwtKeyPairTable, ({ one }) => ({
	instance: one(InstanceTable, {
		relationName: 'InstanceToInstanceJwtKeyPair',
		fields: [InstanceJwtKeyPairTable.org_id],
		references: [InstanceTable.org_id]
	})
}));

export const LoginSessionRelations = relations(LoginSessionTable, ({ many }) => ({
	access_tokens: many(AccessTokenTable, {
		relationName: 'AccessTokenToLoginSession'
	}),
	refresh_tokens: many(RefreshTokenTable, {
		relationName: 'LoginSessionToRefreshToken'
	})
}));

export const AccessTokenRelations = relations(AccessTokenTable, ({ one, many }) => ({
	login_session: one(LoginSessionTable, {
		relationName: 'AccessTokenToLoginSession',
		fields: [AccessTokenTable.org_id, AccessTokenTable.sid],
		references: [LoginSessionTable.org_id, LoginSessionTable.sid]
	}),
	refresh_token: many(RefreshTokenTable, {
		relationName: 'AccessTokenToRefreshToken'
	})
}));

export const RefreshTokenRelations = relations(RefreshTokenTable, ({ one }) => ({
	login_session: one(LoginSessionTable, {
		relationName: 'LoginSessionToRefreshToken',
		fields: [RefreshTokenTable.org_id, RefreshTokenTable.sid],
		references: [LoginSessionTable.org_id, LoginSessionTable.sid]
	}),
	access_token: one(AccessTokenTable, {
		relationName: 'AccessTokenToRefreshToken',
		fields: [RefreshTokenTable.org_id, RefreshTokenTable.jti_access],
		references: [AccessTokenTable.org_id, AccessTokenTable.jti]
	})
}));

export const ResourceServerRelations = relations(ResourceServerTable, ({ one, many }) => ({
	instance: one(InstanceTable, {
		relationName: 'InstanceToResourceServer',
		fields: [ResourceServerTable.org_id],
		references: [InstanceTable.org_id]
	}),
	scopes: many(PermissionTable, {
		relationName: 'PermissionToResourceServer'
	}),
	identity_permissions: many(UserPermissionTable, {
		relationName: 'ResourceServerToUserPermission'
	})
}));

export const PermissionRelations = relations(PermissionTable, ({ one, many }) => ({
	resource_server: one(ResourceServerTable, {
		relationName: 'PermissionToResourceServer',
		fields: [PermissionTable.org_id, PermissionTable.resource_server_identifier],
		references: [ResourceServerTable.org_id, ResourceServerTable.identifier]
	}),
	users_permissions: many(UserPermissionTable, {
		relationName: 'PermissionToUserPermission'
	}),
	rolers_permissions: many(RolePermissionTable, {
		relationName: 'PermissionToRolePermission'
	}),
	clients_permissions: many(ClientPermissionTable, {
		relationName: 'ClientPermissionToPermission'
	})
}));

export const RoleRelations = relations(RoleTable, ({ one, many }) => ({
	instance: one(InstanceTable, {
		relationName: 'InstanceToRole',
		fields: [RoleTable.org_id],
		references: [InstanceTable.org_id]
	}),
	permissions: many(RolePermissionTable, {
		relationName: 'RoleToRolePermission'
	}),
	identities: many(UserRoleTable, {
		relationName: 'RoleToUserRole'
	})
}));

export const RolePermissionRelations = relations(RolePermissionTable, ({ one }) => ({
	role: one(RoleTable, {
		relationName: 'RoleToRolePermission',
		fields: [RolePermissionTable.org_id, RolePermissionTable.role_identifier],
		references: [RoleTable.org_id, RoleTable.identifier]
	}),
	permission: one(PermissionTable, {
		relationName: 'PermissionToRolePermission',
		fields: [RolePermissionTable.org_id, RolePermissionTable.resource_server_identifier, RolePermissionTable.scope_value],
		references: [PermissionTable.org_id, PermissionTable.resource_server_identifier, PermissionTable.scope_value]
	})
}));

export const UserRelations = relations(UserTable, ({ one, many }) => ({
	instance: one(InstanceTable, {
		relationName: 'InstanceToUser',
		fields: [UserTable.org_id],
		references: [InstanceTable.org_id]
	}),
	database: one(DatabaseTable, {
		relationName: 'DatabaseToUser',
		fields: [UserTable.org_id, UserTable.connection],
		references: [DatabaseTable.org_id, DatabaseTable.identifier]
	}),
	users_permissions: many(UserPermissionTable, {
		relationName: 'UserToUserPermission'
	}),
	users_roles: many(UserRoleTable, {
		relationName: 'UserToUserRole'
	})
}));

export const UserPermissionRelations = relations(UserPermissionTable, ({ one }) => ({
	user: one(UserTable, {
		relationName: 'UserToUserPermission',
		fields: [UserPermissionTable.org_id, UserPermissionTable.user_id],
		references: [UserTable.org_id, UserTable.user_id]
	}),
	resource_server: one(ResourceServerTable, {
		relationName: 'ResourceServerToUserPermission',
		fields: [UserPermissionTable.org_id, UserPermissionTable.resource_server_identifier],
		references: [ResourceServerTable.org_id, ResourceServerTable.identifier]
	}),
	permission: one(PermissionTable, {
		relationName: 'PermissionToUserPermission',
		fields: [UserPermissionTable.org_id, UserPermissionTable.resource_server_identifier, UserPermissionTable.scope_value],
		references: [PermissionTable.org_id, PermissionTable.resource_server_identifier, PermissionTable.scope_value]
	})
}));

export const UserRoleRelations = relations(UserRoleTable, ({ one }) => ({
	users: one(UserTable, {
		relationName: 'UserToUserRole',
		fields: [UserRoleTable.org_id, UserRoleTable.user_id],
		references: [UserTable.org_id, UserTable.user_id]
	}),
	role: one(RoleTable, {
		relationName: 'RoleToUserRole',
		fields: [UserRoleTable.org_id, UserRoleTable.role_identifier],
		references: [RoleTable.org_id, RoleTable.identifier]
	})
}));