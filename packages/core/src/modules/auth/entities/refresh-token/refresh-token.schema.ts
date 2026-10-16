import { JSONSchemaType } from "ajv";

export const RefreshTokenSchema: JSONSchemaType<TRefreshToken> = {
  $id: 'RefreshToken',
  type: 'object',
  properties: {
    org_id: {
      type: 'string'
    },
    jti: {
      type: 'string'
    },
    jti_access: {
      type: 'string'
    },
    sid: {
      type: 'string'
    },
    client_id: {
      type: 'string'
    },
    refresh_token: {
      type: 'string'
    },
    expires: {
      type: 'number'
    },
    issued_at: {
      type: 'number'
    },
    subject: {
      type: 'string'
    }
  },
  required: [
    'org_id',
    'jti',
    'jti_access',
    'sid',
    'client_id',
    'refresh_token',
    'expires',
    'issued_at',
    'subject'
  ]
};

export type TRefreshToken = {
  org_id: string;
  client_id: string;
  subject: string;
  sid: string;
  jti: string;
  jti_access: string;
  refresh_token: string;
  expires: number;
  issued_at: number;
};
export const TRefreshToken = (() => {
  function check_TRefreshToken(value: any): boolean {
    return (
      typeof value === 'object' &&
      value !== null &&
      !Array.isArray(value) &&
      typeof value.org_id === 'string' &&
      typeof value.jti === 'string' &&
      typeof value.sid === 'string' &&
      typeof value.client_id === 'string' &&
      typeof value.refresh_token === 'string' &&
      Number.isFinite(value.expires) &&
      typeof value.issued_at === 'number' &&
      typeof value.subject === 'string'
    );
  }
  return function check(value: any): value is TRefreshToken {
    return check_TRefreshToken(value);
  };
})();
