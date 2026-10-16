import { JsonWebKey } from "crypto";
import { KeySource, KeyStatus } from "./types";
import { EJwtSignAlg, JwtSignAlg } from "../../../../common";

export const ClientSigningKeySchema = {
  $id: 'ClientSigningKey',
  type: 'object',
  properties: {
    org_id: {
      type: 'string'
    },
    client_id: {
      type: 'string'
    },
    kid: {
      type: 'string'
    },
    jwk: {
      type: 'object',
      properties: {}
    },
    kty: {
      type: 'string'
    },
    use: {
      type: 'string'
    },
    alg_allowed: {
      type: 'array',
      items: {
        type: 'string'
      }
    },
    status: {
      type: 'string'
    },
    not_before: {
      anyOf: [
        {
          type: 'number'
        },
        {
          type: 'null'
        }
      ]
    },
    not_after: {
      anyOf: [
        {
          type: 'number'
        },
        {
          type: 'null'
        }
      ]
    },
    source: {
      type: 'string'
    },
    jwks_uri: {
      anyOf: [
        {
          type: 'string'
        },
        {
          type: 'null'
        }
      ]
    },
    thumbprint: {
      type: 'string'
    },
    first_seen_at: {
      anyOf: [
        {
          type: 'Date'
        },
        {
          type: 'null'
        }
      ]
    },
    last_seen_at: {
      anyOf: [
        {
          type: 'Date'
        },
        {
          type: 'null'
        }
      ]
    }
  },
  required: [
    'org_id',
    'client_id',
    'kid',
    'jwk',
    'kty',
    'use',
    'alg_allowed',
    'status',
    'source',
    'thumbprint'
  ]
};

export type ClientSigningKeyType = {
  org_id: string;
  client_id: string;
  kid: string;
  jwk: JsonWebKey;
  kty: string;
  use: string;
  alg_allowed: Array<JwtSignAlg>;
  status: KeyStatus;
  not_before?: number | null;
  not_after?: number | null;
  source: KeySource;
  jwks_uri?: string | null;
  thumbprint: string;
  first_seen_at?: Date | null;
  last_seen_at?: Date | null;
};
export const ClientSigningKeyType = (() => {
  const algAllowedValues: ReadonlyArray<string> = (Object.values(EJwtSignAlg) as string[]);
  function isAlgAllowed(value: any): value is JwtSignAlg {
    return typeof value === 'string' && algAllowedValues.includes(value);
  }
  function check_ClientSigningKeyType(value: any): boolean {
    return (
      typeof value === 'object' &&
      value !== null &&
      !Array.isArray(value) &&
      typeof value.org_id === 'string' &&
      typeof value.client_id === 'string' &&
      typeof value.kid === 'string' &&
      typeof value.jwk === 'object' &&
      value.jwk !== null &&
      !Array.isArray(value.jwk) &&
      typeof value.kty === 'string' &&
      typeof value.use === 'string' &&
      Array.isArray(value.alg_allowed) &&
      value.alg_allowed.every(isAlgAllowed) &&
      typeof value.status === 'string' &&
      (value.not_before !== undefined
        ? Number.isFinite(value.not_before) || value.not_before === null
        : true) &&
      (value.not_after !== undefined
        ? Number.isFinite(value.not_after) || value.not_after === null
        : true) &&
      typeof value.source === 'string' &&
      (value.jwks_uri !== undefined
        ? typeof value.jwks_uri === 'string' || value.jwks_uri === null
        : true) &&
      typeof value.thumbprint === 'string' &&
      (value.first_seen_at !== undefined
        ? (value.first_seen_at instanceof Date &&
          Number.isFinite(value.first_seen_at.getTime())) ||
        value.first_seen_at === null
        : true) &&
      (value.last_seen_at !== undefined
        ? (value.last_seen_at instanceof Date &&
          Number.isFinite(value.last_seen_at.getTime())) ||
        value.last_seen_at === null
        : true)
    );
  }
  return function check(value: any): value is ClientSigningKeyType {
    return check_ClientSigningKeyType(value);
  };
})();
