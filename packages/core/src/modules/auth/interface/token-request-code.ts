import { EAccessGrantType } from "../../../common/openid-connect";
import { TokenRequest } from "./token-request";

export const TokenRequestCodeSchema = {
  $id: 'TokenRequestCodeSchema',
  type: 'object',
  properties: {
    grant_type: {
      type: 'string'
    },
    code: {
      type: 'string'
    },
    code_verifier: {
      type: 'string'
    },
    client_secret: {
      type: 'string'
    },
    redirect_uri: {
      type: 'string'
    }
  },
  required: ['grant_type', 'code', 'client_secret', 'redirect_uri']
};

export interface TokenRequestCode extends TokenRequest {
  grant_type: EAccessGrantType.AUTHORIZATION_CODE;
  code: string;
  code_verifier?: string;
  client_secret: string;
  redirect_uri: string;
}
export const TokenRequestCode = (() => {
  function check_TokenRequestCode(value: any): boolean {
    return (
      typeof value === 'object' &&
      value !== null &&
      !Array.isArray(value) &&
      value.grant_type === EAccessGrantType.AUTHORIZATION_CODE &&
      typeof value.code === 'string' &&
      (value.code_verifier !== undefined
        ? typeof value.code_verifier === 'string'
        : true) &&
      typeof value.client_secret === 'string' &&
      typeof value.redirect_uri === 'string'
    );
  }
  return function check(value: any): value is TokenRequestCode {
    return TokenRequest(value) && check_TokenRequestCode(value);
  };
})();
