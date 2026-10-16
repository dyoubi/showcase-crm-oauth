import { JsonWebKeyPair } from "../../../common";

export interface IOrgJwksProvider {
	get(org_id: string): Promise<JsonWebKeyPair>;
}
export const ORG_JWKS_PROVIDER: symbol = Symbol('ORG_JWKS_PROVIDER');