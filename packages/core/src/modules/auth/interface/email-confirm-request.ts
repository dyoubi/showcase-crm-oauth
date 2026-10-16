export const EmailConfirmRequestSchema = {
  $id: 'EmailConfirmRequestSchema',
  type: 'object',
  properties: {
    org_id: {
      type: 'string'
    },
    tid: {
      type: 'string'
    },
    usage: {
      type: 'string'
    },
    email: {
      type: 'string'
    },
    connection: {
      anyOf: [
        {
          type: 'string'
        },
        {
          type: 'null'
        }
      ]
    }
  },
  required: ['org_id', 'tid', 'usage', 'email']
};

export type EmailConfirmRequest = {
  org_id: string;
  tid: string;
  app_sid?: string | null;
  usage: string;
  email: string;
  connection?: string | null;
};
export const EmailConfirmRequest = (() => {
  function check_EmailConfirmRequest(value: any): boolean {
    return (
      typeof value === 'object' &&
      value !== null &&
      !Array.isArray(value) &&
      typeof value.org_id === 'string' &&
      typeof value.tid === 'string' &&
      (value.app_sid !== undefined
        ? typeof value.app_sid === 'string' || value.app_sid === null
        : true) &&
      typeof value.usage === 'string' &&
      typeof value.email === 'string' &&
      (value.connection !== undefined
        ? typeof value.connection === 'string' || value.connection === null
        : true)
    );
  }
  return function check(value: any): value is EmailConfirmRequest {
    return check_EmailConfirmRequest(value);
  };
})();
