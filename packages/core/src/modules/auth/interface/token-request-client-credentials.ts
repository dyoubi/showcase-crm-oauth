import { EAccessGrantType } from "../../../common/openid-connect";
import { TokenRequest } from "./token-request";

export const TokenRequestClientCredentialsSchema = {
  $id: 'TokenRequestClientCredentialsSchema',
  type: 'object',
  properties: {
    grant_type: {
      type: 'string'
    },
    client_secret: {
      type: 'string'
    },
    scope: {
      type: 'string'
    }
  },
  required: ['grant_type', 'client_secret', 'scope']
};

export interface TokenRequestClientCredentials extends TokenRequest {
  grant_type: EAccessGrantType.CLIENT_CREDENTIALS;
  client_secret: string;
  scope: string;
}
export const TokenRequestClientCredentials = (() => {
  function check_TokenRequestClientCredentials(value: any): boolean {
    return (
      typeof value === 'object' &&
      value !== null &&
      !Array.isArray(value) &&
      value.grant_type === EAccessGrantType.CLIENT_CREDENTIALS &&
      typeof value.client_secret === 'string' &&
      typeof value.scope === 'string'
    );
  }
  return function check(value: any): value is TokenRequestClientCredentials {
    return TokenRequest(value) && check_TokenRequestClientCredentials(value);
  };
})();
