import { BadRequestException, inject, injectable, IUseCase } from "@egc-io/ckit-lib";
import {
    EJwkUse,
    IInstanceJwtPairRepository,
    INSTANCE_JWT_PAIR_REPOSITORY, ITicketChallengeRepository, JwtClaims, JwtDecoder,
    JwtHeader,
    TICKET_CHALLENGE_REPOSITORY, TicketChallenge
} from "@ring-oauth/core";

export type ValidateChallengeTokenUseCaseIn = {
    org_id: string;
    token: string;
};
export type ValidateChallengeTokenUseCaseOut = TicketChallenge | null;

const decoder = new JwtDecoder();

@injectable()
export class ValidateChallengeTokenUseCase implements IUseCase<ValidateChallengeTokenUseCaseIn, ValidateChallengeTokenUseCaseOut> {
    constructor(
        @inject(INSTANCE_JWT_PAIR_REPOSITORY)
        private readonly $jwks: IInstanceJwtPairRepository,
        @inject(TICKET_CHALLENGE_REPOSITORY)
        private $tickets: ITicketChallengeRepository,
    ) { }

    async execute(input: ValidateChallengeTokenUseCaseIn): Promise<ValidateChallengeTokenUseCaseOut> {
        let kid: string | undefined = undefined;
        let alg: string | undefined = undefined;
        let claims: JwtClaims;
        let header: JwtHeader;
        try {
            const res = await decoder.decode(input.token);
            claims = res.claims;
            header = res.header;
        } catch (error) {
            throw new BadRequestException(`invalid_token`);
        }

        if (!header.kid || !header.alg) {
            throw new BadRequestException(`invalid_token`);
        }

        let jwk;
        jwk = await this.$jwks.findOne({
            where: {
                org_id: input.org_id,
                kid, alg, use: EJwkUse.SIG,
            }
        });

        if (!jwk) {
            throw new BadRequestException(`invalid_token`);
        }

        try {
            const { header } = await decoder.verify(input.token, jwk);
        } catch (error) {
            throw new BadRequestException(`invalid_token`);
        }

        if (!claims.tid) {
            throw new BadRequestException(`invalid_token`);
        }

        const tid = String(claims.tid);

        let ticket = await this.$tickets.findOne({
            where: {
                org_id: input.org_id,
                tid,
            }
        });

        return ticket;
    }
}
