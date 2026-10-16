import { ModuleDefinition, IContext, log } from "@egc-io/ckit-lib";
import {
	CODE_AUTHORIZATION_TABLE,
	GRANT_SESSION_STORE,
	ICodeAuthorizationTable,
	IJtiLookupTable,
	IGrantSessionStore,
	JTI_LOOKUP_TABLE,
	IPushAuthorizationSessionTable,
	PUSH_AUTHORIZATION_SESSION_TABLE,
	IAppSessionTable,
	APP_SESSION_TABLE,
	IUserRegistrationTicketTable,
	USER_REGISTRATION_TICKET_TABLE,
} from "@ring-oauth/core";
import { CodeAuthorizationStore } from "./code-authorization.store";
import { GrantSessionStore } from "./grant-session.store";
import { PushAuthorizationTable } from "./push-authorization-table.store";
import { AppSessionTable } from "./app-session.store";
import { JtiLookupTable } from "./jti-table.store";
import { isOpen, connect, disconnect, client } from "./global";
import { UserRegistrationTicketTable } from "./user-registration-ticket-table.store";

export const StoreModule: ModuleDefinition = {
	async setup(ioc: IContext) {
		let options = {
			socket: {
				host: process.env.REDIS_HOST ? String(process.env.REDIS_HOST) : undefined,
				port: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : undefined,
			},
			database: process.env.REDIS_DB ? Number(process.env.REDIS_DB) : 0,
			username: process.env.REDIS_USERNAME ? String(process.env.REDIS_USERNAME) : undefined,
			password: process.env.REDIS_PASS ? String(process.env.REDIS_PASS) : undefined,
		};

		log.info(`RedisOpts: ${JSON.stringify(options)}`);

		const redis = isOpen() ? client() : await connect(options);

		ioc.bind<ICodeAuthorizationTable>({ key: CODE_AUTHORIZATION_TABLE, value: new CodeAuthorizationStore(redis) });
		ioc.bind<IJtiLookupTable>({ key: JTI_LOOKUP_TABLE, value: new JtiLookupTable(redis) });
		ioc.bind<IGrantSessionStore>({ key: GRANT_SESSION_STORE, value: new GrantSessionStore(redis) });
		ioc.bind<IPushAuthorizationSessionTable>({ key: PUSH_AUTHORIZATION_SESSION_TABLE, value: new PushAuthorizationTable(redis) });
		ioc.bind<IAppSessionTable>({ key: APP_SESSION_TABLE, value: new AppSessionTable(redis) });
		ioc.bind<IUserRegistrationTicketTable>({ key: USER_REGISTRATION_TICKET_TABLE, value: new UserRegistrationTicketTable(redis) });
	},

	async shutdown() {
		if (isOpen()) { await disconnect(); }
	}
};