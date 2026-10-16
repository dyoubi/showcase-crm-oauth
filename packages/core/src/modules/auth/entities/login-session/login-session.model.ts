import { BusinessModel, Revokable } from "../../../../common";
import { TLoginSession } from "./login-session.schema";

export class LoginSession extends BusinessModel implements TLoginSession, Revokable {
    org_id: string;
    sid: string;
    client_id: string;
    subject: string;
    audience: string;
    scope: string;
    app_sid?: string | null;
    auth_time: number;
    last_active_time: number;
    max_age: number;
    revoked: boolean;
    revoked_at: Date | null;
}
export type PK_LoginSession = Pick<LoginSession, 'org_id' | 'sid'>;