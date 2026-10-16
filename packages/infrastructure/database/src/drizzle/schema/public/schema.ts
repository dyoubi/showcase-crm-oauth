import { pgEnum } from "drizzle-orm/pg-core";

export const AccessGrantType = pgEnum('AccessGrantType', ['authorization_code', 'client_credentials', 'refresh_token', 'username_password_credentials']);
export const ClientType = pgEnum('ClientType', ['regular', 'single_page', 'native_app', 'backend']);
export const UserAction = pgEnum('UserAction', ['REGISTER', 'AUTHENTICATE', 'RESET_PASSWORD']);
export const CredentialType = pgEnum('CredentialType', ['TOKEN', 'PASSWORD']);
export const PKCEMethod = pgEnum('PKCEMethod', ['S256', 'PLAIN']);
export const JwtSignAlg = pgEnum('JwtSignAlg', ['RS256', 'RS384', 'RS512', 'PS256', 'PS384', 'PS512', 'ES256', 'ES384', 'ES512']);
export const Kty = pgEnum('Kty', ['RSA', 'EC', 'OKP']);
export const JWTUse = pgEnum('JWTUse', ['sig', 'enc']);

export const TemplateUsage = pgEnum('TemplateUsage', ['verification_email_link', 'verification_email_code', 'welcome_email', 'change_password_email_link', 'change_password_email_code', 'blocked_account_email', 'code_verification_email_mfa_email', 'user_invitation_email']);
export const BinaryTheme = pgEnum('BinaryTheme', ['light', 'dark']);

