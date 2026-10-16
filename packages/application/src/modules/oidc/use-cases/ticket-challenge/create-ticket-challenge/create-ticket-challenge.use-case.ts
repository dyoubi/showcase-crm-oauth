import { inject, injectable, IUseCase } from "@egc-io/ckit-lib";
import {
    EJwtSignAlg, formats, IInstanceJwtPairRepository, INSTANCE_JWT_PAIR_REPOSITORY, InstanceJwtPair,
    ITicketChallengeRepository, JwtSigner, seconds, TICKET_CHALLENGE_REPOSITORY, TicketChallenge, TicketUsage
} from "@ring-oauth/core";
import { randomBytes } from "crypto";

export type CreateTicketChallengeIn = {
    org_id: string;
    usage: TicketUsage;
    user: {
        user_id: string;
        connection: string;
        username: string;
        email: string;
    };
    ttl: number;
    redirect_uri: string;
};
export type CreateTicketChallengeOut = { ticket: TicketChallenge, token: string; };
const signer = new JwtSigner();

@injectable()
export class CreateTicketChallengeUseCase implements IUseCase<CreateTicketChallengeIn, CreateTicketChallengeOut> {
    constructor(
        @inject(INSTANCE_JWT_PAIR_REPOSITORY)
        private $jwks: IInstanceJwtPairRepository,
        @inject(TICKET_CHALLENGE_REPOSITORY)
        private $tickets: ITicketChallengeRepository,
    ) { }

    async execute(input: CreateTicketChallengeIn): Promise<CreateTicketChallengeOut> {
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
        const tid = randomBytes(16).toString('base64url');
        const expires = now + input.ttl;
        const issued_at = now;


        const iss = formats.urn.urn('org', input.org_id, 'auth');
        const aud = formats.urn.urn('org', input.org_id, 'auth');
        const kid = jwk.kid;
        const jti = randomBytes(16).toString('base64url');

        const secret = randomBytes(16).toString('base64url');
        const token = await signer.sign({
            iss, aud, jti, tid,
            iat: issued_at,
            exp: expires,
            usage: input.usage,
        }, jwk);

        let ticket = Object.assign<TicketChallenge, TicketChallenge>(new TicketChallenge(), {
            org_id: input.org_id,
            tid, cid: '',
            jti, kid,
            usage: input.usage,
            redirect_uri: input.redirect_uri,
            secret,
            connection: input.user.connection,
            user_id: input.user.user_id, // we don't know the user yet
            expires, issued_at, revoked: false
        });

        ticket = await this.$tickets.create(ticket);

        return { ticket, token };
    }
}
