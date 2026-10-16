import { inject, injectable, IUseCase, NotFoundException } from "@egc-io/ckit-lib";
import {
    DefaultScopes, EAccessGrantType, EAuthorizationResponseType, EJwkUse,
    EPKCEMethod, ESubjectType, HOSTNAME_PROVIDER, IHostnameProvider,
    IInstanceJwtPairRepository, IInstanceRepository, Instance,
    INSTANCE_JWT_PAIR_REPOSITORY, INSTANCE_REPOSITORY, InstanceJwtPair,
    ISSUER_URL_PROVIDER, IURLProvider, JweAlg,
    JweEncAlg, JwtSignAlg,
    OpenIDDiscovery, PublicKeyFieldsList, PublicKeyFileds
} from "@ring-oauth/core";

export type OpenIdConfigurationUseCaseIn = {
    org_id: string;
};
export type OpenIdConfigurationUseCaseOut = OpenIDDiscovery;


@injectable()
export class OpenIdConfigurationUseCase implements IUseCase<OpenIdConfigurationUseCaseIn, OpenIdConfigurationUseCaseOut> {
    constructor(
        @inject(INSTANCE_JWT_PAIR_REPOSITORY)
        private readonly $jwks: IInstanceJwtPairRepository,
        @inject(INSTANCE_REPOSITORY)
        private readonly $orgs: IInstanceRepository,
        @inject(HOSTNAME_PROVIDER)
        private readonly $hostname: IHostnameProvider,
        @inject(ISSUER_URL_PROVIDER)
        private readonly $issuer: IURLProvider,
    ) { }

    async execute(input: OpenIdConfigurationUseCaseIn): Promise<OpenIdConfigurationUseCaseOut> {

        let org: Instance | null;
        org = await this.$orgs.findOne({ where: { org_id: input.org_id } });


        if (!org) { throw new NotFoundException(`instance not found`); }

        let sigs: Pick<InstanceJwtPair, PublicKeyFileds>[];
        sigs = await this.$jwks.find({
            where: {
                org_id: input.org_id,
                use: EJwkUse.SIG,
                revoked: false,
            },
            fields: [...PublicKeyFieldsList]
        });
        const sigAlgs = new Set<JwtSignAlg>(sigs.map(jwk => jwk.pub.alg as JwtSignAlg));


        let encs: Pick<InstanceJwtPair, PublicKeyFileds>[];
        encs = await this.$jwks.find({
            where: {
                org_id: input.org_id,
                use: EJwkUse.ENC,
                revoked: false,
            },
            fields: [...PublicKeyFieldsList]
        });
        const jweAlgs = new Set<JweAlg>(encs.map(jwk => jwk.pub.alg as JweAlg));
        const jweEncs = new Set<JweEncAlg>(encs.map(jwk => jwk.pub.enc as JweEncAlg));

        const issuer = this.$issuer.get(input.org_id).toString();
        const tokenEndpoint = new URL(issuer);
        tokenEndpoint.pathname = '/token';
        const authorizationEndpoint = new URL(issuer);
        authorizationEndpoint.pathname = '/authorization';
        const jwksEndpoint = new URL(issuer);
        jwksEndpoint.pathname = '/.well-known/jwks.json';
        const userInfoEndpoint = new URL(issuer);
        userInfoEndpoint.pathname = '/userinfo';
        const introspectEndpoint = new URL(issuer);
        introspectEndpoint.pathname = '/introspect';
        return {
            issuer,
            token_endpoint: tokenEndpoint.toString(),
            authorization_endpoint: authorizationEndpoint.toString(),
            jwks_uri: jwksEndpoint.toString(),
            userinfo_endpoint: userInfoEndpoint.toString(),
            introspection_endpoint: introspectEndpoint.toString(),
            scopes_supported: [...DefaultScopes],
            response_types_supported: Object.values(EAuthorizationResponseType),
            grant_types_supported: Object.values(EAccessGrantType),
            id_token_signing_alg_values_supported: Array.from(sigAlgs.values()),
            id_token_encryption_alg_values_supported: Array.from<JweAlg>(jweAlgs.values()),
            id_token_encryption_enc_values_supported: Array.from<JweEncAlg>(jweEncs.values()),
            token_endpoint_auth_signing_alg_values_supported: Array.from(sigAlgs.values()),
            subject_types_supported: Object.values(ESubjectType),
            code_challenge_methods_supported: Object.values(EPKCEMethod),
            token_endpoint_auth_methods_supported: ['client_secret_basic', 'client_secret_post'],
            response_modes_supported: ['form_post', 'query'],
            claims_supported: ['iss', 'sub', 'aud', 'exp', 'iat', 'azp', 'client_id', 'scope',
                'user_email', 'user_id', 'user_username', 'user_ua', 'user_ip'
            ]
        };
    }
}
