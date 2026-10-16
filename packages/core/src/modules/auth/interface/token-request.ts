import { AuthorizationDetails } from "./authorization-details";
import { AccessGrantType, AccessTokenResponse, AuthorizationResponseType } from '../../../common';
export const TokenRequestSchema = {
  $id: 'TokenRequest',
  type: 'object',
  properties: {
    grant_type: {
      type: 'string'
    },
    response_type: {
      type: 'string'
    },
    client_id: {
      type: 'string'
    },
    audience: {
      type: 'string'
    },
    scope: {
      type: 'string'
    },
    authorization_details: {
      type: 'array',
      items: {
        type: 'object'
      },
    }
  },
  required: ['grant_type', 'client_id', 'audience']
};

export interface TokenRequest {
  grant_type: AccessGrantType;
  response_type?: AuthorizationResponseType;
  client_id: string;
  audience: string;
  scope?: string;
  authorization_details?: AuthorizationDetails[];
};
export const TokenRequest = (() => {
  function check_TokenRequest(value: any): boolean {
    return (
      typeof value === 'object' &&
      value !== null &&
      !Array.isArray(value) &&
      typeof value.grant_type === 'string' &&
      (value.response_type !== undefined
        ? typeof value.response_type === 'string'
        : true) &&
      typeof value.client_id === 'string' &&
      typeof value.audience === 'string' &&
      (value.scope !== undefined ? typeof value.scope === 'string' : true) &&
      (value.authorization_details !== undefined
        ? typeof value.authorization_details === 'object' &&
        value.authorization_details !== null &&
        Array.isArray(value.authorization_details)
        : true)
    );
  }
  return function check(value: any): value is TokenRequest {
    return check_TokenRequest(value);
  };
})();
