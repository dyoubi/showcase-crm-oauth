import { inject, injectable, IUseCase, SystemException } from "@egc-io/ckit-lib";
import { CONNECTION_REPO, IConnectionRepository, PK_Connection } from "@ring-oauth/core";

export type DatabaseAccessDeleteIn = {
	org_id: string;
	connection: Omit<PK_Connection, 'org_id'>,
};
export type DatabaseAccessDeleteOut = void;

@injectable()
export class DeleteConnectionUseCase implements IUseCase<DatabaseAccessDeleteIn, DatabaseAccessDeleteOut> {

	constructor(
		@inject(CONNECTION_REPO)
		private readonly $databaseAccessRepo: IConnectionRepository,
	) { }

	async execute(input: DatabaseAccessDeleteIn): Promise<DatabaseAccessDeleteOut> {

		try {
			await this.$databaseAccessRepo.deleteById({
				org_id: input.org_id,
				client_id: input.connection.client_id,
				database_identifier: input.connection.database_identifier,
			});
		} catch (error) {
			throw new SystemException(`cannot delete database access ${error.message}`);
		}

	}
}