import { JSONSchemaType } from "ajv";

export const AccessTokenSchema: JSONSchemaType<TAccessToken> = {
  $id: 'AccessToken',
  type: 'object',
  properties: {
    org_id: {
      type: 'string'
    },
    sid: {
      type: 'string'
    },
    client_id: {
      type: 'string'
    },
    subject: {
      type: 'string'
    },
    access_token: {
      type: 'string'
    },
    expires: {
      type: 'number'
    },
    issued_at: {
      type: 'number'
    },
    audience: {
      type: 'string',
    }
  },
  required: [
    'org_id',
    'sid',
    'client_id',
    'subject',
    'access_token',
    'expires',
    'issued_at',
    'audience'
  ]
};

export type TAccessToken = {
  org_id: string;
  sid: string;
  client_id: string;
  subject: string;
  access_token: string;
  expires: number;
  issued_at: number;
  audience: string;
};
export const TAccessToken = (() => {
  function check_TAccessToken(value: any): boolean {
    return (
      typeof value === 'object' &&
      value !== null &&
      !Array.isArray(value) &&
      typeof value.org_id === 'string' &&
      typeof value.sid === 'string' &&
      typeof value.client_id === 'string' &&
      typeof value.subject === 'string' &&
      typeof value.access_token === 'string' &&
      Number.isFinite(value.expires) &&
      typeof value.issued_at === 'number' &&
      typeof value.audience === 'string'
    );
  }
  return function check(value: any): value is TAccessToken {
    return check_TAccessToken(value);
  };
})();
