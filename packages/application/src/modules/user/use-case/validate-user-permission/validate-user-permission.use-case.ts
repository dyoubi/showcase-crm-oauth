import { inject, injectable, IUseCase } from "@egc-io/ckit-lib";
import {
	USER_PERMISSION_REPOSITORY,
	IUserPermissionRepository,
	USER_ROLE_REPOSITORY,
	IUserRoleRepository,
	ROLE_PERMISSION_REPOSITORY,
	IRolePermissionRepository,
	PK_Permission,
	DefaultScopes,
	isDefaultScope,
} from "@ring-oauth/core";

export type ValidateUserPermissionIn = {
	org_id: string;
	user_id: string;
	resource_server_identifier: string;
	permission: Pick<PK_Permission, 'scope_value'>[];
};

export type ValidateUserPermissionOut = boolean;
export const DefaultPermissionList = new Set<string>(DefaultScopes);

/**
 * Returns true if the user owns permissions for the given resource server. 
 * Check in user permission then user roles. 
 * 
 * Throw an error if the check cannot be performed. 
 * 
 * Values suches as `openid`, `profile`, `email` or permissions not owned by the resource server are ignored 
 */
@injectable()
export class ValidateUserPermission implements IUseCase<ValidateUserPermissionIn, ValidateUserPermissionOut> {
	constructor(
		@inject(USER_PERMISSION_REPOSITORY)
		private readonly $userPermRepo: IUserPermissionRepository,
		@inject(USER_ROLE_REPOSITORY)
		private readonly $userRoleRepo: IUserRoleRepository,
		@inject(ROLE_PERMISSION_REPOSITORY)
		private readonly $rolePermRepo: IRolePermissionRepository,
	) { }

	async execute(input: ValidateUserPermissionIn): Promise<boolean> {
		const scopeValues = new Set<string>();


		// fetch user permission list
		let wherePerms = {
			org_id: input.org_id,
			resource_server_identifier: input.resource_server_identifier,
			user_id: input.user_id,
		};
		for (const perm of await this.$userPermRepo.find({ where: wherePerms })) {
			scopeValues.add(perm.scope_value);
		}

		// fetch user role list
		let userRoles = await this.$userRoleRepo.find({
			where: {
				org_id: input.org_id,
				user_id: input.user_id,
			}
		});
		const roleIds = userRoles.map(r => r.role_identifier);

		// fetch role permission per user role 
		const whereRole = {
			org_id: input.org_id,
			resource_server_identifier: input.resource_server_identifier,
			scope_value: { inq: input.permission.map(v => v.scope_value) },
			role_identifier: { inq: roleIds }
		};
		for (const perm of await this.$rolePermRepo.find({ where: whereRole })) {
			scopeValues.add(perm.scope_value);
		}

		// check permission set
		for (const perm of input.permission) {
			if (!scopeValues.has(perm.scope_value) && !isDefaultScope(perm.scope_value)) {
				return false;
			}
		}
		return true;
	}
}