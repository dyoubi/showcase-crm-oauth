import { IRepository } from "@egc-io/ckit-lib";
import { Instance } from "./instance.model";

export type IInstanceRepository = IRepository<Instance, typeof Instance.prototype.guid>;
export const INSTANCE_REPOSITORY = Symbol('INSTANCE_REPOSITORY');
