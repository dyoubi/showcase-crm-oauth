import { inject, injectable, IUseCase } from "@egc-io/ckit-lib";
import {
    CLIENT_REPOSITORY, EJwtSignAlg, formats, IClientRepository,
    IInstanceJwtPairRepository, INSTANCE_JWT_PAIR_REPOSITORY,
    InstanceJwtPair, JwtSigner, LoginHint, seconds,
    TicketUsage
} from "@ring-oauth/core";
import { randomBytes } from "crypto";

export type CreateChallengeRequestUseCaseIn = {
    org_id: string;
    client: { client_id: string; };
    redirect_uri: string;
    usage: TicketUsage;
    login_hint?: LoginHint;
    connection: string;
};
export type CreateChallengeRequestUseCaseOut = { token: string; };

const signer = new JwtSigner();

@injectable()
export class CreateChallengeRequestUseCase implements IUseCase<CreateChallengeRequestUseCaseIn, CreateChallengeRequestUseCaseOut> {
    constructor(
        @inject(CLIENT_REPOSITORY)
        private $clients: IClientRepository,
        @inject(INSTANCE_JWT_PAIR_REPOSITORY)
        private $jwks: IInstanceJwtPairRepository,
    ) { }

    async execute(input: CreateChallengeRequestUseCaseIn): Promise<CreateChallengeRequestUseCaseOut> {
        let jwk: InstanceJwtPair | null;
        try {
            jwk = await this.$jwks.findOne({
                where: {
                    org_id: input.org_id,
                    alg: EJwtSignAlg.ES256,
                    use: 'sig',
                    revoked: { neq: true },
                },
                sort: { not_before: 'ASC' }
            });
        } catch (error) {
            throw new ReferenceError(`cannot find json web key pair`);
        }

        if (!jwk) { throw new ReferenceError(`cannot find json web key pair`); }
        const now = seconds();
        const expires = now + (60 * 5);
        const issued_at = now;

        const iss = formats.urn.urn('org', input.org_id, 'auth');
        const aud = formats.urn.urn('org', input.org_id, 'con', input.connection);
        const sub = input.login_hint?.email;
        const kid = jwk.kid;
        const jti = randomBytes(16).toString('base64url');

        const token = await signer.sign({
            iss, aud, jti, kid, sub,
            iat: issued_at,
            exp: expires,
            cid: input.client.client_id,
            usage: input.usage,
            connection: input.connection,
            login_hint: input.login_hint?.email,
            redirect_uri: input.redirect_uri,
        }, jwk);

        return { token };
    }
}
