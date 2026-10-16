export const AppSessionSchema = {
  $id: 'AppSession',
  type: 'object',
  properties: {
    org_id: {
      type: 'string'
    },
    sid: {
      type: 'string'
    },
    user_agent: {
      type: 'string'
    },
    ip: {
      type: 'string'
    },
    last_seen_at: {
      type: 'number'
    },
    expires_at: {
      type: 'number'
    },
    issued_at: {
      type: 'number'
    },
    user_id: {
      type: 'string'
    },
    connection: {
      type: 'string'
    },
    action: {
      type: 'string'
    },
  },
  required: [
    'org_id',
    'sid',
    'user_agent',
    'ip',
    'last_seen_at',
    'expires_at',
    'issued_at'
  ]
};

export type AppSessionType = {
  org_id: string;
  sid: string;
  jti: string;
  kid: string;
  user_agent: string;
  ip: string;
  last_seen_at: number;
  expires_at: number;
  issued_at: number;
  user_id?: string | null;
  connection?: string | null;
  action?: string;
};
export const AppSessionType = (() => {
  function check_AppSessionType(value: any): boolean {
    return (
      typeof value === 'object' &&
      value !== null &&
      !Array.isArray(value) &&
      typeof value.org_id === 'string' &&
      typeof value.sid === 'string' &&
      typeof value.jti === 'string' &&
      typeof value.kid === 'string' &&
      typeof value.user_agent === 'string' &&
      typeof value.ip === 'string' &&
      Number.isFinite(value.last_seen_at) &&
      Number.isFinite(value.expires_at) &&
      Number.isFinite(value.issued_at) &&
      (value.action !== undefined
        ? typeof value.action === 'string' ||
        value.action === null
        : true) &&
      (value.user_id !== undefined
        ? typeof value.user_id === 'string' ||
        value.user_id === null
        : true) &&
      (value.connection !== undefined
        ? typeof value.connection === 'string' ||
        value.connection === null
        : true) &&
      // user_id & connection should be present together or not at all
      ((typeof value.user_id === typeof value.connection) ||
        (!!value.user_id === !!typeof value.connection))
    );
  }
  return function check(value: any): value is AppSessionType {
    return check_AppSessionType(value);
  };
})();
