import { JSONObject, TokenEndpointAuthMethod } from "../../../common";
import { LoginHint } from "../../auth";
import { EUserAction, UserAction } from "../../org";

export const UserRegistrationTicketRequestSchema = {
  $id: 'UserRegistrationTicketRequest',
  type: 'object',
  properties: {
    client_id: {
      type: 'string'
    },
    client_auth_method: {
      type: 'string'
    },
    login_hint: {
      anyOf: [
        {
          type: 'object',
          properties: {}
        },
        {
          type: 'null'
        }
      ]
    },
    connection: {
      type: 'string'
    }
  },
  required: ['client_id', 'client_auth_method', 'connection']
};

export type UserRegistrationTicketRequest = {
  client_id: string;
  client_auth_method: TokenEndpointAuthMethod;
  connection: string;
  redirect_uri: string;
  login_hint?: LoginHint | null;
  metadata?: JSONObject;
};

export const UserRegistrationTicketRequest = (() => {
  function check_UserRegistrationTicketRequest(value: any): boolean {
    return (
      typeof value === 'object' &&
      value !== null &&
      !Array.isArray(value) &&
      typeof value.client_id === 'string' &&
      typeof value.client_auth_method === 'string' &&
      typeof value.connection === 'string' &&
      typeof value.redirect_uri === 'string' &&
      (
        value.login_hint !== undefined
          ? (typeof value.login_hint === 'object' &&
            value.login_hint !== null &&
            !Array.isArray(value.login_hint)) ||
          value.login_hint === null
          : true
      ) &&
      (
        value.metadata !== undefined
          ? (typeof value.metadata === 'object' &&
            value.metadata !== null &&
            !Array.isArray(value.metadata)) ||
          value.metadata === null
          : true
      )
    );
  }
  return function check(value: any): value is UserRegistrationTicketRequest {
    return check_UserRegistrationTicketRequest(value);
  };
})();
