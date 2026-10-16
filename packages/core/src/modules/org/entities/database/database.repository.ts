import { IRepository, Query } from "@egc-io/ckit-lib";
import { Database, PK_Database, Connection, PK_Connection } from "./database.model";

export type IDatabaseRepository = IRepository<Database, PK_Database>;
export const DATABASE_REPO = Symbol("DATABASE_REPO");

export type IConnectionRepository = IRepository<Connection, PK_Connection>;
export const CONNECTION_REPO = Symbol("CONNECTION_REPO");

export type ClientConnection = Omit<Connection,
	| 'org_id'
	| 'database_identifier'
	| 'client_id'
>;

export function ClientAccessMapper(connection: Connection): ClientConnection {
	return {
		enable: connection.enable,
		allow_actions: connection.allow_actions,
		created_at: connection.created_at,
		created_by: connection.created_by,
		updated_at: connection.updated_at,
		updated_by: connection.updated_by
	};
}

export type IClientConnectionGetter = {
	get(guid: string, filter: Query<ClientConnection>): Promise<Connection[]>;
};
export const CLIENT_CONNECTION_GETTER = Symbol('CLIENT_CONNECTION_GETTER'); 