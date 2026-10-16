import { ConflictException, inject, injectable, log, NotFoundException, SystemException } from "@egc-io/ckit-lib";
import {
	ROLE_REPOSITORY,
	IRoleRepository, IInstanceRepository,
	Role, utils, PK_Permission,
	ROLE_PERMISSION_REPOSITORY,
	IRolePermissionRepository,
	RolePermission,
	PK_Role,
	INSTANCE_REPOSITORY,
} from "@ring-oauth/core";

type RoleData =
	& Partial<Omit<Role, keyof PK_Role>>
	& Omit<PK_Role, 'org_id'>
	& Pick<Role, 'name'>
	& { permissions?: Omit<PK_Permission, 'org_id'>[]; };

export type CreateRoleIn = {
	org_id: string;
	role: RoleData;
};

@injectable()
export class CreateRoleUseCase {

	constructor(
		@inject(ROLE_REPOSITORY)
		private readonly $roleRepo: IRoleRepository,
		@inject(ROLE_PERMISSION_REPOSITORY)
		private readonly $rolePermRepo: IRolePermissionRepository,
		@inject(INSTANCE_REPOSITORY)
		private readonly $instanceRepo: IInstanceRepository
	) { }

	async execute(input: CreateRoleIn): Promise<Role> {
		let role: Role;
		let count: number;

		try {
			count = await this.$instanceRepo.count({ where: { org_id: input.org_id } });
		} catch (error) {
			throw new SystemException(`cannot verify entity ${error.message}`);
		}

		if (count < 1) {
			throw new NotFoundException(`instance not found`);
		}

		try {
			count = await this.$roleRepo.count({
				where: {
					org_id: input.org_id,
					identifier: input.role.identifier,
				}
			});
		} catch (error) {
			throw new SystemException(`cannot verify entity ${error.message}`, 'repository', undefined, undefined, error);
		}

		if (count) {
			throw new ConflictException(`role already exists`);
		}

		try {
			role = await this.$roleRepo.create({
				...utils.omit(input.role, ['permissions']),
				org_id: input.org_id,
			});
		} catch (error) {
			throw new SystemException(`cannot create entity ${error.message}`, 'repository', undefined, undefined, error);
		}

		if (input.role.permissions?.length) {
			let rolePermList: RolePermission[] = [];
			try {
				for (const data of input.role.permissions) {
					const rolePerm = await this.$rolePermRepo.create({
						org_id: input.org_id,
						role_identifier: input.role.identifier,
						...data,
					});
					rolePermList.push(rolePerm);
				}
			} catch (error) {
				try {
					log.warn('delete roles permissions ...');
					if (rolePermList.length) {
						await this.$rolePermRepo.delete({ org_id: input.org_id, role_identifier: input.role.identifier });
					}
				} catch (fatal) {
					throw new SystemException(`cannot delete entity ${fatal.message}`, 'repository', undefined, undefined, error);
				}
				throw new SystemException(`cannot create entity ${error.message}`, 'repository', undefined, undefined, error);
			}
		}
		return role;
	}

}