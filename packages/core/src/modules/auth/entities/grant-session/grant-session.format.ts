import {
	canonicalStringify, cleanUndefinedDeep,
	PKCEMethod, sha256b64u, sortKeysDeep
} from "../../../../common";
import { formats } from "../../../../common/validation";
import { AuthorizationDetails } from "../../interface";
import { GrantCoercion } from "./grant-session.model";

export function coercePrompts(prompts: string[]) {
	const allowed = new Set(["none", "login", "consent", "select_account"]);
	const list = (prompts || [])
		.flatMap(p => (p || "").split(/\s+/))     // tolère "login consent" dans un item
		.map(p => p.trim().toLowerCase())
		.filter(p => p && allowed.has(p));
	return Array.from(new Set(list)).sort();
}
export function coercePermissions(scope_values: string[]) {
	const list = (scope_values || [])
		.flatMap(s => (s || "").split(/\s+/))
		.map(s => s.trim())
		.filter(Boolean)
		.map(s => s.toLowerCase()); // retirez toLowerCase() si vos scopes sont sensibles à la casse
	return Array.from(new Set(list)).sort();
}
export function coerceAudience(audience: string) {
	return audience.trim();
}
export function coerceAuthorizationDetails<T extends AuthorizationDetails = AuthorizationDetails>(authorization_details: T[]) {
	const cleaned = (authorization_details || []).map(i => sortKeysDeep(cleanUndefinedDeep(i)));
	// Tri déterministe pour la clé de grant (ordre des items sans importance pour le keying)
	return cleaned.sort((a, b) => {
		const sa = JSON.stringify(a);
		const sb = JSON.stringify(b);
		return sa < sb ? -1 : sa > sb ? 1 : 0;
	});
}
export function coerceGrant(session: GrantCoercion): GrantCoercion {
	const rawGrant: GrantCoercion = {
		org_id: session.org_id,
		client_id: session.client_id,
		redirect_uri: (session.redirect_uri || "").trim(),
		prompts: coercePrompts(session.prompts),
		audience: coerceAudience(session.audience),
		scope: coercePermissions(session.scope),
		authorization_details: coerceAuthorizationDetails(session.authorization_details),
		nonce: session.nonce || undefined,
		code_challenge: (session.code_challenge || "").trim() || undefined,
		pkce_method: ((session.code_challenge || "").trim() as PKCEMethod) || undefined,
		login_hint: (session.login_hint || "").trim() || undefined,
		connection: (session.connection || "").trim() || undefined,
		response_type: session.response_type || undefined,
	};
	return rawGrant;
}

export function GrantID(session: GrantCoercion): string {
	const rawGrant = coerceGrant(session);
	return sha256b64u(canonicalStringify(rawGrant));
}

export function PermissionListCoerceMapper(
	input: {
		permissions: { scope_value: string, resource_server_identifier: string; }[];
	}
) {
	return input.permissions.map(p => `${p.resource_server_identifier.trim()}=${p.scope_value.trim()}`);
}

const REGEX_RS_SCOPE_NS = /^(?:urn:|)rs:(?<rs>[a-z0-9][a-z0-9-._]{0,62}):scope:(?<scope>[a-z0-9][a-z0-9-._]{0,127})$/i;

const RS_NAMESPACE = /^(?:(?:urn:)|)(?<prefix>(?:[a-z0-9][a-z0-9-._]{0,62}:)*[a-z0-9][a-z0-9-._]{0,62})?:rs:(?<rs>[a-z0-9][a-z0-9-._]{0,62})(?::(?<suffix>(?:[a-z0-9][a-z0-9-._]{0,62}:)*[a-z0-9][a-z0-9-._]{0,62}))?$/i;


export function parsePermissionURN(scope_value: string) {
	const regexp = /^(?<urn>(?:urn:|))aud:(?<rs_id>[a-z0-9][a-z0-9-._]{0,62}):scope:(?<scope>[a-z0-9 ][a-z0-9-._ ]{0,127})$/i;
	const groups = scope_value.match(regexp)?.groups;
	if (!groups) { return null; }
	return {
		resource_server_identifier: groups['rs_id'],
		scope_value: groups['scope'],
	};
}

export function ExtractPermissionFromURN(urn: string): {
	resource_server_identifier: string,
	scope_value: string;
} | null {
	const result = urn.match(REGEX_RS_SCOPE_NS);
	if (!result || !result.groups) {
		throw new TypeError();
	}

	return {
		resource_server_identifier: result.groups.rs,
		scope_value: result.groups.scope
	};
}