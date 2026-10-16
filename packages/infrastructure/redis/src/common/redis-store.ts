import { log } from '@egc-io/ckit-lib';
import { RedisClientType } from 'redis';
export type RedisClient = RedisClientType<{}, {}, {}, 3>;

export class RedisStoreClass {
	constructor(protected readonly $redis: Readonly<RedisClient>) {
		log.debug('RedisStoreClass');
	}

}