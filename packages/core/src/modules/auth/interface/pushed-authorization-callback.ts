export const PushedAuthorizationCallbackSchema = {
  $id: 'PushedAuthorizationCallback',
  type: 'object',
  properties: {
    client_id: {
      type: 'string'
    },
    request_uri: {
      type: 'string'
    }
  },
  required: ['client_id', 'request_uri']
};

export type PushedAuthorizationCallback = {
  client_id: string;
  request_uri: string;
};
export const PushedAuthorizationCallback = (() => {
  function check_PushedAuthorizationCallback(value: any): boolean {
    return (
      typeof value === 'object' &&
      value !== null &&
      !Array.isArray(value) &&
      typeof value.client_id === 'string' &&
      typeof value.request_uri === 'string'
    );
  }
  return function check(value: any): value is PushedAuthorizationCallback {
    return check_PushedAuthorizationCallback(value);
  };
})();
