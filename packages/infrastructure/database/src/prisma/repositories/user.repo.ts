import {
	User, IUserRepository, UserCredentials, PK_User, PK_UserCredentials,
	IUserCredentialsRepository, IUserPermissionRepository, UserPermission,
	PK_UserPermission, UserRole, IUserRoleRepository, PK_UserRole,
	IUserCredentialsResolver,
	UserCredentialsResolutionInput
} from "@ring-oauth/core";
import { PrismaRepository } from "../common/repository";
import { Prisma } from "@prisma/client";
import { BadRequestException } from "@egc-io/ckit-lib";


type PrismaUserID = { org_id_user_id: PK_User; };
export class UserRepo extends PrismaRepository<User, PK_User, keyof PrismaUserID> implements IUserRepository {
	protected override $ID(v: PK_User): { org_id_user_id: PK_User; } { return { org_id_user_id: v }; }
}
type PrismaUserCredsID = { org_id_user_id: PK_UserCredentials; };
export class UserCredentialsRepo extends PrismaRepository<UserCredentials, PK_UserCredentials, keyof PrismaUserCredsID>
	implements IUserCredentialsRepository {
	protected override $ID(v: PK_UserCredentials): PrismaUserCredsID { return { org_id_user_id: v }; }
}

type PrismaUserPermID = { org_id_resource_server_identifier_scope_value_user_id: PK_UserPermission; };
export class UserPermissionRepo
	extends PrismaRepository<UserPermission, PK_UserPermission, keyof PrismaUserPermID>
	implements IUserPermissionRepository {
	protected override $ID(v: PK_UserPermission): PrismaUserPermID {
		return { org_id_resource_server_identifier_scope_value_user_id: v };
	}
}
type PrismaUserRoleID = { org_id_role_identifier_user_id: PK_UserRole; };
export class UserRoleRepo
	extends PrismaRepository<UserRole, PK_UserRole, keyof PrismaUserRoleID>
	implements IUserRoleRepository {
	protected override $ID(v: PK_UserRole): PrismaUserRoleID {
		return { org_id_role_identifier_user_id: v };
	}
}

export class UserCredentialResolver implements IUserCredentialsResolver {
	constructor(private readonly $repo: Prisma.UserCredentialsDelegate) { }
	async get(input: UserCredentialsResolutionInput): Promise<UserCredentials | null> {
		if ((!input.email && !input.username) || (input.email && input.username)) {
			throw new BadRequestException(`input.email or input.username required`);
		}
		const found = await this.$repo.findFirst({
			where: {
				type: input.type,
				connection: input.connection,
				... (input.email ? { username: input.email } : { username: input.username }),
				revoked: false,
			}
		});
		return found ? found as UserCredentials : null;
	}
}