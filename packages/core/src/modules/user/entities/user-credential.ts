import { IRepository } from "@egc-io/ckit-lib";
import { BusinessModel, Revokable } from "../../../common";

export enum ECredentialType {
	TOKEN = 'TOKEN',
	PASSWORD = 'PASSWORD'
}
export type CredentialType = `${ECredentialType}` | ECredentialType;

export class UserCredentials extends BusinessModel implements Revokable {
	org_id: string;
	user_id: string;
	connection: string;
	email: string;
	username: string | null;
	type: CredentialType;
	value: string;
	revoked: boolean;
	revoked_at: Date | null;
	expires_at: Date | null;
}
export type PK_UserCredentials = Pick<UserCredentials, `org_id` | 'user_id'>;
export type IUserCredentialsRepository = IRepository<UserCredentials, PK_UserCredentials>;
export const USER_CREDENTIALS_REPOSITORY = Symbol("USER_CREDENTIALS_REPOSITORY");

export type UserCredentialsResolutionInput =
	& { org_id: string; }
	& Pick<UserCredentials, 'connection' | 'type'>
	& { email?: string; username?: string; salt: string; };

/**
 * Get Identity Credentials if any
 */
export type IUserCredentialsResolver = {
	get(query: UserCredentialsResolutionInput): Promise<UserCredentials | null>;
};
export const USER_CREDENTIALS_RESOLVER = Symbol("USER_CREDENTIALS_RESOLVER");