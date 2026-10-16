import { JSONSchemaType } from "ajv";
import { BusinessModel } from "../../../../common";

export const LoginSessionSchema: JSONSchemaType<Omit<TLoginSession, keyof BusinessModel>> = {
  $id: 'LoginSession',
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
    audience: {
      type: 'string',
    },
    auth_time: {
      type: 'number'
    },
    max_age: {
      type: 'number'
    },
    last_active_time: {
      type: 'number'
    }
  },
  required: [
    'org_id',
    'sid',
    'client_id',
    'subject',
    'audience',
    'auth_time',
    'max_age',
    'last_active_time',
  ]
};

export type TLoginSession = {
  org_id: string;
  sid: string;
  client_id: string;
  subject: string;
  audience: string;
  auth_time: number;
  max_age: number;
  last_active_time:number;
};
export const TLoginSession = (() => {
  function check_TLoginSession(value: any): boolean {
    return (
      typeof value === 'object' &&
      value !== null &&
      !Array.isArray(value) &&
      typeof value.org_id === 'string' &&
      typeof value.sid === 'string' &&
      typeof value.client_id === 'string' &&
      typeof value.subject === 'string' &&
      typeof value.audience === 'string' &&
      Number.isFinite(value.auth_time) &&
      Number.isFinite(value.max_age) &&
      Number.isFinite(value.last_activity)
      
    );
  }
  return function check(value: any): value is TLoginSession {
    return check_TLoginSession(value);
  };
})();
