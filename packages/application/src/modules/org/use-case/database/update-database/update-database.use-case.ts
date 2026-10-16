import { autoInjectable, inject, IUseCase, NotFoundException, SystemException } from "@egc-io/ckit-lib";
import { Database, DATABASE_REPO, IDatabaseRepository, PK_Database } from "@ring-oauth/core";

export type DatabaseUpdateIn = {
	org_id: string;
	database_identifier: string;
	data: Partial<
		Omit<Database,
			| 'guid'
			| 'org_id'
		>
	>;
};

export type DatabaseUpdateOut = void;

@autoInjectable()
export class UpdateDatabaseUseCase implements IUseCase<DatabaseUpdateIn, DatabaseUpdateOut> {

	constructor(
		@inject(DATABASE_REPO) private readonly $databaseRepo: IDatabaseRepository,
	) { }

	async execute(input: DatabaseUpdateIn): Promise<DatabaseUpdateOut> {
		let count: number;
		const pk: PK_Database = {
			org_id: input.org_id,
			identifier: input.database_identifier,
		};
		try {
			count = await this.$databaseRepo.count({ where: pk });
		} catch (error) {
			throw new SystemException(`cannot verify entity ${error.message}`);
		}

		if (count == 0) {
			throw new NotFoundException(`database not found`);
		}

		try {
			await this.$databaseRepo.updateById(pk, input.data);
		} catch (error) {
			throw new SystemException(`cannot update database ${error.message}`);
		}

	}
}