import {
	Instance, IInstanceRepository, InstanceJwtPair,
	PK_InstanceJwtPair, IInstanceJwtPairRepository
} from "@ring-oauth/core";
import { PrismaRepository } from "../common/repository";

type PrismaInstanceID = { guid: string; };
export class InstanceRepo extends PrismaRepository<Instance, string, keyof PrismaInstanceID>
	implements IInstanceRepository {
	protected override $ID(v: string): PrismaInstanceID { return { guid: v }; }
}
type PrismaInstanceJWTKID = { org_id_kid: string; };
export class InstanceJWTKRepo extends PrismaRepository<InstanceJwtPair, PK_InstanceJwtPair, keyof PrismaInstanceJWTKID>
	implements IInstanceJwtPairRepository {
	protected override $ID(v: PK_InstanceJwtPair): { org_id_kid: PK_InstanceJwtPair; } { return { org_id_kid: v }; }
}