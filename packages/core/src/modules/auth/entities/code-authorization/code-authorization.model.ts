export enum ECodeAuthorizationStatus {
	PENDING = 'pending',
	ISSUED = 'issued',
	REVOKED = 'revoked',
	EXPIRED = 'expired',
}

export type CodeAuthorizationStatus = `${ECodeAuthorizationStatus}` | ECodeAuthorizationStatus;

export class CodeAuthorization {
	org_id: string;
	client_id: string;
	grant_id: string;
	code: string;
	user_id: string;
	email: string;
	connection: string;
	expires_at: number;
	status: CodeAuthorizationStatus;
	user_agent?: string;
	ip?: string;
	app_sid?: string;
}
export type PK_CodeAuthorization = Pick<CodeAuthorization, 'org_id' | 'client_id' | 'code'>;