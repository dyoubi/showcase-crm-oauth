import { inject, injectable, IUseCase } from "@egc-io/ckit-lib";
import { ITicketChallengeRepository, TICKET_CHALLENGE_REPOSITORY } from "@ring-oauth/core";

export type RevokeTicketUseCaseIn = { org_id: string; tid: string; };
export type RevokeTicketUseCaseOut = void;

@injectable()
export class RevokeTicketUseCase implements IUseCase<RevokeTicketUseCaseIn, RevokeTicketUseCaseOut> {
    constructor(
        @inject(TICKET_CHALLENGE_REPOSITORY)
        private $tickets: ITicketChallengeRepository
    ) { }

    async execute(input: RevokeTicketUseCaseIn): Promise<RevokeTicketUseCaseOut> {
        const pk = { org_id: input.org_id, tid: input.tid, };
        let count = await this.$tickets.count({ where: pk });
        if (count) {
            await this.$tickets.updateById(pk, { revoked: true, revoked_at: new Date() });
        }
        return;
    }
}
