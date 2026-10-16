import { inject, injectable, IUseCase, UnprocessableEntityException } from "@egc-io/ckit-lib";
import {
    ACCESS_TOKEN_REPOSITORY, LOGIN_SESSION_REPOSITORY, REFRESH_TOKEN_REPOSITORY,
    JwtClaims, JwtSigner, TokenType,
    IAccessTokenRepository, ILoginSessionRepository,
    IRefreshTokenRepository,
    Instance, LoginSession,
    PrivateClaims,
    formats, HalfHash,
    Revokable,
    CLIENT_REPOSITORY,
    IClientRepository,
    RefreshToken,
    ResourceServer,
    INSTANCE_JWT_PAIR_REPOSITORY,
    IInstanceJwtPairRepository,
    EJwkUse,
    JwtSignAlg,
    ISSUER_URL_PROVIDER,
    IURLProvider,
    seconds,
} from "@ring-oauth/core";
import { randomBytes } from "crypto";
import { errors } from "../../../../common/exception-helpers";

export type GenerateAccessTokenUseCaseIn = {
    org: Pick<Instance, 'org_id'>,
    client: {
        client_id: string;
    };
    resource_server: Pick<ResourceServer,
        | 'identifier'
        | 'access_token_life_time'
        | 'jwt_signing_algorithm'
    >;
    session: LoginSession,
    scope: string;
    at_hash?: boolean;
    c_hash?: { authorization_code: string; };
    private_claims?: PrivateClaims;
};
export type GenerateAccessTokenUseCaseOut = {
    access_token: string;
    token_type: TokenType;
    expires: number;
    id_token: string;
    refresh_token: string;
};

export const signer = new JwtSigner();
/**
 * Generate a new ccess token for the provided request. If login exists, the is updated otherwise a new one is created
 */
@injectable()
export class GenerateAccessTokenUseCase implements IUseCase<GenerateAccessTokenUseCaseIn, GenerateAccessTokenUseCaseOut> {
    constructor(
        @inject(CLIENT_REPOSITORY)
        private $clients: IClientRepository,
        @inject(LOGIN_SESSION_REPOSITORY)
        private $logins: ILoginSessionRepository,
        @inject(ACCESS_TOKEN_REPOSITORY)
        private $tokens: IAccessTokenRepository,
        @inject(REFRESH_TOKEN_REPOSITORY)
        private $refresh: IRefreshTokenRepository,
        @inject(INSTANCE_JWT_PAIR_REPOSITORY)
        private $jwks: IInstanceJwtPairRepository,
        @inject(ISSUER_URL_PROVIDER)
        private $issuer: IURLProvider,
    ) { }

