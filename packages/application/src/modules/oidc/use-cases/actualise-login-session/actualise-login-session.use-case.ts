import { inject, injectable, IUseCase, log } from "@egc-io/ckit-lib";
import {
    LOGIN_SESSION_REPOSITORY, ILoginSessionRepository, ACCESS_TOKEN_REPOSITORY,
    IAccessTokenRepository,
    LoginSession
} from "@ring-oauth/core";
import { errors } from "../../../../common/exception-helpers";

/**
 * Login Session actualisation inputs
 */
export type ActualiseLoginSessionUseCaseIn = {
    org: { org_id: string; };
    client: { client_id: string; };
    subject: string;
    sid: string;
};
/**
 * Remaining time before login_session expiration
 */
export type ActualiseLoginSessionUseCaseOut = number;


/**
 * Actualise the given login session and returns the remaining time.
 * 
 * If the login session expires, related access tokens and refresh tokens will be revoked
 * 
 * Returns 0 if the login session is revoked or expired
 */
@injectable()
export class ActualiseLoginSessionUseCase implements IUseCase<ActualiseLoginSessionUseCaseIn, ActualiseLoginSessionUseCaseOut> {
    constructor(
        @inject(LOGIN_SESSION_REPOSITORY)
        private $logins: ILoginSessionRepository,
        @inject(ACCESS_TOKEN_REPOSITORY)
        private $tokens: IAccessTokenRepository,
    ) { }

    async execute(input: ActualiseLoginSessionUseCaseIn): Promise<ActualiseLoginSessionUseCaseOut> {
        const now = Date.now() / 1000;
        let login: LoginSession | null = null;

        try {
            login = await this.$logins.findOne({
                where: {
                    org_id: input.org.org_id,
                    client_id: input.client.client_id,
                    sid: input.sid,
                },
                sort: { auth_time: 'DESC' }
            });
        } catch (error) {
            throw errors.datasource.exception('read', 'login_session', error);
        }

        if (!login) { return 0; }

        if (login.max_age <= now || login.revoked === true) {
            log.warn(`expired login session (max_age => ${login.max_age} , revoked => ${login.revoked} , revoked_at => ${login.revoked_at})`);
            try {
                await this.$tokens.update({ revoked: true, revoked_at: new Date() }, {
                    org_id: input.org.org_id,
                    client_id: input.client.client_id,
                    sid: input.sid,
                });
            } catch (error) {
                throw errors.datasource.exception('write', 'access_token', error);
            }
        }

        const pk = { org_id: input.org.org_id, sid: input.sid };
        let remains = login.max_age - now;
        const update: Partial<LoginSession> = remains <= 0 ?
            {
                last_active_time: now,
                revoked: true,
                revoked_at: new Date()
            }
            : { last_active_time: now, };
        try {
            await this.$logins.updateById(pk, update);
        } catch (error) {
            throw errors.datasource.exception('write', 'login_session', error);
        }

        return 0;
    }
}
