import { IResourceServerRepository, PK_Permission, PK_ResourceServer, ResourceServer, Permission } from "@ring-oauth/core";
import { PrismaRepository } from "../common/repository";

type PrismaResourceServerID = { org_id_identifier: PK_ResourceServer; };
export class ResourceServerRepo extends PrismaRepository<
	ResourceServer,
	PK_ResourceServer,
	keyof PrismaResourceServerID
> implements IResourceServerRepository {
	protected override $ID(v: PK_ResourceServer): PrismaResourceServerID { return { org_id_identifier: v }; }
}

type PrismaPermissionID = { org_id_resource_server_identifier_scope_value: PK_Permission; };
export class PermissionRepo
	extends PrismaRepository<Permission, PK_Permission, keyof PrismaPermissionID> {
	protected override $ID(v: PK_Permission): PrismaPermissionID {
		return { org_id_resource_server_identifier_scope_value: v };
	}
}
