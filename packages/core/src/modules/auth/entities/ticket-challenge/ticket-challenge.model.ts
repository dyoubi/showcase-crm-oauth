import { TicketUsage } from "../../types";
import { TicketChallengeType } from "./ticket-challenge.schema";

export class TicketChallenge implements TicketChallengeType {
    org_id: string;
    tid: string;
    jti: string;
    cid: string;
    kid: string;
    usage: TicketUsage;
    redirect_uri: string;
    user_id?: string;
    connection: string;
    app_sid?: string | null;
    secret: string;
    issued_at: number;
    expires: number;
    revoked?: boolean | null;
    revoked_at?: Date | null;
}

export type PK_TicketChallengeSession = Pick<TicketChallenge, 'org_id' | 'tid'>;