import {
	BadRequestException, ConflictException, inject, injectable, IUseCase, log,
	NotFoundException, SystemException
} from "@egc-io/ckit-lib";
import {
	Client, CLIENT_REPOSITORY,
	IClientRepository,
	RandomAlphaNumID,
	IInstanceRepository,
	Instance,
	INSTANCE_REPOSITORY,
	PK_Client,
	HashID,
	JsonWebKeyProvider,
	EJwtSignAlg,
	DefaultClientGrantType,
	DefaultIdTokenExpiration,
	DefaultRefreshTokenExpiration
} from "@ring-oauth/core";
import { randomBytes } from "crypto";

type In = {
	org_id: string;
	client:
	& Omit<PK_Client, 'org_id' | 'client_id'>
	& Partial<Omit<Client, keyof PK_Client>>;
};
type Out = Client;

@injectable()
export class CreateClientUseCase implements IUseCase<In, Out> {
	constructor(
		@inject(CLIENT_REPOSITORY) private readonly $repo: IClientRepository,
		@inject(INSTANCE_REPOSITORY) private readonly instanceRepo: IInstanceRepository,
	) { }

	async execute(input: In): Promise<Out> {
		let count: number = 0;
		let instance: Instance | null;
		try {
			instance = await this.instanceRepo.findOne({
				where: {
					org_id: input.org_id,
				}
			});
		} catch (error) {
			throw new Error(`cannot verify entity ${error.message}`);
		}

		if (!instance) {
			throw new NotFoundException(`instance not found`);
		}

		let client: Client = Object.assign(new Client(), {
			...input.client,
			org_id: instance.org_id,
		});

		let client_id: string = `cl_${RandomAlphaNumID(16)}`;
		try {
			count = await this.$repo.count({
				where: {
					org_id: input.org_id,
					client_id,
				}
			});

		} catch (error) {
			throw new SystemException(`cannot verify entity ${error.message}`);
		}

		if (count) { throw new ConflictException(`entity already exists`); }

		let backchannel_logout_uri = input.client.backchannel_logout_uri;
		if (backchannel_logout_uri) {
			if (!URL.canParse(backchannel_logout_uri)) {
				throw new BadRequestException(`backchannel_logout_uri is not a valid url`);
			}
		}

		try {
			const jwk_provider = new JsonWebKeyProvider();
			const jwks = await jwk_provider.generate({
				kid_namespace: [input.org_id, client_id],
				alg: EJwtSignAlg.ES256,
				modulus: 2048,
				use: 'sig',
			});
			client.client_id = client_id;
			client.backchannel_logout_uri = backchannel_logout_uri ?? null;
			client.id_token_expiration = client.id_token_expiration ?? DefaultIdTokenExpiration;
			client.refresh_token_expiration = client.id_token_expiration ?? DefaultRefreshTokenExpiration;
			client.grant_types = client.grant_types ?? [...DefaultClientGrantType];
			client.secret = HashID(randomBytes(32).toString());
			client.jwks = jwks;
			log.trace(`create client ${JSON.stringify(client)}`);
			client = await this.$repo.create(client);
			return client;
		} catch (error) {
			throw new SystemException(`cannot create entity ${error.message}`);
		}
	}
}