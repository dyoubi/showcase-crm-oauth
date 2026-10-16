import { inject, injectable, IUseCase, NotFoundException, SystemException } from "@egc-io/ckit-lib";
import { Client, CLIENT_REPOSITORY, IClientRepository, PK_Client } from "@ring-oauth/core";

export type ClientUpdateIn = {
	org_id: string;
	client_id: string;
	data: Partial<
		Omit<Client,
			| keyof PK_Client
			| 'type'
		>
	>;
};

export type ClientUpdateOut = void;

@injectable()
export class UpdateClientUseCase implements IUseCase<ClientUpdateIn, ClientUpdateOut> {

	constructor(
		@inject(CLIENT_REPOSITORY) private readonly $clientRepo: IClientRepository,
	) { }

	async execute(input: ClientUpdateIn): Promise<ClientUpdateOut> {
		let count: number;
		try {
			count = await this.$clientRepo.count({
				where: {
					org_id: input.org_id,
					client_id: input.client_id
				}
			});
		} catch (error) {
			throw new SystemException(`cannot verify entity ${error.message}`);
		}

		if (count == 0) {
			throw new NotFoundException(`client not found`);
		}

		try {
			await this.$clientRepo.updateById({ org_id: input.org_id, client_id: input.org_id }, input.data);
		} catch (error) {
			throw new SystemException(`cannot update client ${error.message}`);
		}

	}
}