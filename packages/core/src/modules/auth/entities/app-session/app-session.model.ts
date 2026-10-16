import { AppSessionType } from "./app-session.schema";

export class AppSession implements AppSessionType {
    org_id: string;
    sid: string;
    jti: string;
    kid: string;
    user_agent: string;
    ip: string;
    last_seen_at: number;
    expires_at: number;
    issued_at: number;
    user_id?: string | null;
    connection?: string | null | undefined;
    action?: string | undefined;
}
export type PK_AppSession = Pick<AppSession, 'org_id' | 'sid'>;