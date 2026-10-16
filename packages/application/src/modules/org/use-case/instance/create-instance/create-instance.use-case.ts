import { IUseCase, SystemException, inject, injectable, log } from "@egc-io/ckit-lib";
import {
	NewInstance, Instance, INSTANCE_REPOSITORY,
	IInstanceRepository,
	EJwtSignAlg,
	JsonWebKeyProvider,
	JsonWebKeyPairRing,
	EJwkUse,
	JsonWebKeyEncKeyPair,
	JsonWebKeySigKeyPair,
	INSTANCE_JWT_PAIR_REPOSITORY,
	IInstanceJwtPairRepository
} from "@ring-oauth/core";

@injectable()
export class CreateInstanceUseCase implements IUseCase<NewInstance, Instance> {
	constructor(
		@inject(INSTANCE_REPOSITORY)
		private readonly $instances: IInstanceRepository,
		@inject(INSTANCE_JWT_PAIR_REPOSITORY)
		private readonly $jwts: IInstanceJwtPairRepository,
	) { }

	async execute(input: NewInstance): Promise<Instance> {
		let count: number = 0;

		try {
			count = await this.$instances.count({ where: { org_id: input.org_id } });
		} catch (error) {
			throw new Error(`cannot verify instance ${error.message}`);
		}

		if (count > 0) {
			throw new Error(`instance already exists for org_id "${input.org_id}"`);
		}


		const jwk_provider = new JsonWebKeyProvider();
		let instance: Instance = Object.assign(new Instance(),
			{
				org_id: input.org_id,
				name: input.name,
				tags: input.tags,
			}
		);

		try {
			instance = await this.$instances.create(instance);
		} catch (error) {
			throw new SystemException(`cannot create instance ${error.message}`);
		}

		for (const alg of Object.values(EJwtSignAlg)) {
			log.info(`generate json web token keys for alg ${alg}`);
			let opts = {
				kid_namespace: [input.org_id],
				alg,
				modulus: 2048,
			};
			const sig = await jwk_provider.generate({
				...opts,
				use: 'sig',
			}) as JsonWebKeySigKeyPair;

			const enc = await await jwk_provider.generate({
				...opts,
				use: 'enc',
			}) as JsonWebKeyEncKeyPair;
			const promises: Promise<any>[] = [
				this.$jwts.create({ org_id: instance.org_id, ...sig }),
				this.$jwts.create({ org_id: instance.org_id, ...enc }),
			];
			try {
				await Promise.all(promises);

			} catch (error) {
				console.error(`cannot create jwt keys for alg ${alg} ${error.message}`);
			}
		}
		return instance;
	}


}