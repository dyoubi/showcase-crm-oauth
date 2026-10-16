import { ConflictException, inject, injectable, IUseCase, SystemException } from "@egc-io/ckit-lib";
import {
	USER_REPOSITORY, IUserRepository,
	ROLE_REPOSITORY, IRoleRepository,
	USER_ROLE_REPOSITORY, IUserRoleRepository,
	Role,
	User,
	UserRole,
	PK_User
} from "@ring-oauth/core";

export type DeleteUserRoleIn = {
	org_id: string;
	role_identifier: string;
	user:
	& Omit<PK_User, 'org_id'>;
};

export type DeleteUserRoleOut = void;

@injectable()
export class DeleteUserRoleUseCase implements IUseCase<DeleteUserRoleIn, DeleteUserRoleOut> {
	constructor(
		@inject(USER_REPOSITORY)
		private readonly $userRepo: IUserRepository,
		@inject(ROLE_REPOSITORY)
		private readonly $roleRepo: IRoleRepository,
		@inject(USER_ROLE_REPOSITORY)
		private readonly $userRoleRepo: IUserRoleRepository,
	) { }

	async execute(input: DeleteUserRoleIn): Promise<void> {
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
					...input.user,
					org_id: input.org_id,
				}
			});
		} catch (error) {
			throw new SystemException(`cannot verify entity ${error.message}`);
		}

		if (count < 1) {
			throw new ConflictException(`cannot find user`);
		}

		await this.$userRoleRepo.deleteById({
			org_id: input.org_id,
			user_id: input.user.user_id,
			role_identifier: input.role_identifier,
		});

		throw new Error("Method not implemented.");
	}

}