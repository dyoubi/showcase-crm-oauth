import {
	inject,
	IUseCase,
	ConflictException,
	NotFoundException,
	SystemException,
	injectable,
} from "@egc-io/ckit-lib";
import {
	CLIENT_REPOSITORY,
	CONNECTION_REPO,
	DATABASE_REPO,
	IClientRepository,
	IConnectionRepository,
	IDatabaseRepository,
	Connection,
	Instance,
	PK_Connection
} from "@ring-oauth/core";

export type ConnectionUseCaseIn = {
	org_id: string;
	connection:
	& Omit<PK_Connection, 'org_id'>
	& Partial<Pick<Connection, 'allow_actions' | 'enable'>>,
};

export type ConnectionUseCaseOut = Connection;

@injectable()
export class CreateConnectionUseCase implements IUseCase<ConnectionUseCaseIn, ConnectionUseCaseOut> {
	constructor(
		@inject(DATABASE_REPO)
		private readonly $dbRepo: IDatabaseRepository,
		@inject(CLIENT_REPOSITORY)
		private readonly $clientRepo: IClientRepository,
		@inject(CONNECTION_REPO)
		private readonly $connRepo: IConnectionRepository,
	) { }


	async execute(input: ConnectionUseCaseIn): Promise<ConnectionUseCaseOut> {
		let count: number;

		try {
			count = await this.$clientRepo.count({
				where: {
					org_id: input.org_id,
					client_id: input.connection.client_id,
				}
			});
		} catch (error) {
			throw new SystemException(`cannot verify entity ${error.message}`);
		}

		if (count !== 1) {
			throw new NotFoundException(`client_guid not exists`);
		}

		try {
			count = await this.$dbRepo.count({
				where: {
					org_id: input.org_id,
					identifier: input.connection.database_identifier,
				}
			});
		} catch (error) {
			throw new SystemException(`cannot verify entity ${error.message}`);
		}

		if (count !== 1) {
			throw new NotFoundException(`client_guid not exists`);
		}

		try {
			count = await this.$connRepo.count({
				where: {
					client_id: input.connection.client_id,
					database_identifier: input.connection.database_identifier
				}
			});
		} catch (error) {
			throw new SystemException(`cannot verify entity ${error.message}`);
		}

		if (count > 0) {
			throw new ConflictException(`database access already exists`);
		}

		try {
			let connection = Object.assign(new Connection(), {
				org_id: input.org_id,
				...input.connection,
			});
			connection = await this.$connRepo.create(connection);
			return connection;
		} catch (error) {
			throw new SystemException(`cannot create entity ${error.message}`);
		}

	}
}