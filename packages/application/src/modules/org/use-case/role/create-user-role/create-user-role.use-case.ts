import { ConflictException, inject, injectable, IUseCase, SystemException } from "@egc-io/ckit-lib";
import {
	IRoleRepository, IUserRepository, IUserRoleRepository, PK_User,
	PK_UserRole,
	ROLE_REPOSITORY, USER_REPOSITORY, USER_ROLE_REPOSITORY,
	UserRole
} from "@ring-oauth/core";

export type CreateUserRoleIn = {
	org_id: string;
	role_identifier: string;
	user:
	& Omit<PK_User, 'org_id'>;
};

@injectable()
export class CreateUserRoleUseCase implements IUseCase<CreateUserRoleIn, void> {
	constructor(
		@inject(USER_REPOSITORY)
		private readonly $userRepo: IUserRepository,
		@inject(ROLE_REPOSITORY)
		private readonly $roleRepo: IRoleRepository,
		@inject(USER_ROLE_REPOSITORY)
		private readonly $userRoleRepo: IUserRoleRepository,
	) { }

	async execute(input: CreateUserRoleIn): Promise<void> {
		let userRole: UserRole;
		let count: number;

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
			throw new ConflictException(`cannot role`);
		}


		try {
			count = await this.$userRepo.count({
				where: {
					org_id: input.org_id,
					user_id: input.user.user_id,
				}
			});
		} catch (error) {
			throw new SystemException(`cannot verify entity ${error.message}`);
		}

		if (count < 1) {
			throw new ConflictException(`cannot role`);
		}



		try {
			count = await this.$userRoleRepo.count({
				where: {
					org_id: input.org_id,
					user_id: input.user.user_id,
					role_identifier: input.role_identifier,
				}
			});
		} catch (error) {
			throw new SystemException(`cannot verify entity ${error.message}`);
		}

		if (count > 0) {
			throw new ConflictException(`user role already exists`);
		}

		userRole = Object.assign<UserRole, PK_UserRole>(
			new UserRole,
			{
				org_id: input.org_id,
				user_id: input.user.user_id,
				role_identifier: input.role_identifier,
			}
		);

		userRole = await this.$userRoleRepo.create(userRole);
	}
}