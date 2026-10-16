import { inject, injectable, IUseCase, NotFoundException, SystemException } from "@egc-io/ckit-lib";
import {
	IInstanceRepository, INSTANCE_REPOSITORY, IPermissionRepository,
	PERMISSION_REPOSITORY, PK_Permission} from "@ring-oauth/core";

export type DeletePermissionIn = {
	org_id: string;
	permission: Omit<PK_Permission, 'org_id'>;
};

@injectable()
export class DeletePermission implements IUseCase<DeletePermissionIn, void> {
	constructor(
		@inject(PERMISSION_REPOSITORY)
		private readonly $permRepo: IPermissionRepository,
		@inject(INSTANCE_REPOSITORY)
		private readonly $instanceRepo: IInstanceRepository,
	) { }

	async execute(input: DeletePermissionIn): Promise<void> {
		let count: number;

		try {
			count = await this.$instanceRepo.count({ where: { org_id: input.org_id } });
		} catch (error) {
			throw new SystemException(`cannot verify entity ${error.message}`);
		}

		if (count) {
			throw new NotFoundException(`instance not found`);
		}

		try {
			await this.$permRepo.deleteById({
				org_id: input.org_id,
				resource_server_identifier: input.permission.resource_server_identifier,
				scope_value: input.permission.scope_value,
			});
		} catch (error) {
			throw new NotFoundException(`cannot delete entity`);
		}

		throw new Error("Method not implemented.");
	}

}