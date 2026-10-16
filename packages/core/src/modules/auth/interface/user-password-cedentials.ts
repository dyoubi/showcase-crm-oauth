export const UserPasswordCedentialsSchema = {
  $id: 'UserPasswordCedentials',
  type: 'object',
  properties: {
    value: {
      type: 'string'
    },
    username: {
      type: 'string'
    },
    email: {
      type: 'string'
    }
  },
  required: ['value']
};

export type UserPasswordCedentials = {
  email?: string;
  username?: string;
  value: string;
};
export const UserPasswordCedentials = (() => {
  function check_UserPasswordCedentials(value: any): boolean {
    return (
      typeof value === 'object' &&
      value !== null &&
      !Array.isArray(value) &&
      typeof value.value === 'string' &&
      (value.username !== undefined
        ? typeof value.username === 'string'
        : true) &&
      (value.email !== undefined ? typeof value.email === 'string' : true) &&
      // one of those value should be present
      (!!value.email || !!value.username)
    );
  }
  return function check(value: any): value is UserPasswordCedentials {
    return check_UserPasswordCedentials(value);
  };
})();