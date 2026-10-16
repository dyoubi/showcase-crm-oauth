import { JSONObject } from "../../../../common";

export const I18nSchema = {
  $id: 'I18nSchema',
  type: 'object',
  properties: {
    org_id: {
      type: 'string'
    },
    lang: {
      type: 'string'
    },
    values: {
      type: 'string'
    },
  },
  required: ['org_id', 'lang', 'values']
};

export type I18nType = {
  org_id: string;
  lang: string;
  page: string;
  values: JSONObject;
};

export const I18nType = (() => {
  function check_I18nType(value: any): boolean {
    return (
      typeof value === 'object' &&
      value !== null &&
      !Array.isArray(value) &&
      typeof value.org_id === 'string' &&
      typeof value.lang === 'string' &&
      typeof value.values === 'string'
    );
  }
  return function check(value: any): value is I18nType {
    return check_I18nType(value);
  };
})();
