import { BadRequestException, inject, injectable, IUseCase, log } from "@egc-io/ckit-lib";
import {
    APP_SESSION_TABLE, IAppSessionTable, INSTANCE_JWT_PAIR_REPOSITORY,
    IInstanceJwtPairRepository, IJwtDecoder, JwtDecoder, seconds,
    AppSession
} from "@ring-oauth/core";

export type ValidateAppSessionUseCaseIn = {
    org_id: string;
    token: string;
};
export type ValidateAppSessionUseCaseOut = AppSession;

const decoder: IJwtDecoder = new JwtDecoder();

/**
 * Decode & validate the previous token then returns the corresponding session.
 * 
 * Fails if : 
 * - the session not exists
 * - the session is expired
 * - the signing key is not valid
 * - the provided token is not valid
 */
@injectable()
export class ValidateAppSessionUseCase implements IUseCase<ValidateAppSessionUseCaseIn, ValidateAppSessionUseCaseOut> {
    constructor(
        @inject(APP_SESSION_TABLE)
        private readonly $table: IAppSessionTable,
        @inject(INSTANCE_JWT_PAIR_REPOSITORY)
        private readonly $pairs: IInstanceJwtPairRepository,
    ) { }

    async execute(input: ValidateAppSessionUseCaseIn): Promise<ValidateAppSessionUseCaseOut> {
        const now = seconds();
        let { claims, header } = await decoder.decode(input.token);
        const kid = header.kid ? String(header.kid) : undefined;

        if (!kid) { throw new TypeError(`not a valid token: kid is  null`); }

        let jwks;
        try {
            jwks = await this.$pairs.findById({
                org_id: input.org_id,
                kid,
            });
        } catch (error) {
            throw new ReferenceError(`not a valid kid`);
        }

        try {
            header = await decoder.verify(input.token, jwks);
        } catch (error) {
            log.trace(`token verification failure: ${error.message}`);
            throw new TypeError(`not a valid token: ${error.message}`);
        }


        if ((claims.exp ?? now) < now) { throw new BadRequestException(`session_expired`); }
        if (typeof claims.sid !== 'string') { throw new BadRequestException(`session_expired`); }

        let session = await this.$table.pull({
            org_id: input.org_id,
            sid: claims.sid,
        });

        if (!session) { throw new BadRequestException(`session_expired`); }

        if (session) {
            if (session.sid !== claims.sid) {
                log.error(`token sid ${claims.sid} should be equal to ${session.sid}`);
                throw new TypeError(`not a valid token: not a valid sid`);
            }
        }

        return session;
    }
}
