import { JwtSignAlg, BusinessModel, JSONObject } from "../../../../common";
import { PermissionType } from "./resource-server.schema";

export class ResourceServer extends BusinessModel {
	org_id: string;
	identifier: string;
	name: string;
	access_token_life_time: number = 86400;
	jwt_signing_algorithm: JwtSignAlg = 'RS256';
	enable_access_token_scope: boolean = false;
	enable_rbac: boolean = false;
	enable_rar?: boolean = false;
	authorization_schemas?: JSONObject[];
	internal?: boolean | null = false;
	labels?: string[] | null = [];
}
export type PK_ResourceServer = Pick<ResourceServer, 'org_id' | 'identifier'>;

export type NewResourceServer =
	{
		org_id: string;
		resource_server:
		& Partial<ResourceServer>
		& { name: string; };
	};

export class Permission extends BusinessModel implements PermissionType {
	org_id: string;
	scope_value: string;
	resource_server_identifier: string;
}