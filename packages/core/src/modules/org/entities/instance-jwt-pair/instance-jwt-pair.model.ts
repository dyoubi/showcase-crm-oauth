import { JsonWebKey } from "crypto";
import { InstanceJwtPairType } from "./instance-jwt-pair.schema";
import { JweEncAlg, JwkUse, JwtSignAlg, Kty, Revokable } from "../../../../common";

export class InstanceJwtPair implements InstanceJwtPairType, Revokable {
    org_id: string;
    kid: string;
    kty: Kty;
    use: JwkUse;
    alg: JwtSignAlg | JweEncAlg;
    pub: JsonWebKey;
    priv: JsonWebKey;
    thumbprint: string;
    not_before?: number | null;
    expires_at?: number | null;
    first_usage_at?: number | null;

    revoked: boolean;
    revoked_at: Date | null;
}
export type PK_InstanceJwtPair = Pick<InstanceJwtPair, 'org_id' | 'kid'>;

export const PublicKeyFieldsList: (keyof InstanceJwtPair)[] = [
    'kid',
    'alg',
    'pub',
    'thumbprint',
    'expires_at',
] as const;

export type PublicKeyFileds = typeof PublicKeyFieldsList[number];