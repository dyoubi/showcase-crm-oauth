import { inject, injectable, IUseCase, NotFoundException, Where } from "@egc-io/ckit-lib";
import {
    base64url, CredentialType, Database, DATABASE_REPO, DefaultCredentialEncryptionProvider,
    IDatabaseRepository, IUserCredentialsRepository,
    IUserRepository, User,
    USER_CREDENTIALS_REPOSITORY, USER_REPOSITORY,
    UserCredentials
} from "@ring-oauth/core";

import { errors } from "../../../../common/exception-helpers";

export type UpateUserCredentialsUseCaseIn = {
    org_id: string;
    credentials: {
        email: string;
        connection: string;
        value: string;
        type: CredentialType;
    };
};
export type UpateUserCredentialsUseCaseOut = void;

@injectable()
export class UpateUserCredentialsUseCase implements IUseCase<UpateUserCredentialsUseCaseIn, UpateUserCredentialsUseCaseOut> {
    constructor(
        @inject(USER_REPOSITORY)
        private readonly $users: IUserRepository,
        @inject(USER_CREDENTIALS_REPOSITORY)
        private readonly $creds: IUserCredentialsRepository,
        @inject(DATABASE_REPO)
        private $dbRepo: IDatabaseRepository,
    ) { }

    async execute(input: UpateUserCredentialsUseCaseIn): Promise<UpateUserCredentialsUseCaseOut> {
        let database: Database;

        try {
            database = await this.$dbRepo.findById({ org_id: input.org_id, identifier: input.credentials.connection });
        } catch (error) {
            throw errors.datasource.exception('read', 'database');
        }

        let user: User | null;
        user = await this.$users.findOne({
            where: {
                org_id: input.org_id,
                connection: input.credentials.connection,
                email: input.credentials.email,
            },
            fields: ['org_id', 'user_id', 'username', 'connection', 'email']
        });

        if (!user) {
            throw new NotFoundException(`user not found`);
        }

        const hash = DefaultCredentialEncryptionProvider(input.credentials.value, database.salt);
        const value = base64url(hash);

        const where: Where<UserCredentials> = {
            org_id: input.org_id,
            user_id: user.user_id,
            connection: user.connection,
            type: input.credentials.type
        };

        let count = await this.$creds.count({
            where: {
                ...where,
                value,
            }
        });
        if (count) { return; }

        await this.$creds.update({ revoked: true, revoked_at: new Date() }, {
            org_id: input.org_id,
            user_id: user.user_id,
            connection: user.connection,
            type: input.credentials.type
        });

        await this.$creds.create({
            org_id: user.org_id,
            connection: input.credentials.connection,
            user_id: user.user_id,
            email: input.credentials.email,
            username: user.username,
            type: input.credentials.type,
            value,
            revoked: false,
            revoked_at: null,
        });

    }
}
