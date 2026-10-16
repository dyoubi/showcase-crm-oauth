import { IRepository } from "@egc-io/ckit-lib";
import { BusinessModel } from "../../../common";

export class UserRole extends BusinessModel {
	org_id: string;
	role_identifier: string;
	user_id: string;
}
export type PK_UserRole = Pick<UserRole,
	| 'org_id'
	| 'role_identifier'
	| 'user_id'
>;
export const USER_ROLE_REPOSITORY = Symbol("USER_ROLE_REPOSITORY");
export type IUserRoleRepository = IRepository<UserRole, PK_UserRole>;