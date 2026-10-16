import { ITicketChallengeRepository, PK_TicketChallengeSession, TicketChallenge } from "@ring-oauth/core";
import { PrismaRepository } from "../common/repository";

type TicketChallengeSessionID = { org_id_tid: PK_TicketChallengeSession; };
export class TickerChallengeRepo extends PrismaRepository<TicketChallenge, PK_TicketChallengeSession, keyof TicketChallengeSessionID> implements ITicketChallengeRepository {
	protected override $ID(org_id_tid: PK_TicketChallengeSession): { org_id_tid: PK_TicketChallengeSession; } {
		return { org_id_tid };
	}

}