import { PK_PushAuthorizationSession, PushAuthorizationSession } from "./push-authorization-session.model";

export type IPushAuthorizationSessionTable = {
	push(data: PushAuthorizationSession): Promise<void>;
	pull(pk: PK_PushAuthorizationSession): Promise<PushAuthorizationSession | null>;
	pop(pk: PK_PushAuthorizationSession): Promise<void>;
	has(pk: PK_PushAuthorizationSession): Promise<boolean>;
};
export const PUSH_AUTHORIZATION_SESSION_TABLE: symbol = Symbol("PUSH_AUTHORIZATION_SESSION_TABLE");
