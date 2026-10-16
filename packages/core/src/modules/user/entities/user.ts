import { IRepository } from "@egc-io/ckit-lib";
import { BusinessModel, JSONObject, HashID } from "../../../common";

export function UserID(org_id: string, email: string, connection: string): string {
	return HashID(`${org_id}${connection}${email}`);
}

export class User extends BusinessModel {
	org_id: string;
	user_id: string;
	email: string;
	username: string;
	name: string | null;
	connection: string;
	metadata: JSONObject | null;
}
export type PK_User = Pick<User, 'org_id' | 'user_id'>;

export type IUserRepository = IRepository<User, PK_User>;
export const USER_REPOSITORY = Symbol("USER_REPOSITORY");