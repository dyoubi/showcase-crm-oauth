import { IRepository } from "@egc-io/ckit-lib";
import { LoginSession, PK_LoginSession } from "./login-session.model";

export type ILoginSessionRepository = IRepository<LoginSession, PK_LoginSession>;
export const LOGIN_SESSION_REPOSITORY: symbol = Symbol("LOGIN_SESSION_REPOSITORY");
