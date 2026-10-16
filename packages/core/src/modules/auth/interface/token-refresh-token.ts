import { EAccessGrantType } from "../../../common/openid-connect";
import { TokenRequest } from "./token-request";

export const TokenRefreshTokenSchema = {
  $id: 'TokenRefreshTokenSchema',
  type: 'object',
  properties: {
    grant_type: {
      type: 'string'
    },
    refresh_token: {
      type: 'string'
    },
    client_secret: {
      type: 'string'
    },
    connection: {
      type: 'string'
    }
  },
  required: ['grant_type', 'refresh_token', 'client_secret']
};

export interface TokenRequestRefreshToken extends TokenRequest {
  grant_type: EAccessGrantType.REFRESH_TOKEN;
  refresh_token: string;
  client_secret: string;
}

export const TokenRequestRefreshToken = (() => {
  function check_TokenRequestRefreshToken(value: any): boolean {
    return (
      typeof value === 'object' &&
      value !== null &&
      !Array.isArray(value) &&
      typeof value.grant_type === 'string' &&
      typeof value.refresh_token === 'string' &&
      typeof value.client_secret === 'string'
    );
  }
  return function check(value: any): value is TokenRequestRefreshToken {
    return TokenRequest(value) && check_TokenRequestRefreshToken(value);
  };
})();
