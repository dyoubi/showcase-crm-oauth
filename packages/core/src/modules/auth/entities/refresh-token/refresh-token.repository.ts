import { IRepository } from "@egc-io/ckit-lib";
import { RefreshToken } from "./refresh-token.model";
export type IRefreshTokenRepository = IRepository<RefreshToken, { org_id: string, jti: string; }>;
export const REFRESH_TOKEN_REPOSITORY: symbol = Symbol("REFRESH_TOKEN_REPOSITORY");
