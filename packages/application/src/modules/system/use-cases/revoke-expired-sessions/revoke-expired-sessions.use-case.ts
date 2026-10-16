import { inject, IUseCase, log, QueryWhere, Where } from "@egc-io/ckit-lib";
import {
    Client, CLIENT_REPOSITORY, IClientRepository, ILoginSessionRepository, IResourceServerRepository,
    LOGIN_SESSION_REPOSITORY, LoginSession, PK_Client, RESOURCE_SERVER_REPO
} from "@ring-oauth/core";

import { setTimeout } from "timers/promises";

export type RevokeExpiredSessionsUseCaseIn = void;
export type RevokeExpiredSessionsUseCaseOut = void;

export class RevokeExpiredSessionsUseCase
    implements IUseCase<RevokeExpiredSessionsUseCaseIn, RevokeExpiredSessionsUseCaseOut> {

    constructor(
        @inject(LOGIN_SESSION_REPOSITORY)
        private readonly $sessions: ILoginSessionRepository,
        @inject(CLIENT_REPOSITORY)
        private readonly $clients: IClientRepository,
    ) { }

    async execute(input: RevokeExpiredSessionsUseCaseIn): Promise<RevokeExpiredSessionsUseCaseOut> {
        const cap = new Date();
        const now = Date.now() / 1000;
        cap.setDate(cap.getDate() - 1);


        const where: Where<LoginSession> = {
            revoked: false,
            revoked_at: { lt: now },
        };

        let count = await this.$sessions.count(where);
        log.info(`will revoke ${count} login session`);

        /**
         * @TODO 
         * batch select login session to revoke
         * map client to revoke list
         * prepare backchannel logout query per audience
         * emit request list
         */

        if (!count) { return; }


        let clients: Record<string, Set<string>> = {};
        const MAX_BATCH_SIZE = 1000;
        let batch = count < MAX_BATCH_SIZE ? count : MAX_BATCH_SIZE;
        let remains = count;

        let offset = 0;
        while (remains) {
            const limit = Math.min(batch, remains);
            const filter: QueryWhere<LoginSession> = { limit, offset, where, sort: { auth_time: 'ASC' } };
            let batch_count: number = await this.$sessions.count(filter);
            const sessionList = await this.$sessions.find(filter);

            const deletionList: Promise<void>[] = [];
            for (const session of sessionList) {
                const pk_session = { org_id: session.org_id, sid: session.sid, };
                let clientPK = JSON.stringify({ org_id: session.org_id.trim(), client_id: session.client_id.trim() });
                if (!clients[clientPK]) { clients[clientPK] = new Set<string>([]); }
                clients[clientPK].add(session.sid);
                this.$sessions.deleteById(pk_session);
            }

            // batch delete session list
            /**
             * @TODO make a repo function perform the batch deletion in a single request
             */
            Promise.allSettled(deletionList)
                .then(result => {
                    log.info(result.length, 'rows');
                    const errorList = result.filter(res => res.status === 'rejected')
                        .map((res, index) => `${sessionList[index].sid} ${res.reason}`)
                        .concat(('\n'));
                    log.error(`batch execution errors : ${JSON.stringify(errorList)}`);
                }).catch(log.error);

            offset += batch_count;
            remains -= batch_count;

            batch = Math.min(MAX_BATCH_SIZE, remains);
            if (remains < batch) { batch = remains; }
            else if (remains <= 0) { break; }
        }

        for (const clientPK in clients) {
            const pk: PK_Client = JSON.parse(clientPK);
            const client = await this.$clients.findById(pk);
            /**
             * @TODO if client backchannel_logout_uri construct request list
             */

            /** sleep a bit for the seek of the loop  */
            await setTimeout(25);
        }
    }
}