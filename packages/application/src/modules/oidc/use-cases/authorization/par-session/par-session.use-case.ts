import { inject, injectable, IUseCase } from "@egc-io/ckit-lib";
import {
    Client, CodeRequest, formats, IPushAuthorizationSessionTable,
    PK_Client, PUSH_AUTHORIZATION_SESSION_TABLE,
    PushAuthorizationSession,
} from "@ring-oauth/core";
import { randomBytes } from "crypto";

export type ParSessionUseCaseIn = {
    client: Pick<Client, keyof PK_Client>;
    request: CodeRequest;
};
export type ParSessionUseCaseOut = PushAuthorizationSession;

const PAR_TTL = 60;
/**
 * Create a PAR session & returns the request_uri
 */
@injectable()
export class ParSessionUseCase implements IUseCase<ParSessionUseCaseIn, ParSessionUseCaseOut> {
    constructor(
        @inject(PUSH_AUTHORIZATION_SESSION_TABLE)
        private readonly $table: IPushAuthorizationSessionTable,
    ) { }

    async execute(input: ParSessionUseCaseIn): Promise<ParSessionUseCaseOut> {

        const hash = randomBytes(16).toString('base64url');
        const request_uri = formats.urn.urn('client', input.client.client_id, 'par', hash);
        const now = Date.now() / 1000;
        const session: PushAuthorizationSession = {
            org_id: input.client.org_id,
            client_id: input.client.client_id,
            expires_at: now + PAR_TTL,
            request: {
                ...input.request,
                client_id: input.request.client_id,
            },
            request_uri,
            issued: false,
            issued_at: null
        };
        await this.$table.push(session);
        return session;
    }
}
