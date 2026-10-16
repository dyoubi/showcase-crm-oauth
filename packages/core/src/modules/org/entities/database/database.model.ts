import { createHash, randomBytes } from "node:crypto";
import { BusinessModel, HashID } from "../../../../common";

export function PartitionID(database: Pick<Database, 'org_id'>): string {
	return `pt_` + [database.org_id].map(v =>
		createHash('md5')
			.update(v)
			.digest()
			.toString('hex', 0, 12)
	).join('');
}

export class Database extends BusinessModel {
	name: string;
	identifier: string;
	org_id: string;
	salt: string = HashID(randomBytes(32));
	internal?: boolean | null = false;
	labels?: string[] | null = [];
}
export type PK_Database = Pick<Database, 'org_id' | 'identifier'>;

export enum EUserAction {
	REGISTER = 'REGISTER',
	AUTHENTICATE = 'AUTHENTICATE',
	RESET_PASSWORD = 'RESET_PASSWORD',
}
export type UserAction = `${EUserAction}` | EUserAction;

export class Connection extends BusinessModel {
	org_id: string;
	database_identifier: string;
	client_id: string;
	enable: boolean;
	allow_actions: UserAction[];
}
export type PK_Connection = Pick<Connection,
	| 'org_id'
	| 'database_identifier'
	| 'client_id'
>;
