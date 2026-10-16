import { BadRequestException, inject, injectable, IUseCase, log } from "@egc-io/ckit-lib";
import {
    ACCESS_TOKEN_REPOSITORY,
    Client,
    CLIENT_REPOSITORY,
    EJwkUse,
    ETokenType,
    IAccessTokenRepository,
    IClientRepository,
    IInstanceJwtPairRepository,
    ILoginSessionRepository,
    INSTANCE_JWT_PAIR_REPOSITORY,
    IRefreshTokenRepository,
    ISSUER_URL_PROVIDER,
    IURLProvider,
    JwtDecoder, JwtSignAlg, JwtSigner,
    LOGIN_SESSION_REPOSITORY,
    REFRESH_TOKEN_REPOSITORY,
    seconds
} from "@ring-oauth/core";
import { randomBytes } from "crypto";
import { errors } from "../../../../common/exception-helpers";

export type RefreshTokenUseCaseIn = {
    org: { org_id: string; };
    refresh_token: string;
};
export type RefreshTokenUseCaseOut = {};

const signer: JwtSigner = new JwtSigner();
const decoder: JwtDecoder = new JwtDecoder();

/**
 * Create a new access token from the refresh token. Invalidate the previous token & update the login session
 * Fail if the token is not valid or not found.
 */
@injectable()
export class RefreshTokenUseCase implements IUseCase<RefreshTokenUseCaseIn, RefreshTokenUseCaseOut> {
    constructor(
        @inject(REFRESH_TOKEN_REPOSITORY)
        private $refreshes: IRefreshTokenRepository,
        @inject(ACCESS_TOKEN_REPOSITORY)
        private $tokens: IAccessTokenRepository,
        @inject(CLIENT_REPOSITORY)
        private $clients: IClientRepository,
        @inject(LOGIN_SESSION_REPOSITORY)
        private readonly $session: ILoginSessionRepository,
        @inject(INSTANCE_JWT_PAIR_REPOSITORY)
        private $jwks: IInstanceJwtPairRepository,
        @inject(ISSUER_URL_PROVIDER)
        private $issuer: IURLProvider,
    ) { }

    async execute(input: RefreshTokenUseCaseIn): Promise<RefreshTokenUseCaseOut> {
        const now = seconds();

        const { header: rtHeader, claims: rtClaims } = await decoder.decode(input.refresh_token);
        const rtAlg: JwtSignAlg = rtHeader.alg as JwtSignAlg ?? 'ES256';
        const kid: string | undefined = rtHeader.kid ? String(rtHeader.kid) : undefined;

        if (!kid) {
            log.error(`refresh_token kid is null`);
            throw new BadRequestException(`invalid_token`);
        }

        let jwks = await this.$jwks.findOne({
            where: {
                org_id: input.org.org_id,
                kid: kid, alg: rtAlg, use: EJwkUse.SIG,
            },
        });

        if (!jwks) {
            log.error(`unknown siging key ${kid}`);
            throw new BadRequestException(`invalid_request`);
        }

        try {
            await decoder.verify(input.refresh_token, jwks);
        } catch (error) {
            log.trace(`token verification failure ${error.message}`);
            throw new BadRequestException(`invalid_token`);
        }


        const rtJti = rtClaims.jti;
        if (!rtJti) {
            throw new BadRequestException(`invalid_request`);
        }

        const refreshToken = await this.$refreshes.findOne({
            where: {
                org_id: input.org.org_id,
                jti: rtJti,
                revoked: false
            }
        });

        if (!refreshToken) {
            log.error(`not an active refresh token ${input.refresh_token}`);
            throw new BadRequestException(`invalid_request`);
        }

        const sid = refreshToken.sid;
        let count;

        try {
            count = await this.$session.count({
                where: {
                    org_id: input.org.org_id,
                    sid,
                    client_id: refreshToken.client_id,
                    revoked: false,
                }
            });
        } catch (error) {
            throw errors.datasource.exception('read', 'login_session');
        }
        if (count < 1) {
            throw new BadRequestException('session_expired');
        }


        const accessToken = await this.$tokens.findById({ org_id: input.org.org_id, jti: refreshToken.jti_access });
        let client: Client;
        try {
            client = await this.$clients.findById({ org_id: input.org.org_id, client_id: accessToken.client_id });
        } catch (error) {
            throw errors.datasource.exception('read', 'client');
        }

        let { claims, header } = await decoder.decode(accessToken.access_token);
        const jti_token = randomBytes(32).toString('base64url');
        const jti_refresh = randomBytes(32).toString('base64url');
        const expires_token = now + client.id_token_expiration;
        const expires_refresh = now + client.refresh_token_expiration;


        claims = Object.assign(claims, { iat: now, exp: expires_token, jti: jti_token });
        const access_token = await signer.sign(claims, jwks);

        claims = Object.assign(claims, { iat: now, exp: expires_refresh, jti: jti_refresh });
        const refresh_token = await signer.sign(claims, jwks);

        const revoke = { revoked: true, revoked_at: new Date() };
        try {
            await this.$tokens.update(revoke, {
                org_id: input.org.org_id,
                sid,
                jti: { neq: jti_token }
            });
        } catch (error) {
            throw errors.datasource.exception('write', 'access_token', error);
        }

        try {
            await this.$refreshes.update(revoke, {
                org_id: input.org.org_id,
                sid,
                jti: { neq: jti_refresh }
            });
        } catch (error) {
            throw errors.datasource.exception('write', 'refresh_token', error);
        }


        try {
            await this.$tokens.create({
                ...accessToken,
                access_token,
                expires: expires_token,
                issued_at: now,
                jti: jti_token,
                revoked: false,
                revoked_at: null,
            });
        } catch (error) {
            throw errors.datasource.exception('write', 'access_token', error);
        }

        try {
            await this.$refreshes.create({
                ...refreshToken,
                jti: jti_refresh,
                jti_access: jti_token,
                refresh_token,
                expires: expires_token,
                issued_at: now,
                revoked: false,
                revoked_at: null,
            });
        } catch (error) {
            throw errors.datasource.exception('write', 'refresh_token', error);
        }

        return {
            access_token,
            token_type: ETokenType.BEARER,
            refresh_token,
            expires: expires_token,
        };
    }
}
