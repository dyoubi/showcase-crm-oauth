import { JsonWebKey } from "node:crypto";
import { EAccessGrantType, BusinessModel, RandomAlphaNumID, PKCEMethod, EPKCEMethod } from "../../../../common";
import { JsonWebKeyPair } from "../../../../common/json-web-token";

export function ClientID() { return `ct_${RandomAlphaNumID(16)}`; }
export function ClientSecret() { return `${RandomAlphaNumID(24)}`; }

export enum ClientType {
	SSR = 'regular',
	CSR = 'single_page',
	NATIVE = 'native_app',
	BACKEND = 'backend',
}

export const DefaultClientGrantType: Readonly<EAccessGrantType[]> = [
	EAccessGrantType.AUTHORIZATION_CODE,
	EAccessGrantType.CLIENT_CREDENTIALS,
	EAccessGrantType.REFRESH_TOKEN,
] as const;

export const DefaultIdTokenExpiration: Readonly<number> = 3600;
export const DefaultRefreshTokenExpiration: Readonly<number> = 2_592_000;
export const DefaultLogoutTokenExpiration: Readonly<number> = 320;
export const DefaultInactiveTimeLimit: Readonly<number> = 86_400;

export class Client extends BusinessModel {
	org_id: string;
	client_id: string;
	name: string;
	logo_uri?: string;
	type: ClientType = ClientType.SSR;
	secret: string;
	use_pkce: boolean = true;
	pkce_method: PKCEMethod = EPKCEMethod.S256;
	allow_implicit: boolean = false;
	login_url: string = '';
	allowed_callback_urls: string[] = [];
	allowed_logout_urls: string[] = [];
	allowed_web_origins: string[] = [];
	grant_types: EAccessGrantType[] = [];
	id_token_expiration: number = 3600;
	logout_token_expiration: number = 320;
	refresh_token_expiration: number = 2592000;
	inactive_time_limit?: number | null = null;
	token_sender_constraining: boolean = false;
	backchannel_logout_uri?: string | null;
	jwks: JsonWebKeyPair;
	request_object_signing_key: JsonWebKey;
	labels?: string[] | null = [];
	internal?: boolean | null = false;
}
export type PK_Client = Pick<Client, 'org_id' | 'client_id'>;

