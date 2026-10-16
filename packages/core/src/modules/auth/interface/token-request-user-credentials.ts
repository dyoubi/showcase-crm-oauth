import { EAccessGrantType } from "../../../common/openid-connect";
import { TokenRequest } from "./token-request";

export const TokenRequestUserCredentialsSchema = {
  $id: 'TokenRequestUserCredentials',
  type: 'object',
  properties: {
    grant_type: {
      type: 'string'
    },
    client_secret: {
      type: 'string'
    },
    username: {
      type: 'string'
    },
    password: {
      type: 'string'
    },
    connection: {
      type: 'string'
    },
    scope: {
      type: 'string'
    }
  },
  required: [
    'grant_type',
    'client_secret',
    'username',
    'password',
    'connection',
    'scope'
  ]
};

export interface TokenRequestUserCredentials extends TokenRequest {
  grant_type: EAccessGrantType.USER_CREDENTIALS;
  client_secret: string;
  username: string;
  password: string;
  connection: string;
  scope: string;
};
export const TokenRequestUserCredentials = (() => {
  function check_TokenRequestUserCredentials(value: any): boolean {
    return (
      typeof value === 'object' &&
      value !== null &&
      !Array.isArray(value) &&
      typeof value.grant_type === 'string' &&
      typeof value.client_secret === 'string' &&
      typeof value.username === 'string' &&
      typeof value.password === 'string' &&
      typeof value.connection === 'string' &&
      typeof value.scope === 'string'
    );
  }
  return function check(value: any): value is TokenRequestUserCredentials {
    return TokenRequest(value) && check_TokenRequestUserCredentials(value);
  };
})();
