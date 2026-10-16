import { IRepository } from "@egc-io/ckit-lib";
import { ResourceServer, PK_ResourceServer, Permission } from "./resource-server.model";

export type IResourceServerRepository = IRepository<ResourceServer, PK_ResourceServer>;
export const RESOURCE_SERVER_REPO = Symbol("RESOURCE_SERVER_REPO");

export type PK_Permission = Pick<Permission,
	| 'org_id'
	| 'scope_value'
	| 'resource_server_identifier'
>;

export type IPermissionRepository = IRepository<Permission, PK_Permission>;
export const PERMISSION_REPOSITORY = Symbol('PERMISSION_REPOSITORY');
