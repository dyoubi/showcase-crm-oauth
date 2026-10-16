import { TicketUsage } from "../../types";

export const TicketChallengeSchema = {
  $id: 'TicketChallengeSchema',
  type: 'object',
  properties: {
    org_id: {
      type: 'string'
    },
    tid: {
      type: 'string'
    },
    jti: { type: 'string' },
    cid: { type: 'string' },
    redirect_uri: { type: 'string' },
    user_id: {
      type: 'string'
    },
    connection: {
      type: 'string'
    },
    app_sid: {
      anyOf: [
        {
          type: 'string'
        },
        {
          type: 'null'
        }
      ]
    },
    secret: {
      type: 'string'
    },
    kid: {
      type: 'string'
    },
    issued_at: {
      type: 'number'
    },
    expires_at: {
      type: 'number'
    },
    revoked: {
      anyOf: [
        {
          type: 'number'
        },
        {
          type: 'null'
        }
      ]
    },
    revoked_at: {
      anyOf: [
        {
          type: 'Date'
        },
        {
          type: 'null'
        }
      ]
    },
    usage: {
      type: 'string'
    }
  },
  required: [
    'org_id',
    'tid',
    'jti',
    'cid',
    'user_id',
    'connection',
    'secret',
    'kid',
    'issued_at',
    'expires_at',
    'usage'
  ]
};

export type TicketChallengeType = {
  org_id: string;
  tid: string;
  jti: string;
  kid: string;
  cid: string;
  app_sid?: string | null;
  usage: TicketUsage;
  redirect_uri: string;
  user_id?: string;
  connection: string;
  secret: string;
  issued_at: number;
  expires: number;
  revoked?: boolean | null;
  revoked_at?: Date | null;
};
export const TicketChallengeType = (() => {
  function check_TicketChallengeSessionType(value: any): boolean {
    return (
      typeof value === 'object' &&
      value !== null &&
      !Array.isArray(value) &&
      typeof value.org_id === 'string' &&
      typeof value.tid === 'string' &&
      typeof value.jti === 'string' &&
      typeof value.cid === 'string' &&
      typeof value.usage === 'string' &&
      typeof value.redirect_uri === 'string' &&
      (value.user_id !== undefined
        ? typeof value.user_id === 'string' || value.user_id === null
        : true) &&
      typeof value.connection === 'string' &&
      (value.app_sid !== undefined
        ? typeof value.app_sid === 'string' || value.app_sid === null
        : true) &&
      typeof value.secret === 'string' &&
      typeof value.kid === 'string' &&
      Number.isFinite(value.issued_at) &&
      Number.isFinite(value.expires_at) &&
      (value.revoked !== undefined
        ? typeof value.revoked === 'boolean' || value.revoked === null
        : true) &&
      (value.revoked_at !== undefined
        ? (value.revoked_at instanceof Date &&
          Number.isFinite(value.revoked_at.getTime())) ||
        value.revoked_at === null
        : true)
    );
  }
  return function check(value: any): value is TicketChallengeType {
    return check_TicketChallengeSessionType(value);
  };
})();
