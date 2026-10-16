import { IUseCase, Where, inject, injectable, log } from "@egc-io/ckit-lib";
import {

    ACCESS_TOKEN_REPOSITORY, IAccessTokenRepository,
    REFRESH_TOKEN_REPOSITORY, IRefreshTokenRepository,
    AccessToken,
    IInstanceRepository,
    INSTANCE_REPOSITORY,
    seconds
} from "@ring-oauth/core";

export type RevokeExpiredTokensUseCaseIn = void;
export type RevokeExpiredTokensUseCaseOut = void;

const MAX_BATCH_SIZE = 500;

@injectable()
export class RevokeExpiredTokensUseCase implements IUseCase<RevokeExpiredTokensUseCaseIn, RevokeExpiredTokensUseCaseOut> {
    constructor(
        @inject(INSTANCE_REPOSITORY)
        private $instances: IInstanceRepository,
        @inject(ACCESS_TOKEN_REPOSITORY)
        private $tokens: IAccessTokenRepository,
        @inject(REFRESH_TOKEN_REPOSITORY)
        private $refresh: IRefreshTokenRepository,
    ) { }

    async execute(): Promise<void> {
        const now = seconds();
        const revokation = { revoked: true, revoked_at: new Date() };

        const orgs = await this.$instances.find({ fields: ['org_id'] });
        const orgIds = orgs.map(o => o.org_id);

        for (const org_id of orgIds) {
            log.info(`revoke expired token for org ${org_id} ...`);
            const where: Where<AccessToken>[] = [{ org_id, expires: { lt: now }, revoked: { eq: false }, }];
            let count = await this.$tokens.count({ where });
            log.info(`${count} tokens to revoke`);
            let remains = count;
            const batch: number = count < MAX_BATCH_SIZE ? count : MAX_BATCH_SIZE;
            while (remains > 0) {
                log.info(`fetching ${batch} tokens`);
                const accessTokenList = await this.$tokens.find({
                    where,
                    limit: batch,
                });

                log.info(`${accessTokenList.length} token found`);
                const deletionList = accessTokenList
                    .map(at => this.$tokens
                        .update(revokation, { org_id, jti: at.jti })
                        .then(() => this.$refresh.update(revokation, { org_id, jti_access: at.jti }))
                        .catch(error => log.error(`revokation error ${error.message}`))
                    );

                await Promise.allSettled(deletionList)
                    .then(result => {
                        const msg = result.filter(res => res.status === 'rejected')
                            .map(v => `reason ${v.reason}`)
                            .join('\n');
                        log.error(`revokation error:\n${msg}`);
                    }).catch(log.error);

                remains = await this.$tokens.count({ where });
                log.info(`remains ${remains} tokens`);
            }
        }
        return;
    }
}
