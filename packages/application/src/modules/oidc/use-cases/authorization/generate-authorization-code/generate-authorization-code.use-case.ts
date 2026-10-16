import { BadRequestException, inject, injectable, IUseCase } from "@egc-io/ckit-lib";
import {
    CLIENT_REPOSITORY,
    CODE_AUTHORIZATION_TABLE, GRANT_SESSION_STORE,
    Client, GrantSession,
    IAuthorizationCodeProvider, IClientRepository,
    ICodeAuthorizationTable, IGrantSessionStore,
    User,
    DefaultCodeProvider,
    AppSession,
    APP_SESSION_TABLE,
    IAppSessionTable,
    seconds
} from "@ring-oauth/core";
import { isPromise } from "util/types";

export type GenerateAuthorizationCodeUseCaseIn = {
    grant_session: GrantSession;
    user: Pick<User,
        | 'user_id'
        | 'connection'
        | 'email'
        | 'username'
    >;
    user_agent?: string;
    ip?: string;
    app_sid?: string;
};
export type GenerateAuthorizationCodeUseCaseOut = {
    code: string;
};

/**
 * Generate a new authorization code for the grant session
 */
@injectable()
export class GenerateAuthorizationCodeUseCase
    implements IUseCase<GenerateAuthorizationCodeUseCaseIn, GenerateAuthorizationCodeUseCaseOut> {
    private readonly $provider: IAuthorizationCodeProvider = new DefaultCodeProvider();
    constructor(
        @inject(CODE_AUTHORIZATION_TABLE)
        private readonly $codes: ICodeAuthorizationTable,
        @inject(GRANT_SESSION_STORE)
        private readonly $grants: IGrantSessionStore,
        @inject(CLIENT_REPOSITORY)
        private readonly $clients: IClientRepository,
        @inject(APP_SESSION_TABLE)
        private readonly $sids: IAppSessionTable,
    ) {

    }
    async execute(input: GenerateAuthorizationCodeUseCaseIn): Promise<GenerateAuthorizationCodeUseCaseOut> {
        let code = this.$provider.get({
            org_id: input.grant_session.org_id,
            client_id: input.grant_session.client_id,
            grant_id: input.grant_session.grant_id,
        });

        code = isPromise(code) ? await code : code;
        const urn_grant = {
            org_id: input.grant_session.org_id,
            client_id: input.grant_session.client_id,
            grant_id: input.grant_session.grant_id,
        };
        const pk_client = {
            org_id: input.grant_session.org_id,
            client_id: input.grant_session.client_id,
        };
        let client: Client | null;
        try {
            client = await this.$clients.findOne({
                where: pk_client
            });
        } catch (error) {
            throw new BadRequestException(`unauthorized_client`);
        }

        let grant_session: GrantSession | null;
        try {
            grant_session = await this.$grants.pull(urn_grant);
        } catch (error) {
            throw new BadRequestException(`authorization_failure`);
        }

        if (!grant_session) {
            throw new BadRequestException(`authorization_failure`);
        }

        try {
            const expires_at = Date.now() + 1000 * 60 * 2; // 2 min TTL
            await this.$codes.push({
                org_id: grant_session.org_id,
                client_id: grant_session.client_id,
                grant_id: grant_session.grant_id,
                code,
                expires_at,
                status: 'pending',
                user_id: input.user.user_id,
                email: input.user.email,
                connection: input.user.connection,
                user_agent: input.user_agent,
                ip: input.ip,
                app_sid: input.app_sid,
            });
        } catch (error) {
            throw new BadRequestException(`authorization_failure`);
        }

        return { code };
    }
}
