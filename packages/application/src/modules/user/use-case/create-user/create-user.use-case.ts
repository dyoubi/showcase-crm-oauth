import { ConflictException, inject, injectable, IUseCase, log, NotFoundException, Where } from "@egc-io/ckit-lib";
import {
	base64url,
	Database,
	DATABASE_REPO,
	DefaultCredentialEncryptionProvider,
	IDatabaseRepository,
	IInstanceRepository,
	Instance,
	INSTANCE_REPOSITORY,
	IUserCredentialsRepository,
	IUserRepository,
	PK_User,
	User,
	USER_CREDENTIALS_REPOSITORY,
	USER_REPOSITORY,
	UserCredentials,
	UserID,
} from "@ring-oauth/core";
import { errors } from "../../../../common/exception-helpers";

export type CreateUserIn = {
	org_id: string;
	connection: string;
	user:
	& Partial<Omit<User, keyof PK_User>>
	& {
		email: string;
		username: string;
	};
	credentials: Pick<UserCredentials, 'value' | 'type'>;
};
export type CreateUserOut = User;

@injectable()
export class CreateUserUseCase implements IUseCase<CreateUserIn, CreateUserOut> {
	constructor(
		@inject(USER_REPOSITORY)
		private readonly $users: IUserRepository,
		@inject(USER_CREDENTIALS_REPOSITORY)
		private readonly $creds: IUserCredentialsRepository,
		@inject(INSTANCE_REPOSITORY)
		private readonly $instanceRepo: IInstanceRepository,
		@inject(DATABASE_REPO)
		private $dbRepo: IDatabaseRepository,
	) { }

	async execute(input: CreateUserIn): Promise<CreateUserOut> {
		let count: number = 0;
		let instance: Instance | null;

		try {
			instance = await this.$instanceRepo.findOne({ where: { org_id: input.org_id } });
		} catch (error) {
			throw new Error(`cannot verify entity ${error.message}`);
		}

		if (!instance) {
			throw new NotFoundException(`instance not found`);
		}


		let user: User = Object.assign<User, Partial<User>>(new User(), {
			...input.user,
			org_id: input.org_id,
			connection: input.connection,
		});
		let user_id: string = UserID(input.org_id, input.connection, user.email);
		user.user_id = user_id;

		const where: Where<User>[] = [
			{
				org_id: input.org_id,
				user_id,
			},
			{
				org_id: input.org_id,
				connection: input.user.connection,
				email: input.user.email,
			}
		];

		if (input.user.username) {
			where.push({
				org_id: input.org_id,
				connection: input.connection,
				username: input.user.username,
			});
		}

		try {
			count = await this.$users.count({ where });
		} catch (error) {
			throw new Error(`cannot verify user ${error.message}`);
		}

		if (count > 0) {
			throw new ConflictException(`user duplicate`);
		}

		let database: Database;

		try {
			database = await this.$dbRepo.findById({ org_id: input.org_id, identifier: input.connection });
		} catch (error) {
			throw errors.datasource.exception('read', 'database');
		}

		try {
			if (user.metadata) {
				// @TODO: sanitize metadata
			}

			user = await this.$users.create(user);
		} catch (error) {
			throw new Error(`cannot create user ${error.message}`);
		}

		if (input.credentials) {

			try {
				const cred_value = base64url(DefaultCredentialEncryptionProvider(input.credentials.value, database.salt));
				const connection = String(user.connection);
				log.trace('connection', connection);
				await this.$creds.create({
					email: user.email,
					org_id: user.org_id,
					connection: connection,
					username: user.username,
					user_id: user.user_id,
					value: cred_value,
					type: input.credentials.type,
				});
			} catch (error) {
				log.warn(`user ${user.email} credential failure. flushing data ...`);
				try {
					await this.$users.deleteById(user);
				} catch (fatal) {
					log.error(`user ${user.email} error during data flushing : ${fatal.message}`);
				}
				throw new Error(`cannot create user ${error.message}`);
			}
		}
		return user;


	}

}