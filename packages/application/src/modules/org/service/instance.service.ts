import { inject, injectable, Query, QueryWhere, SystemException } from "@egc-io/ckit-lib";
import {
	RESOURCE_SERVER_REPO,
	CLIENT_REPOSITORY, IClientRepository, IResourceServerRepository,
	NewInstance, Instance, EAccessGrantType,
	ClientType, Client, ResourceServer,
	USER_REPOSITORY, Database, DATABASE_REPO, IDatabaseRepository,
	IUserRepository, User, IRoleRepository, ROLE_REPOSITORY,
	Role, Permission,
	CredentialType,
	utils,
	UserAction,
	EPKCEMethod,
	ECredentialType,
	EUserAction,
} from "@ring-oauth/core";

import { org } from "../constant";
import {
	CreateInstanceUseCase, CreateClientUseCase,
	CreateResourceServerUseCase, CreatePermissionUseCase, CreateRoleUseCase,
	CreateDatabaseUseCase, CreateUserRoleUseCase, DeleteInstanceUseCase,
	AddClientPermissions,
	RemoveClientPermissions,
	CreateConnectionUseCase,
	DeleteConnectionUseCase
} from "../use-case";
import { CreateUserUseCase } from "../../user";

function defaultClient() {
	return Object.assign<Client, Partial<Client>>(new Client(), {
		grant_types: [
			EAccessGrantType.AUTHORIZATION_CODE,
			EAccessGrantType.CLIENT_CREDENTIALS,
			EAccessGrantType.REFRESH_TOKEN,
		],
		pkce_method: EPKCEMethod.S256,
		use_pkce: true,
		type: ClientType.CSR,
		allow_implicit: false,
		allowed_callback_urls: ['http://localhost'],
		allowed_logout_urls: ['http://localhost/logout'],
		allowed_web_origins: ['http://localhost'],
		token_sender_constraining: false
	});
}

@injectable()
export class InstanceService {
	constructor(
		@inject(CreateInstanceUseCase) private readonly $createInstance: CreateInstanceUseCase,
		@inject(CreateClientUseCase) private readonly $createClient: CreateClientUseCase,
		@inject(CreateResourceServerUseCase) private readonly $createRS: CreateResourceServerUseCase,
		@inject(CreatePermissionUseCase) private readonly $createPerm: CreatePermissionUseCase,
		@inject(CreateRoleUseCase) private readonly $createRole: CreateRoleUseCase,
		@inject(CreateDatabaseUseCase) private readonly $createDB: CreateDatabaseUseCase,
		@inject(CreateConnectionUseCase) private readonly $createConn: CreateConnectionUseCase,
		@inject(CreateUserUseCase) private readonly $createUser: CreateUserUseCase,
		@inject(CreateUserRoleUseCase) private readonly $createUserRole: CreateUserRoleUseCase,
		@inject(AddClientPermissions) private readonly $clientPermAdd: AddClientPermissions,

		@inject(USER_REPOSITORY) private readonly $userRepo: IUserRepository,
		@inject(DATABASE_REPO) private readonly $databasesRepo: IDatabaseRepository,
		@inject(CLIENT_REPOSITORY) private readonly $clientsRepo: IClientRepository,
		@inject(RESOURCE_SERVER_REPO) private readonly $rsRepo: IResourceServerRepository,
		@inject(ROLE_REPOSITORY) private readonly $roleRepo: IRoleRepository,

		@inject(DeleteInstanceUseCase)
		private readonly $deleteInstance: DeleteInstanceUseCase,
	) { }

	async new(input: NewInstance): Promise<Instance> {
		const instance = await this.$createInstance.execute(input);
		const adminPermList = org.admin.scope_values.map(v => ({ scope_value: v }));

		let database: Database;
		let user: User;
		let rs: ResourceServer;
		let client: Client;
		let permisionList: Permission[];
		let role: Role;

		try {
			database = await this.$createDB.execute({
				database: { name: 'default-user-database' },
				org_id: instance.org_id,
			});

			user = await this.$createUser.execute({
				connection: database.identifier,
				org_id: instance.org_id,
				user: {
					...utils.omit(input.user, 'password'),
				},
				credentials: { value: input.user.password, type: ECredentialType.PASSWORD }
			});



			rs = await this.$createRS.execute({
				org_id: instance.org_id,
				resource_server: {
					name: 'ring-oauth Management API',
					identifier: `https://${instance.org_id}.auth.egamingchain.io/`,
				}
			});

			permisionList = await this.$createPerm.execute({
				org_id: instance.org_id,
				resource_server_identifier: rs.identifier,
				scope: adminPermList
			});

			role = await this.$createRole.execute({
				org_id: instance.org_id,
				role: {
					identifier: 'admin',
					name: 'Admin',
					internal: true,
					permissions: permisionList.map(
						p => ({
							resource_server_identifier: p.resource_server_identifier,
							scope_value: p.scope_value,
						})
					)
				}
			});

			await this.$createUserRole.execute({
				org_id: instance.org_id,
				role_identifier: role.identifier,
				user: user
			});

			client = await this.$createClient.execute({
				org_id: instance.org_id,
				client: {
					...defaultClient(),
					name: 'Dashboard',
				}
			});

			await this.$createConn.execute({
				org_id: instance.org_id,
				connection: {
					client_id: client.client_id,
					database_identifier: database.identifier,
					enable: true,
					allow_actions: [
						EUserAction.AUTHENTICATE,
						EUserAction.REGISTER,
						EUserAction.RESET_PASSWORD,
					],
				}
			});

			await this.$clientPermAdd.execute({
				org_id: instance.org_id,
				client_id: client.client_id,
				permissions: permisionList.map(perm => ({
					resource_server_identifier: perm.resource_server_identifier,
					scope_value: perm.scope_value,
				})),
			});

		} catch (error) {
			try {
				await this.$deleteInstance.execute(instance);
			} catch (error) {
				console.error(error.message);
			}
			throw new SystemException(error.message);
		}

		return instance;
	}

	async databases(org_id: string, filters?: Query<Database>) {
		const databaseList = await this.$databasesRepo.find({
			sort: { created_at: 'ASC' },
			fields: ['identifier', 'name'],
			...filters,
			where: { org_id, },
		});
		return databaseList;
	}

	async clients(org_id: string, filters?: Query<Client>) {
		const clientList = await this.$clientsRepo.find({
			sort: { created_at: 'ASC' },
			fields: ['client_id', 'name', 'type'],
			...filters,
			where: { org_id, },
		});
		return clientList;
	}

	async apis(org_id: string, filters?: Query<ResourceServer>) {
		const rsList = await this.$rsRepo.find({
			sort: { created_at: 'ASC' },
			fields: ['name', 'identifier'],
			...filters,
			where: { org_id, },
		});
		return rsList;
	}

	async users(org_id: string, filters?: QueryWhere<Omit<User, 'org_id'>>) {
		const userList = await this.$userRepo.find({
			sort: { created_at: 'DESC' },
			fields: ['user_id', 'connection', 'email', 'name'],
			...filters,
			where: {
				org_id,
				...filters?.where
			},
		});
		return userList;
	}

	async roles(org_id: string, filters?: QueryWhere<Omit<Role, 'org_id'>>) {
		const roleList = await this.$roleRepo.find({
			sort: { created_at: 'DESC' },
			fields: ['identifier', 'name'],
			...filters,
			where: {
				org_id,
				...filters?.where
			},
		});
		return roleList;
	}
}