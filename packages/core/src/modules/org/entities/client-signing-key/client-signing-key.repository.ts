import { IRepository } from "@egc-io/ckit-lib";
import { ClientSigningKey, PK_ClientSigningKey } from "./client-signing-key.model";

export type IClientSigningKeyRepository = IRepository<ClientSigningKey, PK_ClientSigningKey>;
export const CLIENT_SIGNING_KEY_REPOSITORY: symbol = Symbol("CLIENT_SIGNING_KEY_REPOSITORY");
