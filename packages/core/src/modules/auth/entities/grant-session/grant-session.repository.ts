import { GrantSession, URN_GrantSession, URN_GrantSessionLookup } from "./grant-session.model";

export interface IGrantSessionStore {
	push(grant: GrantSession): Promise<void>;
	pull(urn: URN_GrantSession): Promise<GrantSession | null>;
	pop(urn: URN_GrantSession): Promise<void>;
	has(urn: URN_GrantSession): Promise<boolean>;
};
export const GRANT_SESSION_STORE = Symbol('GRANT_SESSION_STORE');

export interface IJtiLookupTable {
	push(data: URN_GrantSessionLookup): Promise<void>;
	pull(urn: Omit<URN_GrantSessionLookup, 'grant_id'>): Promise<string | null>;
	pop(urn: URN_GrantSessionLookup): Promise<void>;
	has(urn: URN_GrantSessionLookup): Promise<boolean>;
}
export const JTI_LOOKUP_TABLE = Symbol('JTI_LOOKUP_TABLE');