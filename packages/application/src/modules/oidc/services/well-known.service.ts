import { inject, injectable } from "@egc-io/ckit-lib";
import {
	CLIENT_REPOSITORY, IClientRepository, IInstanceRepository,
	INSTANCE_REPOSITORY, IOrgJwksProvider, ORG_JWKS_PROVIDER,
	formats,
} from "@ring-oauth/core";

@injectable()
export class WellKnownService {
	constructor(
		@inject(CLIENT_REPOSITORY)
		private readonly $clients: IClientRepository,
		@inject(INSTANCE_REPOSITORY)
		private readonly $instances: IInstanceRepository,
		@inject(ORG_JWKS_PROVIDER)
		private readonly $jwks: IOrgJwksProvider,) { }
		
	async wellknown(org_id: string) {
		const jwks = await this.$jwks.get(org_id);
		const issuer: string = formats.urn.urn('org', org_id);
	}
}