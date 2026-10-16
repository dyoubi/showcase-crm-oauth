
export enum ETemplateUsage {
	VERIFICATION_EMAIL_LINK = 'verification_email_link',
	VERIFICATION_EMAIL_CODE = 'verification_email_code',
	WELCOME_EMAIL = 'welcome_email',
	CHANGE_PASSWORD_EMAIL_LINK = 'change_password_email_link',
	CHANGE_PASSWORD_EMAIL_CODE = 'change_password_email_code',
	BLOCKED_ACCOUNT_EMAIL = 'blocked_account_email',
	CODE_VERIFICATION_EMAIL_MFA_EMAIL = 'code_verification_email_mfa_email',
	USER_INVITATION_EMAIL = 'user_invitation_email',
}

export type TemplateUsage = `${ETemplateUsage}` | ETemplateUsage;