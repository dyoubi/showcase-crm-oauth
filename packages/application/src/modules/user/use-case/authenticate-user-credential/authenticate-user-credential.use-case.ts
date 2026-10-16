import { inject, injectable, IUseCase, SystemException, Where } from "@egc-io/ckit-lib";
import {
	base64url,
	CredentialType, Database, DATABASE_REPO,
	DefaultCredentialEncryptionProvider,
	ECredentialType,
	IDatabaseRepository,
	IUserCredentialsRepository,
	IUserRepository,
	User,
	USER_CREDENTIALS_REPOSITORY,
	USER_REPOSITORY,
	UserCredentials
} from "@ring-oauth/core";
import { errors } from "../../../../common/exception-helpers";

export type ValidateCredentialIn = {
	org_id: string;
	connection: string;
	credentials: Pick<UserCredentials,
		| 'type'
		| 'value'
	> & { email?: string; username?: string; };
};

export type ValidateCredentialOut = User | null;

@injectable()
export class AuthenticateUserCredentialsUseCase implements IUseCase<ValidateCredentialIn, ValidateCredentialOut> {
	constructor(
		@inject(USER_CREDENTIALS_REPOSITORY)
		private $credsRepo: IUserCredentialsRepository,
		@inject(USER_REPOSITORY)
		private $userRepo: IUserRepository,
		@inject(DATABASE_REPO)
		private $dbRepo: IDatabaseRepository,
	) { }

	async execute(input: ValidateCredentialIn): Promise<ValidateCredentialOut> {
		let value: string;
		let database: Database;

		try {
			database = await this.$dbRepo.findById({ org_id: input.org_id, identifier: input.connection });
		} catch (error) {
			throw errors.datasource.exception('read', 'database');
		}


		if (input.credentials.type === ECredentialType.PASSWORD) {
			const hash = DefaultCredentialEncryptionProvider(input.credentials.value, database.salt);
			value = base64url(hash);
		} else {
			value = input.credentials.value;
		}

		let where: Where<UserCredentials> = {
			value,
			org_id: input.org_id,
			connection: input.connection,
			revoked: false,
		};

		if (input.credentials.email?.length) {
			where.email = input.credentials.email;
		} else if (input.credentials.username?.length) {
			where.email = input.credentials.username;
		}
		else {
			throw new Error(`invalid_credentials`);
		}

		let credentials: UserCredentials | null;
		try {
			credentials = await this.$credsRepo.findOne({ where });
		} catch (error) {
			throw new SystemException(`repository operation failure : ${error.message}`);
		}

		if (!credentials) { return null; }

		try {
			let user: User = await this.$userRepo.findById({
				org_id: input.org_id,
				user_id: credentials.user_id,
			});
			return user;
		} catch (error) {
			throw errors.datasource.exception('read', 'user');
		}
	}

}