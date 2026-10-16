import {
	Client, IClientRepository, PK_Client,
	ClientPermission,
	PK_ClientPermission,
	IClientPermissionRepository,
	ClientSigningKey,
	PK_ClientSigningKey,
	IClientSigningKeyRepository
} from "@ring-oauth/core";
import { PrismaRepository } from "../common/repository";

type PrismaClientID = { org_id_client_id: PK_Client; };
export class ClientRepo extends PrismaRepository<
	Client,
	PK_Client,
	keyof PrismaClientID
> implements IClientRepository {
	protected override $ID(v: PK_Client): PrismaClientID { return { org_id_client_id: v }; }
}

type PrismaClientPermissionID = { org_id_resource_server_identifier_scope_value_client_id: PK_ClientPermission; };
export class ClientPermissionRepo extends PrismaRepository<
	ClientPermission,
	PK_ClientPermission,
	keyof PrismaClientPermissionID
> implements IClientPermissionRepository {

	protected override $ID(v: PK_ClientPermission): PrismaClientPermissionID {

		return { org_id_resource_server_identifier_scope_value_client_id: v };
	}
}

type PrismaClientSigningKeyID = { org_id_client_id_kid: PK_ClientSigningKey; };
export class ClientSigningKeyRepository extends PrismaRepository<
	ClientSigningKey,
	PK_ClientSigningKey,
	keyof PrismaClientSigningKeyID
> implements IClientSigningKeyRepository {
	protected override $ID(v: PK_ClientSigningKey): { org_id_client_id_kid: PK_ClientSigningKey; } {
		return { org_id_client_id_kid: v };
	}
}