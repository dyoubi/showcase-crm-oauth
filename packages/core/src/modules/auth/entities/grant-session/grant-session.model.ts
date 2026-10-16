import { AuthorizationResponseType, PKCEMethod } from "../../../../common";
import { AuthorizationDetails } from "../../interface/authorization-details";

export enum EGrantSessionStatus {
	PENDING = 'pending',
	ISSUED = 'issued',
	REVOKED = 'revoked',
	EXPIRED = 'expired',
};
export type GrantSessionStatus = `${EGrantSessionStatus}` | EGrantSessionStatus;
export class GrantSession {
	org_id: string;
	client_id!: string;
	/**
	 * Grant ID from code request parameters coercion
	 */
	grant_id: string;
	/**
	 * JSON Web Token that encode login session information for the browser application
	 * 
	 * Sent as cookie to Auth Page
	 */
	jwt: string;
	redirect_uri!: string;
	redirection_urn!: string;
	prompts: string[] = [];
	audience: string;
	scope: string[] = [];
	response_type?: AuthorizationResponseType;
	state?: string;
	nonce?: string;
	login_hint?: string;
	connection?: string;
	code_challenge?: string;
	pkce_method?: PKCEMethod;
	authorization_details: AuthorizationDetails[] = [];
	status!: GrantSessionStatus;
}
export type CoercionIgnoreField =
	| 'grant_id'
	| 'login_session_id'
	| 'jwt'
	| 'redirection_urn'
	| 'state'
	| 'status';
export type URN_GrantSession = Pick<GrantSession, 'org_id' | 'client_id' | 'grant_id'>;
export type GrantCoercion = Readonly<Omit<GrantSession, CoercionIgnoreField>>;
export type URN_GrantSessionLookup = URN_GrantSession & { jti: string; };
