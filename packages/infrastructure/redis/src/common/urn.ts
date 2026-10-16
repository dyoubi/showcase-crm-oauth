import { PK_AppSession, PK_Client, PK_PushAuthorizationSession, URN, URN_GrantSession, UserAction } from "@ring-oauth/core";

export namespace urn {
	export const ROOT = `ringoauth`;
	export function org(pk: { org_id: string; }) { return `${ROOT}:org:${pk.org_id}`; };
	export function client(pk: PK_Client) { return `${org(pk)}:client:${pk.client_id}`; };
	export function grant(pk: URN_GrantSession) { return `${client(pk)}:grant:${pk.grant_id}`; };
	export function code(pk: PK_Client) { return `${client(pk)}:codes`; };
	export function jti(pk: { org_id: string, client_id: string, jti: string; }) {
		return `${client(pk)}:grant:jti:${pk.jti}`;
	}

	export function par(pk: PK_PushAuthorizationSession) {
		return `${client(pk)}:par:${pk.request_uri}`;
	}

	export function session(pk: PK_AppSession) { return `${org(pk)}:oauth:app:session:${pk.sid}`; }
	export function ticket(pk: { org_id: string, jti: string; action: UserAction; }) {
		return `${org(pk)}:ticket:${pk.action}:${pk.jti}`;
	};
}