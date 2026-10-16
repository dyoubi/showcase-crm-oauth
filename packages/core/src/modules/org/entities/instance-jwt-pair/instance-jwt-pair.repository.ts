import { IRepository } from "@egc-io/ckit-lib";
import { InstanceJwtPair, PK_InstanceJwtPair } from "./instance-jwt-pair.model";

export type IInstanceJwtPairRepository = IRepository<InstanceJwtPair, PK_InstanceJwtPair>;
export const INSTANCE_JWT_PAIR_REPOSITORY: symbol = Symbol("INSTANCE_JWT_PAIR_REPOSITORY");
