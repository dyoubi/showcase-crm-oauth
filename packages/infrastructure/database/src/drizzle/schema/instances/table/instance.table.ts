import { UUID } from "crypto";
import { JsonWebKey } from "crypto";

import { sql } from "drizzle-orm";
import { boolean, foreignKey, integer, jsonb, primaryKey, text, timestamp } from "drizzle-orm/pg-core";
import { JwtSignAlg, JWTUse, Kty } from "../../public/schema";
import { InstancesSchema } from "../schema";


export const InstanceTable = InstancesSchema.table('instances', {
	guid: text('guid')
		.notNull()
		.primaryKey()
		.default(sql`uuid_generate_v4()`)
		.$type<UUID>(),
	org_id: text('org_id')
		.notNull()
		.unique('uq_instance_org_id'),
	name: text('name')
		.notNull()
		.default("Instance"),
	tags: text('tags')
		.array()
		.notNull()
		.default([])
		.$type<string[]>(),
	created_at: timestamp('created_at', { precision: 3 })
		.notNull()
		.defaultNow(),
	created_by: text('created_by')
		.notNull()
		.default("system"),
	updated_at: timestamp('updated_at', { precision: 3 }),
	updated_by: text('updated_by')
});
export const InstanceJwtKeyPairTable = InstancesSchema.table('instances_jwtk_pairs',
	{
		org_id: text('org_id').notNull(),
		kid: text('kid').notNull(),
		kty: Kty('kty').notNull(),
		use: JWTUse('use').notNull(),
		alg: JwtSignAlg('alg').notNull(),
		pub: jsonb('pub').notNull().$type<JsonWebKey>(),
		priv: jsonb('priv').notNull().$type<JsonWebKey>(),
		thumbprint: text('thumbprint').notNull(),
		not_before: integer('not_before'),
		expires_at: integer('expires_at'),
		first_usage_at: integer('first_usage_at'),
		last_usage_at: integer('last_usage_at'),
		revoked: boolean('revoked'),
		revoked_at: timestamp('revoked_at', { precision: 3 }),
		created_at: timestamp('created_at', { precision: 3 }).notNull().defaultNow(),
		created_by: text('created_by').notNull().default("system"),
		updated_at: timestamp('updated_at', { precision: 3 }),
		updated_by: text('updated_by')
	},
	(InstanceJwtKeyPair) => [
		foreignKey({
			name: 'fk_instances_jwt_pairs_instance',
			columns: [InstanceJwtKeyPair.org_id],
			foreignColumns: [InstanceTable.org_id]
		})
			.onDelete('cascade')
			.onUpdate('cascade'),
		primaryKey({
			name: 'pk_instance_jwtk_pair',
			columns: [InstanceJwtKeyPair.org_id, InstanceJwtKeyPair.kid]
		})
	]);
