import 'reflect-metadata';

import { g_context, log } from "@egc-io/ckit-lib";
import { PGModule } from "@ring-oauth/infra-database";
import { StoreModule } from "@ring-oauth/infra-redis";
import { RevokeExpiredTokensUseCase } from '@ring-oauth/application';

async function task() {
	log.info('start worker task');

	await g_context.bootstrap([PGModule, StoreModule]);
	try {
		const revokeToken = g_context.get<RevokeExpiredTokensUseCase>(RevokeExpiredTokensUseCase);
		await revokeToken.execute();
	} catch (error) {
		log.error(error.message);
	}
}

task().then().catch(log.error);