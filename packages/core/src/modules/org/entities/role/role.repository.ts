import { IRepository } from "@egc-io/ckit-lib";
import { Role, PK_Role, RolePermission, PK_RolePermission } from "./role.model";

export type IRoleRepository = IRepository<Role, PK_Role>;
export const ROLE_REPOSITORY = Symbol("ROLE_REPOSITORY");

export type IRolePermissionRepository = IRepository<RolePermission, PK_RolePermission>;
export const ROLE_PERMISSION_REPOSITORY = Symbol("ROLE_PERMISSION_REPOSITORY");
