import { JSONObject } from "../../../common";

export const UserRegistrationSchema = {
  $id: 'UserRegistration',
  type: 'object',
  properties: {
    email: {
      type: 'string'
    },
    username: {
      type: 'string'
    },
    password: {
      type: 'string'
    }
  },
  required: ['email', 'username', 'password']
};

export type UserRegistration = {
  email: string;
  username: string;
  password: string;
  metadata?: JSONObject,
};
export const UserRegistration = (() => {
  function check_UserRegistration(value: any): boolean {
    return (
      typeof value === 'object' &&
      value !== null &&
      !Array.isArray(value) &&
      typeof value.email === 'string' &&
      typeof value.username === 'string' &&
      typeof value.password === 'string'
    );
  }
  return function check(value: any): value is UserRegistration {
    return check_UserRegistration(value);
  };
})();
