export namespace keywords {
	export enum ECRUD {
		CREATE = 'create',
		READ = 'read',
		UPATE = 'update',
		DELETE = 'delete',
	}
	export type CRUD = `${ECRUD}` | ECRUD;
	export const CRUD: ReadonlyArray<CRUD> = Object.values(ECRUD);
}

export function CRUD(resource: string, resource_server: string) {
	return keywords.CRUD.map((action) => ({
		scope_value: `${resource}.${action}`,
		resource_server,
	}));
}

export const ManagementResources: ReadonlyArray<string> = [
	'instance',
	'instance_setting',
	'resource_server',
	'client',
	'client_grant',
	'client_key',
	'client_credential',
	'database',
	'connection',
	'connections_option',
	'connections_key',
	'user',
	'user_ticket',
	'user_attribute_profile',
	'role',
	'role_member',
	'blacklist_token',
	'grant',
	'email_template',
	'branding',
	'prompt',
	'authentication_method',
	'organization',
	'encryption_key',
	'custom_signing_key',
	'login_session',
	'form',
	'refresh_token',
] as const;