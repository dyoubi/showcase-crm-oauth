import { IRepository } from "@egc-io/ckit-lib";
import { AccessToken, PK_AccessToken } from "./access-token.model";
export type IAccessTokenRepository = IRepository<AccessToken, PK_AccessToken>;
export const ACCESS_TOKEN_REPOSITORY: symbol = Symbol("ACCESS_TOKEN_REPOSITORY");
