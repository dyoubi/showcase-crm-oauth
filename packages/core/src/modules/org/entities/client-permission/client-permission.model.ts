import { IRepository } from "@egc-io/ckit-lib";
import { Permission, PK_Permission } from "../resource-server";

export class ClientPermission extends Permission {
	client_id: string;
}
export type PK_ClientPermission = PK_Permission & { client_id: string; };
