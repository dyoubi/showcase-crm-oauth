import { BadRequestException, inject, injectable, IUseCase, log } from "@egc-io/ckit-lib";
import {
    CLIENT_SIGNING_KEY_REPOSITORY, ClientSigningKey,
    CodeRequest,
    formats,
    IClientSigningKeyRepository, IJwtDecoder, JwtDecoder,
    JwtSignAlg,
    Kty
} from "@ring-oauth/core";

export type DecodeJarUseCaseIn = {
    org_id: string;
    jar: string;
};
export type DecodeJarUseCaseOut = CodeRequest;

const decoder: IJwtDecoder = new JwtDecoder();
/**
 * Decode a JAR token. Fails if the token cannot be decoded or invalid
 */
@injectable()
export class DecodeJarUseCase implements IUseCase<DecodeJarUseCaseIn, DecodeJarUseCaseOut> {
    constructor(
        @inject(CLIENT_SIGNING_KEY_REPOSITORY)
        private readonly $jwks: IClientSigningKeyRepository
    ) { }

    async execute(input: DecodeJarUseCaseIn): Promise<DecodeJarUseCaseOut> {

        let jwk: ClientSigningKey | null = null;;

        const { claims, header } = await decoder.decode(input.jar);
        const kid = header.kid ? String(header.kid) : undefined;
        const alg = header.alg ? String(header.alg) as JwtSignAlg : undefined;

        if (!kid || !alg) {
            throw new BadRequestException(`invalid_token`);
        }

        jwk = await this.$jwks.findOne({
            where: {
                org_id: input.org_id,
                kid,
            }
        });

        if (!jwk) {
            throw new BadRequestException(`unauthorized_client`);
        }

        try {
            await decoder.verify(input.jar, {
                kid,
                alg,
                pub: jwk.jwk,
                kty: jwk.kty as Kty,
                priv: {},
                thumbprint: '',
                use: 'sig'
            });
        } catch (error) {
            log.trace(`token verification failure ${error.message}`);
            throw new BadRequestException(`invalid_token`);
        }

        if (!claims.jti) {
            log.error(`JAR token require a valid unique jti`);
            throw new BadRequestException(`invalid_token`);
        }

        if (claims.aud !== formats.urn.urn('ringoauth', 'iss', 'org', input.org_id)) {
            /**
             * @TODO enforce strict aud claim politics
             */
            log.warn(`No token claims audience restriction politic`);
        }

        const request = {
            client_id: claims.client_id,
            audience: claims.audience,
            connection: claims.connection,
            login_hint: claims.login_hint,
            scope: claims.scope,
            response_type: claims.response_type,
            prompts: claims.prompts,
            code_challenge: claims.code_challenge,
            pkce_method: claims.pkce_method,
            redirect_uri: claims.redirect_uri,
            state: claims.state,
            nonce: claims.nonce,
            authorization_details: claims.authorization_details,
        };

        if (CodeRequest(request)) {
            log.error(`invalid request claims ${JSON.stringify(request)}`);
            throw new BadRequestException(`invalid_request`);
        }

        if (request.client_id) {
            if (request.client_id !== jwk.client_id) {
                log.error(`client_id missmatch (request => ${request.client_id}, jwk => ${jwk.client_id})`);
                throw new BadRequestException(`unauthorized_client`);
            }
        }

        request.client_id = jwk.client_id;

        return request as CodeRequest;
    }
}
