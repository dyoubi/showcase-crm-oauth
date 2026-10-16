import { inject, injectable, IUseCase, NotFoundException, SystemException } from "@egc-io/ckit-lib";
import { CLIENT_REPOSITORY, IClientRepository, PK_Client } from "@ring-oauth/core";

export type ClientDeleteIn = {
	org_id: string;
	client: Omit<PK_Client, 'org_id'>;
};

export type ClientDeleteOut = void;

@injectable()
export class DeleteClientUseCase implements IUseCase<ClientDeleteIn, ClientDeleteOut> {

	constructor(
		@inject(CLIENT_REPOSITORY) private readonly $clientRepo: IClientRepository,
	) { }

	async execute(input: ClientDeleteIn): Promise<ClientDeleteOut> {
		let count: number;
		try {
			count = await this.$clientRepo.count({ where: input.client });
		} catch (error) {
			throw new SystemException(`cannot verify entity ${error.message}`);
		}

		if (count == 0) {
			throw new NotFoundException(`client not found`);
		}

		try {
			await this.$clientRepo.deleteById({
				org_id: input.org_id,
				...input.client
			});
		} catch (error) {
			throw new SystemException(`cannot delete client ${error.message}`);
		}

	}
}