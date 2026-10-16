import { BadRequestException, inject, injectable, IUseCase } from "@egc-io/ckit-lib";
import {
    EJwkUse, IInstanceJwtPairRepository, INSTANCE_JWT_PAIR_REPOSITORY,
    JwtClaims, JwtDecoder, JwtHeader,
    LoginHint,
    TicketUsage
} from "@ring-oauth/core";

export type ValidateChallengeRequestUseCaseIn = {
    org_id: string;
    token: string;
};
export type ValidateChallengeRequestUseCaseOut = {
    cid: string;
    connection: string;
    redirect_uri: string;
    usage: TicketUsage;
    login_hint?: LoginHint;
};


const decoder = new JwtDecoder();

@injectable()
export class ValidateChallengeRequestUseCase implements IUseCase<ValidateChallengeRequestUseCaseIn, ValidateChallengeRequestUseCaseOut> {
    constructor(
        @inject(INSTANCE_JWT_PAIR_REPOSITORY)
        private readonly $jwks: IInstanceJwtPairRepository,
    ) { }

    async execute(input: ValidateChallengeRequestUseCaseIn): Promise<ValidateChallengeRequestUseCaseOut> {
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

        if (!jwk) { throw new BadRequestException(`invalid_token`); }

        try {
            const { header } = await decoder.verify(input.token, jwk);
        } catch (error) {
            throw new BadRequestException(`invalid_token`);
        }

        const cid: string = String(claims.cid);
        const usage: TicketUsage = String(claims.usage) as TicketUsage;
        const connection: string = String(claims.connection);
        const email: string | undefined = claims.login_hint ? String(claims.login_hint) : undefined;
        const redirect_uri: string = String(claims.redirect_uri);
        return {
            cid, usage, connection,
            login_hint: email ? { email } : undefined,
            redirect_uri
        };
    }
}
