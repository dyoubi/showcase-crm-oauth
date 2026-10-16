import { autoInjectable, inject, IUseCase, NotFoundException, SystemException } from "@egc-io/ckit-lib";
import { DATABASE_REPO, IDatabaseRepository } from "@ring-oauth/core";

export type DatabaseDeleteIn = {
	org_id: string;
	database_identifier: string;
};
export type DatabaseDeleteOut = void;

@autoInjectable()
export class DeleteDatabaseUseCase implements IUseCase<DatabaseDeleteIn, DatabaseDeleteOut> {

	constructor(
		@inject(DATABASE_REPO)
		private readonly $databaseRepo: IDatabaseRepository,
	) { }

	async execute(input: DatabaseDeleteIn): Promise<DatabaseDeleteOut> {
		const where = { org_id: input.org_id, identifier: input.database_identifier };

		let count: number;
		try {
			count = await this.$databaseRepo.count({ where });
		} catch (error) {
			throw new SystemException(`cannot verify entity ${error.message}`);
		}

		if (count == 0) {
			throw new NotFoundException(`client not found`);
		}

		try {
			await this.$databaseRepo.deleteById(where);
		} catch (error) {
			throw new SystemException(`cannot delete client ${error.message}`);
		}

	}
}