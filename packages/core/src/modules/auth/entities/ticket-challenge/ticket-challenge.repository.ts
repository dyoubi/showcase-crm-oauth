import { IRepository } from "@egc-io/ckit-lib";
import { ITable } from "../../../../common";
import { PK_TicketChallengeSession, TicketChallenge } from "./ticket-challenge.model";

export type ITicketChallengeSessionTable = ITable<TicketChallenge, PK_TicketChallengeSession> & {
	user(org_id: string, user: { connection: string, user_id: string; }): Promise<PK_TicketChallengeSession[]>;
};
export const TICKET_CHALLENGE_SESSION_TABLE: symbol = Symbol("TICKET_CHALLENGE_SESSION_TABLE");

export type ITicketChallengeRepository = IRepository<TicketChallenge, PK_TicketChallengeSession>;
export const TICKET_CHALLENGE_REPOSITORY: symbol = Symbol("TICKET_CHALLENGE_REPOSITORY");