    async execute(input: GenerateAccessTokenUseCaseIn): Promise<GenerateAccessTokenUseCaseOut> {
        const now = seconds();
        let session: LoginSession | null = input.session;

        let sigpair = await this.$jwks.findOne({
            where: {
                org_id: input.org.org_id,
                alg: input.resource_server.jwt_signing_algorithm,
                use: EJwkUse.SIG,
            },
        });

        if (!sigpair) {
            throw new UnprocessableEntityException(`cannot provide siging algorithm ${input.resource_server.jwt_signing_algorithm}`);
        }

        const issuer = await this.$issuer.get(input.org.org_id).toString();
        const client = await this.$clients.findById({ org_id: input.org.org_id, client_id: session.client_id });
        const client_urn: string = `ringoauth:${formats.urn.urn('org', input.org.org_id), 'client', client.client_id}`;
        const subject: string = session.subject;
        const audience_urn: string = `ringoauth:${formats.urn.urn('org', input.org.org_id, 'rs', input.resource_server.identifier)}`;

        const private_claims = Object.fromEntries(
            input.private_claims ?
                (Object.keys(input.private_claims) as (keyof PrivateClaims)[])
                    .map(v => [v, input.private_claims![v]]) :
                []
        );

        // set server as issuer
        let iss = issuer;
        // user is the subject
        let sub = subject;
        // set target api audience
        let aud = audience_urn;
        // add azp client_id
        let azp = client_urn;
        // generate jti
        let jti = randomBytes(32).toString('base64url');
        const exp = Math.ceil(now + input.resource_server.access_token_life_time); // set 1h access token
        const iat = now;

        const access_claims = {
            iss, sub, aud, exp,
            iat, jti, azp,
            sid: session.sid,
            scope: input.scope,
        };
        // could be hashed

        let access_token: string;

        try {
            access_token = await signer.sign(access_claims, sigpair);
        } catch (error) {
            throw error;
        }

        const id_token_expires = Math.ceil((now + client.id_token_expiration));
        const id_token_jti = randomBytes(32).toString('base64url');
        const id_claims: JwtClaims = {
            /**
             * Private claims for internal processes
             */
            ...private_claims,
            scope: input.scope,
            client_id: session.client_id,
            /**
             * standard claims
             */
            iss, sub,
            aud: client_urn,
            sid: session.sid,
            jti: id_token_jti,
            exp: id_token_expires,
            iat: now,
        };

        if (input.at_hash) { id_claims['at_hash'] = HalfHash(access_token, sigpair.alg as JwtSignAlg); }
        if (input.c_hash) { id_claims['c_hash'] = HalfHash(input.c_hash.authorization_code, sigpair.alg as JwtSignAlg); }

        const id_token = await signer.sign(id_claims, sigpair);

        const refresh_expires = Math.ceil(now + client.refresh_token_expiration);
        const refresh_claim = {
            iss, sub,
            aud: client_urn,
            exp: refresh_expires,
            iat, azp,
            sid: session.sid,
            jti: randomBytes(32).toString('base64url'),
        };
        const refresh_token = await signer.sign(refresh_claim, sigpair);

        // persist new tokens, revoke previous ones

        const common = {
            org_id: input.org.org_id,
            client_id: client.client_id,
            subject,
            sid: session.sid,
        };
        const revoke: Revokable = {
            revoked: true,
            revoked_at: new Date(),
        };

        try {
            const accessTokenData = {
                ...common,
                audience: access_claims.aud,
                jti: access_claims.jti,
                access_token,
                expires: access_claims.exp,
                issued_at: access_claims.iat,
                ip: private_claims.user_ip ? private_claims.user_ip as string : '',
                user_agent: private_claims.user_agent ? private_claims.user_agent as string : '',
            };

            await this.$tokens.create(accessTokenData);
        } catch (error) {
            throw errors.datasource.exception('write', 'access_token', error);
        }

        try {
            const refreshTokenData: Partial<RefreshToken> = {
                ...common,
                jti: refresh_claim.jti,
                jti_access: access_claims.jti,
                refresh_token,
                expires: refresh_claim.exp,
                issued_at: refresh_claim.iat,

            };
            await this.$refresh.create(refreshTokenData);
        } catch (error) {
            throw errors.datasource.exception('write', 'refresh_token', error);
        }

        try {
            // revoke previous tokens
            await this.$tokens.update(revoke, {
                org_id: input.org.org_id,
                sid: session.sid,
                jti: { neq: access_claims.jti }
            },);

            await this.$refresh.update(revoke, {
                org_id: input.org.org_id,
                sid: session.sid,
                jti: { neq: refresh_claim.jti },
            });

        } catch (error) {
            throw errors.datasource.exception('write', 'refresh_token', error);
        }

        try {
            await this.$logins.updateById({ org_id: session.org_id, sid: session.sid }, { last_active_time: now });
        } catch (error) {
            throw errors.datasource.exception('write', 'login_session', error);
        }

        return {
            access_token,
            token_type: 'Bearer',
            expires: access_claims.exp,
            id_token,
            refresh_token,
        };
    }
}
