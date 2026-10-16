import { IRepository } from "@egc-io/ckit-lib";
import { ClientPermission, PK_ClientPermission } from "./client-permission.model";

export type IClientPermissionRepository = IRepository<ClientPermission, PK_ClientPermission>;
export const CLIENT_PERMISSION_REPOSITORY = Symbol('CLIENT_PERMISSION_REPOSITORY');