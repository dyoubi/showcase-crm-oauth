import { JsonWebKey } from "crypto";
import { JwtSignAlg } from "../../../../common/json-web-token";
import { ClientSigningKeyType } from "./client-signing-key.schema";
import { KeySource, KeyStatus } from "./types";
import { BusinessModel, Revokable } from "../../../../common";

export class ClientSigningKey implements ClientSigningKeyType, Revokable, BusinessModel {
    org_id: string;
    client_id: string;
    kid: string;
    jwk: JsonWebKey;
    kty: string;
    use: string;
    alg_allowed: JwtSignAlg[];
    status: KeyStatus;
    not_before?: number | null;
    not_after?: number | null;
    source: KeySource;
    jwks_uri?: string | null;
    thumbprint: string;
    first_seen_at?: Date | null;
    last_seen_at?: Date | null;

    revoked: boolean;
    revoked_at: Date | null;

    created_at: Date;
    updated_at: Date | null;
    created_by: string;
    updated_by: string | null;
}
export type PK_ClientSigningKey = Pick<ClientSigningKey, 'org_id' | 'client_id' | 'kid'>;