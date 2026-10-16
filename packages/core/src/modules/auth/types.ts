export interface UserAuthentication {
	org_id: string;
	user_id: string;
	connection: string;
}

export type LoginHint = { email: string; username?: string; } | { email?: string; username: string; };
export function LoginHint(value: any): value is LoginHint {
	return (
		typeof value === 'object' &&
		(
			(value.email !== undefined && typeof value.email === 'string') ||
			(value.username !== undefined && typeof value.username === 'string')
		)
	);
}
export type UserClaim = `user_${string}`;
export type ClientClaim = `client_${string}`;

export type PrivateClaims = { [claim: UserClaim | ClientClaim]: string | string[] | null | undefined; };

export enum ETicketUsage {
	PASSWORD_RESET = 'password-reset',
	EMAIL_VALIDATION = 'email-validation',
	DELETE_ACCOUNT = 'delete-account',
}
export type TicketUsage = `${ETicketUsage}` | ETicketUsage;

export enum EResetMode {
	MFA = 'mfa',
	SMS = 'sms',
	EMAIL = 'email'
}

export type ResetMode = `${EResetMode}` | EResetMode;