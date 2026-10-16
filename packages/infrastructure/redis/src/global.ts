import { log } from "@egc-io/ckit-lib";
import { RedisClient } from "./common";
import { RedisClientOptions, createClient } from "redis";

let g_redis: RedisClient | null = null;

export function client(): Readonly<RedisClient> {
	if (!g_redis) {
		throw new ReferenceError(`Redis client is null`);
	}
	return g_redis;
}

export async function connect(opts: RedisClientOptions<{}, {}, {}, 3>): Promise<Readonly<RedisClient>> {
	if (!g_redis) {
		try {
			g_redis = createClient(opts);
			g_redis.on('error', (error) => {
				log.error(`redis client error : ${error.message ?? error}`);
			});
		} catch (error) {
			throw new Error(`cannot create redis client : ${error.message}`);
		};

		if (!g_redis.isOpen) {
			log.info(`connect redis client ...`);
			await g_redis.connect();
		}
	} else {
		throw new Error(`redis client already connected`);
	}
	return g_redis;
}

export async function disconnect() {
	if (!g_redis) { throw new ReferenceError(`Redis client is null`); }
	if (!g_redis.isOpen) { return; }
	log.info(`disconnect redis client ...`);
	await g_redis.close();
	g_redis = null;
	log.info(`redis client disconnected`);
}

export function isOpen(): boolean { return !!g_redis && g_redis.isOpen; }

