import { AuthorizationResponseType, PKCEMethod } from "../../../common";
import { AuthorizationDetails } from "./authorization-details";

export const ClientCodeRequestSchema = {
  $id: 'ClientCodeRequest',
  type: 'object',
  properties: {
    client_id: {
      type: 'string'
    },
    audience: {
      type: 'string'
    },
    connection: {
      type: 'string'
    },
    login_hint: {
      type: 'string'
    },
    scope: {
      anyOf: [
        {
          type: 'string'
        },
        {
          type: 'null'
        }
      ]
    },
    response_type: {
      type: 'string'
    },
    prompts: {
      type: 'string'
    },
    code_challenge: {
      anyOf: [
        {
          type: 'string'
        },
        {
          type: 'null'
        }
      ]
    },
    pkce_method: {
      anyOf: [
        {
          type: 'string'
        },
        {
          type: 'null'
        }
      ]
    },
    redirect_uri: {
      type: 'string'
    },
    state: {
      type: 'string'
    },
    nonce: {
      type: 'string'
    },
    authorization_details: {
      type: 'array',
      items: {
        type: 'object',
        properties: {}
      }
    }
  },
  required: ['client_id', 'audience', 'redirect_uri']
};

export type CodeRequest = {
  client_id: string;
  audience: string;
  connection?: string;
  login_hint?: string;
  scope?: string;
  response_type?: AuthorizationResponseType;
  prompts?: string;
  code_challenge?: string;
  pkce_method?: PKCEMethod;
  redirect_uri: string;
  state?: string;
  nonce?: string;
  authorization_details?: AuthorizationDetails[];
};
export const CodeRequest = (() => {
  function check_CodeRequest(value: any): boolean {
    return (
      typeof value === 'object' &&
      value !== null &&
      !Array.isArray(value) &&
      typeof value.client_id === 'string' &&
      typeof value.audience === 'string' &&
      (value.connection !== undefined
        ? typeof value.connection === 'string' || value.connection === null
        : true) &&
      (value.login_hint !== undefined
        ? typeof value.login_hint === 'string'
        : true) &&
      (value.scope !== undefined
        ? typeof value.scope === 'string' || value.scope === null
        : true) &&
      (value.response_type !== undefined
        ? typeof value.response_type === 'string'
        : true) &&
      (value.prompts !== undefined
        ? typeof value.prompts === 'string'
        : true) &&
      (value.code_challenge !== undefined
        ? typeof value.code_challenge === 'string' ||
        value.code_challenge === null
        : true) &&
      (value.pkce_method !== undefined
        ? typeof value.pkce_method === 'string' || value.pkce_method === null
        : true) &&
      typeof value.redirect_uri === 'string' &&
      (value.state !== undefined ? typeof value.state === 'string' : true) &&
      (value.nonce !== undefined ? typeof value.nonce === 'string' : true) &&
      (value.authorization_details !== undefined
        ? Array.isArray(value.authorization_details) &&
        value.authorization_details.every(
          (value: any) =>
            typeof value === 'object' &&
            value !== null &&
            !Array.isArray(value)
        )
        : true)
    );
  }
  return function check(value: any): value is CodeRequest {
    return check_CodeRequest(value);
  };
})();
