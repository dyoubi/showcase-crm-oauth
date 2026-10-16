import {
	ConflictException, inject, injectable,
	IUseCase, NotFoundException, SystemException
} from "@egc-io/ckit-lib";
import {
	IPermissionRepository,
	IRolePermissionRepository,
	IRoleRepository,
	PERMISSION_REPOSITORY,
	PK_Permission,
	ROLE_PERMISSION_REPOSITORY,
	ROLE_REPOSITORY
} from "@ring-oauth/core";

export type DeleteRolePermissionIn = {
	org_id: string;
	role_identifier: string;
	permission:
	& Omit<PK_Permission, 'org_id'>;
};

@injectable()
export class DeleteRolePermissionUseCase implements IUseCase<DeleteRolePermissionIn, void> {
	constructor(
		@inject(PERMISSION_REPOSITORY)
		private readonly $permRepo: IPermissionRepository,
		@inject(ROLE_REPOSITORY)
		private readonly $roleRepo: IRoleRepository,
		@inject(ROLE_PERMISSION_REPOSITORY)
		private readonly $rolePermRepo: IRolePermissionRepository,
	) { }

	async execute(input: DeleteRolePermissionIn): Promise<void> {
		let count: number;

		{
			try {
				count = await this.$roleRepo.count({
					where: {
						org_id: input.org_id,
						identifier: input.role_identifier,
					}
				});
			} catch (error) {
				throw new SystemException(`cannot verify entity ${error.message}`);
			}

			if (count < 1) {
				throw new NotFoundException(`role does not exists`);
			}
		}

		{
			try {
				count = await this.$permRepo.count({
					where: {
						org_id: input.org_id,
						scope_value: input.permission.scope_value,
						resource_server_identifier: input.permission.resource_server_identifier,
					}
				});
			} catch (error) {
				throw new SystemException(`cannot verify entity ${error.message}`);
			}

			if (count < 1) {
				throw new NotFoundException(`permission does not exists`);
			}
		}

		{
			try {
				count = await this.$rolePermRepo.count({
					where: {
						org_id: input.org_id,
						scope_value: input.permission.scope_value,
						resource_server_identifier: input.permission.resource_server_identifier,
					}
				});
			} catch (error) {
				throw new SystemException(`cannot verify entity ${error.message}`);
			}

			if (count < 1) {
				throw new NotFoundException(`role permission does not exists`);
			}
		}

		await this.$rolePermRepo.deleteById({
			...input.permission,
			org_id: input.org_id,
			role_identifier: input.role_identifier,
		});

	}


}