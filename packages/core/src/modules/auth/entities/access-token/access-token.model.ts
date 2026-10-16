import { BusinessModel, Revokable } from "../../../../common";
import { TAccessToken } from "./access-token.schema";

export class AccessToken extends BusinessModel implements TAccessToken, Revokable {
    org_id: string;
    jti: string;
    sid: string;
    client_id: string;
    subject: string;
    access_token: string;
    expires: number;
    issued_at: number;
    audience: string;
    ip?: string | null;
    user_agent?: string | null;
    revoked: boolean;
    revoked_at: Date | null;
}

export type PK_AccessToken = Pick<AccessToken, 'org_id' | 'jti'>;