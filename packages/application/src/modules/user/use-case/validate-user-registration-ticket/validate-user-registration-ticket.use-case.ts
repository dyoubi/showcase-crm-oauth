import { BadRequestException, inject, injectable, IUseCase, log } from "@egc-io/ckit-lib";
import {
    IInstanceJwtPairRepository, INSTANCE_JWT_PAIR_REPOSITORY,
    InstanceJwtPair,
    IUserRegistrationTicketTable, JwtDecoder,
    USER_REGISTRATION_TICKET_TABLE,
    UserRegistrationTicket
} from "@ring-oauth/core";

export type ValidateUserRegistrationTicketIn = {
    org_id: string;
    jti: string;
};
export type ValidateUserRegistrationTicketOut = UserRegistrationTicket | false;

const decoder = new JwtDecoder();

@injectable()
export class ValidateUserRegistrationTicketUseCase
    implements IUseCase<ValidateUserRegistrationTicketIn, ValidateUserRegistrationTicketOut> {
    constructor(
        @inject(USER_REGISTRATION_TICKET_TABLE)
        private readonly $table: IUserRegistrationTicketTable,
        @inject(INSTANCE_JWT_PAIR_REPOSITORY)
        private readonly $jwks: IInstanceJwtPairRepository,
    ) { }

    async execute(input: ValidateUserRegistrationTicketIn): Promise<ValidateUserRegistrationTicketOut> {
        const ticket = await this.$table.pull({ org_id: input.org_id, jti: input.jti });

        if (!ticket) {
            return false;
        }

        const jwt = ticket.jwt;
        let jwk: InstanceJwtPair | null = null;
        try {
            const { header } = await decoder.decode(jwt);
            if (!header.kid) { throw new BadRequestException(`invalid header : kid missing`); }

            jwk = await this.$jwks.findOne({
                where: {
                    org_id: input.org_id,
                    kid: header.kid
                }
            });
        } catch (error) {
            log.trace(`invalid ticket : ${error.message}`);
            return false;
        }

        if (!jwk) { throw new BadRequestException(`invalid_ticket`); }

        try {
            await decoder.verify(jwt, jwk);
        } catch (error) {
            log.trace(`invalid ticket : ${error.message}`);
            return false;
        }

        return ticket;
    }
}
