import { inject, injectable, IUseCase, log, NotFoundException } from "@egc-io/ckit-lib";
import {
	Database, DATABASE_REPO, IDatabaseRepository,
	Instance,
	RandomAlphaNumID,
	IInstanceRepository,
	INSTANCE_REPOSITORY
} from "@ring-oauth/core";

type In = {
	org_id: string;
	database:
	& Pick<Database, 'name'>;
};
type Out = Database;

@injectable()
export class CreateDatabaseUseCase implements IUseCase<In, Out> {
	constructor(
		@inject(DATABASE_REPO) private readonly $databases: IDatabaseRepository,
		@inject(INSTANCE_REPOSITORY) private readonly $instanceRepo: IInstanceRepository

	) { }

	async execute(input: In): Promise<Out> {
		let count: number = 0;
		let database: Database = new Database();
		let instance: Instance|null = null;

		try {
			instance = await this.$instanceRepo.findOne({ where: { org_id: input.org_id } });
		} catch (error) {
			throw new Error(`cannot verify entity ${error.message}`);
		}

		if(!instance){
			throw new NotFoundException(`instance not found`);
		}

		database.org_id = input.org_id;
		database.identifier = `con_${RandomAlphaNumID(16)}`;
		database.name = input.database.name;
		try {
			count = await this.$databases.count({
				where: {
					org_id: instance.org_id,
					identifier: database.identifier,
				}
			});
		} catch (error) {
			throw new Error(`cannot create verify ${error.message}`);
		}

		if (count > 0) {
			throw new Error(`entity conflict`);
		}

		try {
			log.info('create new database', JSON.stringify(database));
			database = await this.$databases.create(database);
		} catch (error) {
			throw new Error(`cannot create database ${error?.message.trim()}`);
		}

		return database;

	}

}