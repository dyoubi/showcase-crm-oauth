import { inject, injectable, IUseCase, log } from "@egc-io/ckit-lib";
import {
	RandomAlphaNumID,
	EJwtSignAlg,
	IInstanceRepository,
	Instance,
	INSTANCE_REPOSITORY,
	IResourceServerRepository, NewResourceServer,
	RESOURCE_SERVER_REPO, ResourceServer
} from "@ring-oauth/core";
import { errors } from "../../../../../../common/exception-helpers";

@injectable()
export class CreateResourceServerUseCase
	implements IUseCase<NewResourceServer, ResourceServer> {
	constructor(
		@inject(RESOURCE_SERVER_REPO) private readonly $repo: IResourceServerRepository,
		@inject(INSTANCE_REPOSITORY) private readonly $instanceRepo: IInstanceRepository
	) { }

	async execute(input: NewResourceServer): Promise<ResourceServer> {
		let count = 0;

		let identifier = input.resource_server.identifier ?? `rs_${RandomAlphaNumID(32)}`;
		try {
			this.$repo.count({ where: { identifier, org_id: input.org_id } });
		} catch (error) {
			throw new Error(`cannot verify identifier ${error.message}`);
		}

		if (count > 0) {
			throw new Error("identifier already exists");
		}

		try {
			let rs: ResourceServer = Object.assign(new ResourceServer(), {
				...input.resource_server,
				org_id: input.org_id,
				identifier,
				authorization_schemas: [],
				enable_rar: false,
				enable_rbac: false,
				jwt_signing_algorithm: EJwtSignAlg.ES256,
			});
			log.trace('create new resource server', JSON.stringify(rs));
			rs = await this.$repo.create(rs);
			return rs;
		} catch (error) {
			log.error(error.message);
			throw errors.datasource.exception('write', 'resource_server');
		}
	}

}