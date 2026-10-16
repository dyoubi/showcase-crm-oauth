import { inject, injectable, IUseCase, log, NotFoundException, SystemException, Where } from "@egc-io/ckit-lib";
import {
	CLIENT_REPOSITORY,
	DATABASE_REPO,
	IClientRepository,
	IDatabaseRepository,
	IInstanceRepository,
	Instance,
	INSTANCE_REPOSITORY,
	IPermissionRepository,
	IResourceServerRepository,
	IRoleRepository,
	IUserRepository,
	PERMISSION_REPOSITORY,
	RESOURCE_SERVER_REPO,
	ROLE_REPOSITORY,
	USER_REPOSITORY
} from "@ring-oauth/core";

@injectable()
export class DeleteInstanceUseCase implements IUseCase<{ org_id: string; }, void> {
	constructor(
		@inject(INSTANCE_REPOSITORY) private readonly $instanceRepo: IInstanceRepository,

		@inject(USER_REPOSITORY) private readonly $userRepo: IUserRepository,
		@inject(DATABASE_REPO) private readonly $databasesRepo: IDatabaseRepository,
		@inject(CLIENT_REPOSITORY) private readonly $clientsRepo: IClientRepository,
		@inject(RESOURCE_SERVER_REPO) private readonly $rsRepo: IResourceServerRepository,
		@inject(ROLE_REPOSITORY) private readonly $roleRepo: IRoleRepository,
		@inject(PERMISSION_REPOSITORY) private readonly $permRepo: IPermissionRepository,
	) { }

	async execute(input: { org_id: string; }): Promise<void> {
		let instance: Instance | null = null;

		try {
			instance = await this.$instanceRepo.findOne({ where: { org_id: input.org_id } });
		} catch (error) {
			throw new SystemException('cannot verify entity');
		}

		if (!instance) {
			throw new NotFoundException('instance not found');
		}

		try {
			const repoList: { delete(filter: Where<{ org_id: string; }>): Promise<any>; }[] = [
				this.$clientsRepo,
				this.$userRepo,
				this.$roleRepo,
				this.$permRepo,
				this.$databasesRepo,
				this.$rsRepo,
			];
			for (const repo of repoList) {
				await repo.delete({ org_id: input.org_id, });
			}
		} catch (error) {
			log.error(error.message);
		}

		try {
			await this.$instanceRepo.deleteById(instance.guid);
		} catch (error) {
			throw new SystemException(`${error.message}`);
		}

	}
}