import { JSONObject } from "../../../../common";
import { I18nType } from "./i18n.schema";

/**
 * @example 
 * ```typescript
 * // lang: en
 * export default {
 *  username: "Username",
 *  email: "Email",
 *  password : "Password",
 *  login : {
 *       promptPassword: "Enter your password",
 *       promptUser: "Enter your username or email",
 *   },
 *  error : {
 *      passwordFormatInvalid: "Invalid password Format",
 *      passwordValidFormat: "Format must be",
 *  },
 * }
 * ```
 */
export class I18n implements I18nType {
    org_id: string;
    lang: string;
    page: string;
    values: JSONObject;
}

export type PK_I18n = Pick<I18n, 'org_id' | 'lang' | 'page'>;