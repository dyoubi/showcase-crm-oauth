import { AuthorizationResponseType, JwtSignAlg, PKCEMethod } from "../../../common";

export const OpenidConfigurationSchema = {
  $id: 'OpenidConfiguration',
  type: 'object',
  properties: {
    issuer: {
      type: 'string'
    },
    authorization_endpoint: {
      type: 'string'
    },
    token_endpoint: {
      type: 'string'
    },
    userinfo_endpoint: {
      type: 'string'
    },
    jwks_uri: {
      type: 'string'
    },
    registration_endpoint: {
      anyOf: [
        {
          type: 'string'
        },
        {
          type: 'null'
        }
      ]
    },
    revocation_endpoint: {
      anyOf: [
        {
          type: 'string'
        },
        {
          type: 'null'
        }
      ]
    },
    introspection_endpoint: {
      anyOf: [
        {
          type: 'string'
        },
        {
          type: 'null'
        }
      ]
    },
    end_session_endpoint: {
      anyOf: [
        {
          type: 'string'
        },
        {
          type: 'null'
        }
      ]
    },
    response_types_supported: {
      type: 'array',
      items: {
        type: 'string'
      }
    },
    subject_types_supported: {
      type: 'array',
      items: {
        type: 'string'
      }
    },
    id_token_signing_alg_values_supported: {
      type: 'array',
      items: {
        type: 'string'
      }
    },
    code_challenge_methods_supported: {
      type: 'array',
      items: {
        type: 'string'
      }
    }
  },
  required: [
    'issuer',
    'authorization_endpoint',
    'token_endpoint',
    'userinfo_endpoint',
    'jwks_uri',
    'response_types_supported',
    'subject_types_supported',
    'id_token_signing_alg_values_supported',
    'code_challenge_methods_supported'
  ]
};

export type OpenidConfiguration = {
  issuer: string;
  authorization_endpoint: string;
  token_endpoint: string;
  userinfo_endpoint: string;
  jwks_uri: string;
  registration_endpoint?: string | null;
  revocation_endpoint?: string | null;
  introspection_endpoint?: string | null;
  end_session_endpoint?: string | null;
  response_types_supported: Array<AuthorizationResponseType>;
  subject_types_supported: Array<string>;
  id_token_signing_alg_values_supported: Array<JwtSignAlg>;
  code_challenge_methods_supported: Array<PKCEMethod>;
};
export const OpenidConfiguration = (() => {
  function check_OpenidConfiguration(value: any): boolean {
    return (
      typeof value === 'object' &&
      value !== null &&
      !Array.isArray(value) &&
      typeof value.issuer === 'string' &&
      typeof value.authorization_endpoint === 'string' &&
      typeof value.token_endpoint === 'string' &&
      typeof value.userinfo_endpoint === 'string' &&
      typeof value.jwks_uri === 'string' &&
      (value.registration_endpoint !== undefined
        ? typeof value.registration_endpoint === 'string' ||
        value.registration_endpoint === null
        : true) &&
      (value.revocation_endpoint !== undefined
        ? typeof value.revocation_endpoint === 'string' ||
        value.revocation_endpoint === null
        : true) &&
      (value.introspection_endpoint !== undefined
        ? typeof value.introspection_endpoint === 'string' ||
        value.introspection_endpoint === null
        : true) &&
      (value.end_session_endpoint !== undefined
        ? typeof value.end_session_endpoint === 'string' ||
        value.end_session_endpoint === null
        : true) &&
      Array.isArray(value.response_types_supported) &&
      value.response_types_supported.every(
        (value: any) => typeof value === 'string'
      ) &&
      Array.isArray(value.subject_types_supported) &&
      value.subject_types_supported.every(
        (value: any) => typeof value === 'string'
      ) &&
      Array.isArray(value.id_token_signing_alg_values_supported) &&
      value.id_token_signing_alg_values_supported.every(
        (value: any) => typeof value === 'string'
      ) &&
      Array.isArray(value.code_challenge_methods_supported) &&
      value.code_challenge_methods_supported.every(
        (value: any) => typeof value === 'string'
      )
    );
  }
  return function check(value: any): value is OpenidConfiguration {
    return check_OpenidConfiguration(value);
  };
})();
