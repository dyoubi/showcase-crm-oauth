import { PK_Database, IDatabaseRepository, Database, Connection, PK_Connection } from "@ring-oauth/core";
import { PrismaRepository } from "../common/repository";

type PrismaDatabaseID = { org_id_identifier: PK_Database; };
export class DatabaseRepo extends PrismaRepository<Database, PK_Database, keyof PrismaDatabaseID>
	implements IDatabaseRepository {
	override $ID(v: PK_Database): PrismaDatabaseID { return { org_id_identifier: v }; }
}

type PrismaConnectionID = { org_id_client_id_database_identifier: PK_Connection; };
export class ConnectionRepo extends PrismaRepository<Connection, PK_Connection, keyof PrismaConnectionID> {
	override $ID(v: PK_Connection): PrismaConnectionID { return { org_id_client_id_database_identifier: v }; }
}