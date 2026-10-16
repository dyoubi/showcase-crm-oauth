import { inject, injectable, IUseCase, log, Where, } from "@egc-io/ckit-lib";
import {
    ACCESS_TOKEN_REPOSITORY, LOGIN_SESSION_REPOSITORY, REFRESH_TOKEN_REPOSITORY,
    IAccessTokenRepository, ILoginSessionRepository, IRefreshTokenRepository,
    Revokable,
} from "@ring-oauth/core";

export type TokenCleanupUseCaseIn = void;
export type TokenCleanupUseCaseOut = void;

/**
 * Delete revoked or expired tokens & corresponding refresh tokens, then delete empty login sessions
 */
@injectable()
export class TokenCleanupUseCase implements IUseCase<TokenCleanupUseCaseIn, TokenCleanupUseCaseOut> {
    constructor(
        @inject(ACCESS_TOKEN_REPOSITORY)
        private $tokens: IAccessTokenRepository,
        @inject(REFRESH_TOKEN_REPOSITORY)
        private $refresh: IRefreshTokenRepository,
    ) { }

    async execute(input: TokenCleanupUseCaseIn): Promise<TokenCleanupUseCaseOut> {
        const cap = new Date();
        cap.setDate(cap.getDate() - 1);
        const where: Where<Revokable> = {
            revoked: true,
            revoked_at: { lt: cap }
        };
        await this.$refresh.delete(where);
        await this.$tokens.delete(where);
    }
}
