import { IRepository } from "@egc-io/ckit-lib";
import { Client, PK_Client } from "./client.model";

export type IClientRepository = IRepository<Client, PK_Client>;
export const CLIENT_REPOSITORY = Symbol("CLIENT_REPOSITORY");