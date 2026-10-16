import { inject, injectable, IUseCase } from "@egc-io/ckit-lib";
import { ILoginSessionRepository, LOGIN_SESSION_REPOSITORY, LoginSession } from "@ring-oauth/core";
import { errors } from "../../../../common/exception-helpers";
import { randomBytes } from "crypto";

/**
 * @TODO create a settings at instance or client level for MAX_AGE
 */
const MAX_AGE = 60 * 60 * 24;

export type GetLoginSessionUseCaseIn = {
    org: { org_id: string; },
    client: { client_id: string; };
    subject: string;
    audience: string;
    scope: string;
    app_sid?: string;
};

export type GetLoginSessionUseCaseOut = LoginSession;

/**
 * Fetch the active login session for the given user. 
 * 
 * Creates a new login session if no active found
 */
@injectable()
export class GetLoginSessionUseCase implements IUseCase<GetLoginSessionUseCaseIn, GetLoginSessionUseCaseOut> {
    constructor(
        @inject(LOGIN_SESSION_REPOSITORY)
        private readonly $logins: ILoginSessionRepository,
    ) { }

    async execute(input: GetLoginSessionUseCaseIn): Promise<GetLoginSessionUseCaseOut> {
        const now = Date.now() / 1_000;
        let login: LoginSession | null = null;
        try {
            login = await this.$logins.findOne({
                where: {
                    org_id: input.org.org_id,
                    client_id: input.client.client_id,
                    subject: input.subject,
                    audience: input.audience,
                    scope: input.scope,
                    revoked: false,
                    app_sid: input.app_sid
                }
            });
        } catch (error) {
            throw errors.datasource.exception('read', 'login_session', error);
        }

        if (login) {
            return login;
        }

        try {
            login = await this.$logins.create({
                org_id: input.org.org_id,
                sid: randomBytes(32).toString('base64url'),
                client_id: input.client.client_id,
                subject: input.subject,
                auth_time: now,
                last_active_time: now,
                max_age: MAX_AGE,
                revoked: false,
                audience: input.audience,
                scope: input.scope,
                app_sid: input.app_sid
            });
            return login;
        } catch (error) {
            throw errors.datasource.exception('write', 'login_session', error);
        }
    }
}
