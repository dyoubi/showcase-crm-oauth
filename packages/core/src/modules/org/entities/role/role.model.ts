import { Permission } from "../resource-server";
import { BusinessModel } from "../../../..";

export class Role extends BusinessModel {
	org_id: string;
	identifier: string;
	name: string;
	description: string;
	internal?: boolean | null = false;
}
export type PK_Role = Pick<Role,
	| 'org_id'
	| 'identifier'
>;

export class RolePermission extends Permission {
	role_identifier: string;
}
export type PK_RolePermission = Pick<RolePermission,
	| 'org_id'
	| 'scope_value'
	| 'resource_server_identifier'
	| 'role_identifier'>;
