import { BusinessModel, Revokable } from "../../../../common";
import { TRefreshToken } from "./refresh-token.schema";

export class RefreshToken extends BusinessModel
    implements TRefreshToken, Revokable {
    org_id: string;
    client_id: string;
    subject: string;
    sid: string;
    jti: string;
    jti_access: string;
    refresh_token: string;
    expires: number;
    issued_at: number;
    revoked: boolean;
    revoked_at: Date | null;
}
export type PK_RefreshToken = Pick<RefreshToken, 'org_id' | 'jti'>;