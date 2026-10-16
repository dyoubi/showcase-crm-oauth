import { IRepository } from "@egc-io/ckit-lib";
import { Permission } from "../../org/entities/resource-server/resource-server.model";

export class UserPermission extends Permission {
	user_id: string;
}
export type PK_UserPermission =
	& Pick<Permission, 'org_id' | 'resource_server_identifier' | 'scope_value'>
	& Pick<UserPermission,
		| 'user_id'>;

export type IUserPermissionRepository = IRepository<UserPermission, PK_UserPermission>;
export const USER_PERMISSION_REPOSITORY = Symbol("USER_PERMISSION_REPOSITORY");