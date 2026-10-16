import { JSONObject } from "../../../common";

export const AudienceAuthorizationDetailsSchema = {
  $id: 'AudienceAuthorization',
  type: 'object',
  properties: {
    type: {
      type: 'string'
    },
    audience: {
      type: 'string'
    },
    action: {
      oneOf: [
        {
          type: 'object',
          additionalProperties: true,
          required: false,
        },
        {
          type: 'null'
        }
      ]
    }
  },
  required: ['type', 'audience']
};

/**
 * RFC-9396
 * The request parameter authorization_details contains, in JSON notation, an array of objects. 
 * Each JSON object contains the data to specify the authorization requirements for a certain type of resource 
 * 
 */
export interface AuthorizationDetails {
  type: string;
  audience: string;
  action?: JSONObject | null;
};

export const AudienceAuthorizationDetails = (() => {
  function check_AudienceAuthorizationDetails(value: any): boolean {
    return (
      typeof value === 'object' &&
      value !== null &&
      !Array.isArray(value) &&
      typeof value.type === 'string' &&
      typeof value.audiencer === 'string' &&
      (value.action !== undefined
        ? (typeof value.action === 'object' &&
          value.action !== null &&
          !Array.isArray(value.action)) ||
        value.action === null
        : true)
    );
  }
  return function check(value: any): value is AuthorizationDetails {
    return check_AudienceAuthorizationDetails(value);
  };
})();
