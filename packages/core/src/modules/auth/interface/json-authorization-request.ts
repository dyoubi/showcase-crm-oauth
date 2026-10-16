import { CodeRequest } from "./client-code-request";

export const PushedAuthorizationRequestSchema = {
  $id: 'PushedAuthorizationRequestSchema',
  type: 'object',
  properties: {
    client_id: {
      type: 'string'
    },
    request: {
      type: 'object',
      properties: {}
    }
  },
  required: ['client_id', 'request']
};

export interface JsonAuthorizationRequest {
  client_id: string;
  request: string;
}

export const JsonAuthorizationRequest = (() => {
  function check_JsonAuthorizationRequest(value: any): boolean {
    return (
      typeof value === 'object' &&
      value !== null &&
      !Array.isArray(value) &&
      typeof value.client_id === 'string' &&
      typeof value.request === 'string' &&
      value.request !== null
    );
  }
  return function check(value: any): value is JsonAuthorizationRequest {
    return check_JsonAuthorizationRequest(value);
  };
})();
