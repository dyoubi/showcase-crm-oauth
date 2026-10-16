import { JsonWebKey } from "crypto";
import { EJwkUse, EKty, JwkUse, Kty } from "../../../../common";

export const InstanceJwtPairSchema = {
  $id: 'InstanceJwtPair',
  type: 'object',
  properties: {
    org_id: {
      type: 'string'
    },
    kid: {
      type: 'string'
    },
    use: {
      type: 'string'
    },
    alg: {
      type: 'string'
    },
    pub: {
      type: 'object',
      properties: {}
    },
    priv: {
      type: 'object',
      properties: {}
    },
    thumbprint: {
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
    expires_at: {
      anyOf: [
        {
          type: 'number'
        },
        {
          type: 'null'
        }
      ]
    },
    first_usage_at: {
      anyOf: [
        {
          type: 'number'
        },
        {
          type: 'null'
        }
      ]
    }
  },
  required: ['org_id', 'kid', 'kty', 'use', 'alg', 'pub', 'priv', 'thumbprint']
};

export type InstanceJwtPairType = {
  org_id: string;
  kid: string;
  kty: Kty;
  use: JwkUse;
  alg: string;
  pub: JsonWebKey;
  priv: JsonWebKey;
  thumbprint: string;
  not_before?: number | null;
  expires_at?: number | null;
  first_usage_at?: number | null;
};
const ktyValues: ReadonlySet<Kty> = new Set(Object.values(EKty));
const useValues: ReadonlySet<JwkUse> = new Set(Object.values(EJwkUse));

export const InstanceJwtPairType = (() => {
  function check_InstanceJwtPairType(value: any): boolean {
    return (
      typeof value === 'object' &&
      value !== null &&
      !Array.isArray(value) &&
      typeof value.org_id === 'string' &&
      typeof value.kid === 'string' &&
      (typeof value.kty === 'string' &&
        ktyValues.has(value.kty)) &&
      (typeof value.use === 'string' &&
        useValues.has(value.use)) &&
      typeof value.alg === 'string' &&
      (typeof value.pub === 'object' &&
        value.pub !== null &&
        !Array.isArray(value.pub)) &&
      (typeof value.priv === 'object' &&
        value.priv !== null &&
        !Array.isArray(value.priv)) &&
      typeof value.thumbprint === 'string' &&
      (value.not_before !== undefined
        ? Number.isFinite(value.not_before) || value.not_before === null
        : true) &&
      (value.expires_at !== undefined
        ? Number.isFinite(value.expires_at) || value.expires_at === null
        : true) &&
      (value.first_usage_at !== undefined
        ? Number.isFinite(value.first_usage_at) || value.first_usage_at === null
        : true)
    );
  }
  return function check(value: any): value is InstanceJwtPairType {
    return check_InstanceJwtPairType(value);
  };
})();
