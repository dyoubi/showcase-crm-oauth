import { createHash } from "crypto";
import { JweAlg, JweEncAlg, JwtSignAlg } from "./json-web-token";
import { JSONArray, JSONObject, JSONType, Primitive } from "./types";

export enum EPKCEMethod {
	S256 = 'S256',
	PLAIN = 'PLAIN',
}

export type PKCEMethod = `${EPKCEMethod}` | EPKCEMethod;

export enum EAuthorizationResponseType {
	CODE = 'code',
	ID_TOKEN = 'id_token',
	TOKEN = 'token',
	ID_TOKEN_TOKEN = 'id_token token',
}
export type AuthorizationResponseType = `${EAuthorizationResponseType}` | EAuthorizationResponseType;

export enum EAccessGrantType {
	USER_CREDENTIALS = 'username_password_credentials',
	AUTHORIZATION_CODE = 'authorization_code',
	REFRESH_TOKEN = 'refresh_token',
	CLIENT_CREDENTIALS = 'client_credentials',
}
export type AccessGrantType = `${EAccessGrantType}` | EAccessGrantType;
export enum ESubjectType {
	PUBLIC = 'public',
	PAIRWISE = 'pairwise',
}
export type SubjectType = `${ESubjectType}` | ESubjectType;

export enum ETokenType {
	BEARER = 'Bearer'
}
export type TokenType = `${ETokenType}` | ETokenType;

export enum EResponseMode {
	QUERY = 'query',
	FRAGMENT = 'fragment',
	FORM_POST = 'form_post',
}
export type ResponseMode = `${EResponseMode}` | EResponseMode;
export enum ETokenEndpointAuthMethod {
	CLIENT_SECRET_BASIC = 'client_secret_basic',
	CLIENT_SECRET_POST = 'client_secret_post',
	CLIENT_SECRET_JWT = 'client_secret_jwt',
	PRIVATE_JWT = 'private_key_jwt',
	TLS_CLIENT = 'tls_client_auth',
	SELF_TLS_CLIENT = 'self_signed_tls_client_auth',
}
export type TokenEndpointAuthMethod = `${ETokenEndpointAuthMethod}` | ETokenEndpointAuthMethod;

export interface AccessTokenResponse {
	access_token: string;
	id_token?: string;
	refresh_token?: string;
	token_type: TokenType;
	scope?: string;
	expires?: number;
}

export interface Profile {
	iss?: string;
	aud?: string | string[];
	sub?: string;
	iat?: number;
	exp?: number;
	scope?: string;
	nonce?: string;
	client_id?: string;
	name?: string;
	email?: string;
	username?: string;
	provider?: string;
	family_name?: string;
	given_name?: string;
	middle_name?: string;
	nickname?: string;
	preferred_username?: string;
	profile?: string;
	picture?: string;
	website?: string;
	gender?: string;
	birthdate?: string;
	zoneinfo?: string;
	locale?: string;
	updated_at?: number;
	[prop: string]: unknown;
}


export const OIDC_PERMISSIONS = ['openid', 'profile', 'email', 'offline_access'];

export interface JWTClaims extends Profile {
	iss: string;
	aud: string | string[];
	sub: string;
	exp: number;
	jti?: string;
}

export type ChallengeCodeIn = {
	pkce_method: PKCEMethod;
	code_challenge: string;
	code_verifier: string;
};

export function CodeChallenge(challenge: ChallengeCodeIn) {
	switch (challenge.pkce_method) {
		case 'S256':
			{
				return createHash('sha256')
					.update(challenge.code_verifier)
					.digest()
					.toString('base64url') === challenge.code_challenge;
			}
		case 'PLAIN': {
			return challenge.code_verifier == challenge.code_challenge;
		}
		default: { throw new Error(`pkce method ${challenge.pkce_method} not supported`); }
	}
}

export const DefaultScopes = ['openid', 'profile', 'offline_access', 'email'] as const;
const DefaultScopeValues = new Set<string>(DefaultScopes);
export function isDefaultScope(scope: string): scope is typeof DefaultScopes[number] {
	return DefaultScopeValues.has(scope);
}

/**
 * Champs REQUIS par OpenID Connect Discovery 1.0 (section 3).
 * Références: issuer, authorization_endpoint, token_endpoint, jwks_uri,
 * response_types_supported, subject_types_supported, id_token_signing_alg_values_supported.
 */
export interface OpenIDConfiguration {
	issuer: string;
	authorization_endpoint: string;
	token_endpoint: string;
	jwks_uri: string;
	response_types_supported: AuthorizationResponseType[];
	subject_types_supported: SubjectType[];
	id_token_signing_alg_values_supported: JwtSignAlg[];
	[type: string | symbol]: JSONType | undefined;
}

export interface OpenIDDiscovery extends OpenIDConfiguration {
	userinfo_endpoint?: string;
	registration_endpoint?: string;
	revocation_endpoint?: string;
	introspection_endpoint?: string;
	end_session_endpoint?: string; // OIDC RP-Initiated Logout

	grant_types_supported?: AccessGrantType[];
	scopes_supported?: string[];
	response_modes_supported?: ResponseMode[];
	token_endpoint_auth_methods_supported?: TokenEndpointAuthMethod[];
	token_endpoint_auth_signing_alg_values_supported?: JwtSignAlg[];

	// ID Token crypto (optionnel mais courant)
	id_token_encryption_alg_values_supported?: JweAlg[];
	id_token_encryption_enc_values_supported?: JweEncAlg[];

	// PKCE
	code_challenge_methods_supported?: PKCEMethod[];

	// Request/claims params
	request_parameter_supported?: boolean;
	request_uri_parameter_supported?: boolean;
	require_request_uri_registration?: boolean;
	claims_parameter_supported?: boolean;

	// Claims exposés
	claims_supported?: string[];

	// Divers (profil serveur)
	service_documentation?: string;
	ui_locales_supported?: string[];
	op_policy_uri?: string;
	op_tos_uri?: string;

	// Device & DPoP (si applicable)
	device_authorization_endpoint?: string;
	dpop_signing_alg_values_supported?: JwtSignAlg[];
}
