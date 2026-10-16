import { autoInjectable, inject, IUseCase, NotFoundException, SystemException } from "@egc-io/ckit-lib";
import { IInstanceRepository, IRoleRepository, PK_Role, Role, ROLE_REPOSITORY } from "@ring-oauth/core";

export type DeleteRoleUseIn = {
	org_id: string;
	role: Pick<Role, keyof PK_Role>;
};
export type DeleteRoleUseOut = void;

@autoInjectable()
export class DeleteRoleUseCase implements IUseCase<DeleteRoleUseIn, DeleteRoleUseOut> {

	constructor(
		@inject(ROLE_REPOSITORY)
		private readonly $roleRepo: IRoleRepository,
		@inject(ROLE_REPOSITORY)
		private readonly $instanceRepo: IInstanceRepository
	) { }

	async execute(input: DeleteRoleUseIn): Promise<DeleteRoleUseOut> {
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
			await this.$roleRepo.deleteById({
				org_id: input.org_id,
				identifier: input.role.identifier,
			});
		} catch (error) {
			throw new NotFoundException(`cannot delete entity`);
		}

	}

}