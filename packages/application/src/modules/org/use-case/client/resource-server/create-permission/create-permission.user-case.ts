import { autoInjectable, ConflictException, inject, injectable, IUseCase, NotFoundException, SystemException } from "@egc-io/ckit-lib";
import {
	IInstanceRepository, INSTANCE_REPOSITORY, IPermissionRepository, IRoleRepository,
	Permission, PERMISSION_REPOSITORY, PK_Permission, ROLE_REPOSITORY
} from "@ring-oauth/core";


type ScopeData =
	& Partial<Omit<Permission, keyof PK_Permission>>
	& Omit<PK_Permission,
		| 'org_id'
		| 'resource_server_identifier'
	>;
export type CreatePermissionIn = {
	org_id: string;
	resource_server_identifier: string;
	scope: ScopeData | ScopeData[];
};
export type CreatePermissionOut = Permission[];

@injectable()
export class CreatePermissionUseCase implements IUseCase<CreatePermissionIn, CreatePermissionOut> {
	constructor(
		@inject(PERMISSION_REPOSITORY)
		private readonly $permRepo: IPermissionRepository,
		@inject(ROLE_REPOSITORY)
		private readonly $roleRepo: IRoleRepository,
		@inject(INSTANCE_REPOSITORY)
		private readonly $instanceRepo: IInstanceRepository,
	) { }

	async execute(input: CreatePermissionIn): Promise<CreatePermissionOut> {
		let count: number;

		try {
			count = await this.$instanceRepo.count({ where: { org_id: input.org_id } });
		} catch (error) {
			throw new SystemException(`cannot verify entity ${error.message}`);
		}

		if (count === 0) {
			throw new NotFoundException(`instance not found`);
		}

		let scopeMap: Record<string, Permission> = {};
		(Array.isArray(input.scope) ? input.scope : [input.scope]).forEach(
			s => scopeMap[s.scope_value] =
				Object.assign(
					new Permission(),
					{
						...s,
						org_id: input.org_id,
						resource_server_identifier: input.resource_server_identifier,
					}
				)
		);

		try {

			count = await this.$permRepo.count({
				where: {
					org_id: input.org_id,
					resource_server_identifier: input.resource_server_identifier,
					scope_value: { inq: Object.keys(scopeMap) }
				}
			});

		} catch (error) {
			throw new SystemException(`cannot verify entity ${error.message}`);
		}

		if (count) {
			throw new ConflictException(`scope_value duplicates found`);
		}

		let permisionList: Permission[] = [];
		for (const permission of Object.values(scopeMap)) {
			permisionList.push(await this.$permRepo.create(permission));
		}

		return permisionList;
	}

}