import { BadRequestException, IUseCase, inject, injectable, log } from "@egc-io/ckit-lib";
import {
    APP_SESSION_TABLE, IAppSessionTable, INSTANCE_JWT_PAIR_REPOSITORY,
    IInstanceJwtPairRepository, AppSession, AppSessionType, InstanceJwtPair,
    formats, IJwtSigner, JwtSigner
} from "@ring-oauth/core";
import { randomBytes } from "crypto";
import { APP_SESSION_EXPIRATION } from "../ttl";

export type RotateAppSessionUseCaseIn = {
    session: AppSession;
};
export type RotateAppSessionUseCaseOut = { session: AppSession, token: string; };

const signer: IJwtSigner = new JwtSigner();

/**
 * Create a new session from the current one. 
 * Delete the previous session and returns the new session with a new token and same sid
 */
@injectable()
export class RotateAppSessionUseCase implements IUseCase<RotateAppSessionUseCaseIn, RotateAppSessionUseCaseOut> {
    constructor(
        @inject(APP_SESSION_TABLE)
        private readonly $table: IAppSessionTable,
        @inject(INSTANCE_JWT_PAIR_REPOSITORY)
        private readonly $pairs: IInstanceJwtPairRepository,
    ) { }

    async execute(input: RotateAppSessionUseCaseIn): Promise<RotateAppSessionUseCaseOut> {
        if (!AppSessionType(input.session)) { throw new TypeError(`not a valid app session`); }
        const now = Date.now() / 1000;

        let rotate = await this.$table.pull({
            org_id: input.session.org_id,
            sid: input.session.sid,
        });

        if (!rotate) {
            log.error(`no session found`);
            throw new ReferenceError(`invalid_session`);
        }

        if (rotate.jti !== input.session.jti ||
            rotate.kid !== input.session.kid
        ) {
            log.error(`session missmatch (session => ${JSON.stringify(rotate)}, input => ${JSON.stringify(input.session)})`);
            throw new ReferenceError(`invalid_session`);
        }

        if (rotate.expires_at <= now) {
            throw new BadRequestException(`session_expired`);
        }

        let jwks: InstanceJwtPair | null = null;
        try {
            jwks = await this.$pairs.findById({
                org_id: input.session.org_id,
                kid: input.session.kid,
            });
        } catch (error) {
            throw ReferenceError(`cannot provide required json web key pair: ${error.message}`);
        }

        jwks = await this.$pairs.findById({
            org_id: input.session.org_id,
            kid: input.session.kid,
        });

        // reuse the same session id
        const sid = rotate.sid;
        const aud = `${formats.urn.urn(`org`, input.session.org_id, 'app')}`;

        // generate a new token id
        const jti = `app:${randomBytes(16).toString('base64url')}`;


        // keep first issue timestamp for session datation
        const issued_at = rotate.issued_at;

        // update expiration time

        /**
         * @TODO configure correctly app session expiration time
         */
        const expires_at = now + APP_SESSION_EXPIRATION;

        // generate fresh token
        const token = await signer.sign({
            aud,
            iat: issued_at,
            exp: expires_at,
            sid,
            jti,
        }, jwks);

        // update session data
        const session: AppSession = Object.assign<AppSession, AppSessionType>(
            new AppSession(),
            {
                ...input.session,
                org_id: input.session.org_id,
                sid,
                jti,
                kid: jwks.kid,
                expires_at,
                issued_at,
                last_seen_at: now,
            },
        );

        // delete previous session & create the new one
        await this.$table.pop(input.session);
        await this.$table.push(session);

        return { session, token, };
    }
}
