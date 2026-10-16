import { BadRequestException, inject, injectable, IUseCase, log, SystemException } from "@egc-io/ckit-lib";
import {
    base64url,
    CLIENT_REPOSITORY, EGrantSessionStatus, EJwkUse, EJwtSignAlg, GRANT_SESSION_STORE,
    GrantCoercion, GrantID, GrantSession, IClientRepository,
    IGrantSessionStore, IInstanceJwtPairRepository, IJtiLookupTable,
    IJwtSigner, INSTANCE_JWT_PAIR_REPOSITORY, JTI_LOOKUP_TABLE, JwtSigner
} from "@ring-oauth/core";
import { formats } from "@ring-oauth/core";
import { randomBytes } from "crypto";

export type CoerceGrantSessionUseCaseIn = GrantCoercion;
export type CoerceGrantSessionUseCaseOut = GrantSession;

const signer: IJwtSigner = new JwtSigner();
/**
 * Ensure an existing grant session for the provided parameters.
 * 
 * If a valid matching session it will be reused. Otherwise create a new one
 */
@injectable()
export class CoerceGrantSessionUseCase implements IUseCase<CoerceGrantSessionUseCaseIn, CoerceGrantSessionUseCaseOut> {


    constructor(
        @inject(GRANT_SESSION_STORE)
        private $grants: IGrantSessionStore,
        @inject(JTI_LOOKUP_TABLE)
        private $jti: IJtiLookupTable,
        @inject(CLIENT_REPOSITORY)
        private $clientRepo: IClientRepository,
        @inject(INSTANCE_JWT_PAIR_REPOSITORY)
        private $pairs: IInstanceJwtPairRepository,
    ) { }

    async execute(input: CoerceGrantSessionUseCaseIn): Promise<CoerceGrantSessionUseCaseOut> {
        let session: GrantSession | null = null;

        const coerce = { ...input };
        const grant_id = GrantID(coerce);

        // pull grant session from store
        let urn_grant = {
            org_id: coerce.org_id,
            client_id: coerce.client_id,
            grant_id,
        };
        session = await this.$grants.pull({
            org_id: coerce.org_id,
            grant_id,
            client_id: coerce.client_id,
        });

        if (session) {
            if (session.status !== EGrantSessionStatus.PENDING) {
                log.error(`grant session ${grant_id} expired`);
                throw new BadRequestException(`error_session_expired`);
            }
            const urn_lookup = { client_id: input.client_id, org_id: input.org_id, grant_id: session.grant_id, jti: session.grant_id };
            const isValidLookUp = await this.$jti.has(urn_lookup);

            if (isValidLookUp) {
                return session;
            } else {
                /**
                 * if session is invalid we flushing the current session & create a new JSON Web Token
                 * This action will invalidate active codes for the current grant_id
                 */
                session = null;
                await this.$grants.pop(urn_grant);
            }
        }

        // get client
        const client = await this.$clientRepo.findOne({
            where: {
                org_id: coerce.org_id,
                client_id: coerce.client_id,
            }
        });
        if (!client) {
            throw new BadRequestException(`unauthorized_client`);
        }

        // generate grant session

        const jwks = await this.$pairs.findOne({
            where: {
                org_id: input.org_id,
                alg: EJwtSignAlg.RS256,
                use: EJwkUse.SIG, // <-- filter correct key
            },
            sort: {
                expires_at: 'DESC',
                not_before: 'ASC',
            }
        });

        if (!jwks) {
            log.error(`json web token key pair is null`);
            throw new SystemException(`cannot generate login session token`);
        }

        const iss = formats.urn.urn('org', coerce.org_id, 'iss');
        const aud = formats.urn.urn('org', coerce.org_id, 'aud', 'auth');
        const jti = base64url(randomBytes(32));
        const jwt = await signer.sign({
            iss, aud,
            iat: Date.now(),
            exp: Date.now() + (1000 * 60 * 2), // set a 2 min TTL
            jti, login_hint: coerce.login_hint,
            prompt: coerce.prompts,
            connection: coerce.connection,
        }, jwks);
        const redirection_urn = formats.urn.urn('org', coerce.org_id, 'client', coerce.client_id, 'redirect', jti);
        session = {
            ...coerce,
            grant_id, redirection_urn,
            status: EGrantSessionStatus.PENDING,
            jwt: jwt,
        };
        let duplicate_grant_id: string | null;
        try {
            duplicate_grant_id = await this.$jti.pull({
                org_id: session.org_id,
                client_id: session.client_id,
                jti,
            });
        } catch (error) {
            throw new SystemException(`error_session_initialization`);
        }

        if (duplicate_grant_id) { throw new SystemException(`error_session_duplication`); }

        try {
            // push new grant session
            await this.$grants.push(session);
        } catch (error) {
            throw new SystemException(`error_session_initialization`);
        }

        try {
            await this.$jti.push({
                org_id: input.org_id,
                client_id: input.client_id,
                grant_id: session.grant_id,
                jti,
            });
        } catch (error) {
            log.error(error.message);
            try {
                log.warn(`grant ${session.grant_id} session initialization failure. flushing session ...`);
                await this.$grants.pop(session);
            } catch (fatal) {
                log.error(`grant ${session.grant_id} error during session flushing : ${fatal.message}`);
            }
        }
        return session;
    }
}
