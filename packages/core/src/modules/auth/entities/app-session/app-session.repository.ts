import { AppSession, PK_AppSession } from "./app-session.model";

export type IAppSessionTable = {
	push(data: AppSession): Promise<void>;
	pull(pk: PK_AppSession): Promise<AppSession | null>;
	pop(pk: PK_AppSession): Promise<void>;
	has(pk: PK_AppSession): Promise<boolean>;
};
export const APP_SESSION_TABLE: symbol = Symbol("APP_SESSION_TABLE");
