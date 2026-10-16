import { PK_Role, IRoleRepository, PK_RolePermission, IRolePermissionRepository, Role, RolePermission } from "@ring-oauth/core";
import { PrismaRepository } from "../common/repository";

type PrismaRoleID = { org_id_identifier: PK_Role; };
export class RoleRepo
	extends PrismaRepository<Role, PK_Role, keyof PrismaRoleID>
	implements IRoleRepository {
	protected override $ID(v: PK_Role): PrismaRoleID { return { org_id_identifier: v }; }

}

type PrismaRolePermissionID = { org_id_identifier: PK_RolePermission; };
export class RolePermissionRepo
	extends PrismaRepository<RolePermission, PK_RolePermission, keyof PrismaRolePermissionID>
	implements IRolePermissionRepository {
	protected override $ID(v: PK_RolePermission): PrismaRolePermissionID {
		return { org_id_identifier: v };
	}
}