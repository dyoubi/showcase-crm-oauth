import { inject, injectable, IUseCase } from "@egc-io/ckit-lib";
import { APP_SESSION_TABLE, AppSession, AppSessionType, EJwkUse, EJwtSignAlg, formats, IAppSessionTable, IInstanceJwtPairRepository, IJwtSigner, INSTANCE_JWT_PAIR_REPOSITORY, InstanceJwtPair, JwtClaims, JwtSigner } from "@ring-oauth/core";
import { randomBytes } from "crypto";
import { APP_SESSION_EXPIRATION } from "../ttl";

export type CreateAppSessionUseCaseIn = {
    org_id: string;
    session: {
        ip: string;
        user_agent: string;
        origin: string;
        action?: 'login' | 'registration' | 'password-reset';
        user_id?: string;
        connection?: string;
    };
};
export type CreateAppSessionUseCaseOut = { token: string, session: AppSession; };

const signer: IJwtSigner = new JwtSigner();

/**
 * Create a new session with the provided user_agent informations
 */
@injectable()
export class CreateAppSessionUseCase implements IUseCase<CreateAppSessionUseCaseIn, CreateAppSessionUseCaseOut> {
    constructor(
        @inject(APP_SESSION_TABLE)
        private readonly $table: IAppSessionTable,
        @inject(INSTANCE_JWT_PAIR_REPOSITORY)
        private readonly $pairs: IInstanceJwtPairRepository,
    ) { }

    async execute(input: CreateAppSessionUseCaseIn): Promise<CreateAppSessionUseCaseOut> {
        // if (!AppSessionType(input.session)) { throw new TypeError(`not a valid app session`); }

        const now = Date.now() / 1000;

        let jwks: InstanceJwtPair | null = null;

        jwks = await this.$pairs.findOne({
            where: {
                org_id: input.org_id,
                alg: EJwtSignAlg.ES256,
                use: EJwkUse.SIG,
                revoked: false,
            },
            sort: { not_before: 'ASC' }
        });

        if (!jwks) {
            throw ReferenceError(`cannot provide required json web key pair`);
        }

        const sid = randomBytes(16).toString('base64url');
        const aud = `${formats.urn.urn(`org`, input.org_id, 'app')}`;
        const jti = `app:${randomBytes(16).toString('base64url')}`;
        const issued_at = now;

        /**
        * @TODO configure correctly app session expiration time
        */
        const expires_at = now + APP_SESSION_EXPIRATION;
        const token = await signer.sign({
            aud,
            iat: issued_at,
            exp: expires_at,
            sid,
            jti,
        }, jwks);

        const session: AppSession = Object.assign<AppSession, AppSessionType>(
            new AppSession(),
            {
                ...input.session,
                org_id: input.org_id,
                sid,
                jti,
                kid: jwks.kid,
                expires_at,
                issued_at,
                last_seen_at: now,
            },
        );

        await this.$table.push(session);
        return {
            token,
            session,
        };
    }
}
