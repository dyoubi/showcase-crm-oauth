import { CodeRequest } from "../../interface/client-code-request";

export class PushAuthorizationSession {
    org_id: string;
    client_id: string;
    request: CodeRequest;
    request_uri: string;
    issued?: boolean;
    issued_at?: number | null;
    expires_at: number;
}
export type PK_PushAuthorizationSession = Pick<PushAuthorizationSession, 'org_id' | 'client_id' | 'request_uri'>;