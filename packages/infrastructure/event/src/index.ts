import "reflect-metadata";

import { log } from "@egc-io/ckit-lib";
import { connect } from "./amq/types";
import { ChannelModel } from "amqplib";

async function run() {
	let connection: ChannelModel;
	try {
		connection = await connect({
			hostname: 'dev-farod',
			username: 'guest',
			password: 'guest',
			protocol: 'amqp'
		});
	} catch (error) {
		log.error('cannot create connection ', error.message);
		throw error;
	}

	connection.on('error', (args: any) => { log.error(args); });

	connection.on('close', (args: any) => { log.debug(args); });
	connection.on('blocked', (args: any) => { log.debug(args); });
	connection.on('unblocked', (args: any) => { log.debug(args); });


	const channel = await connection.createChannel();
	channel.on('close', (args: unknown) => log.debug('channel "close"', args));
	channel.on('error', (args: unknown) => log.error('channel "error"', args));

}

run().then(() => process.exit(0))
	.catch((error: Error) => {
		log.error('process exit with error : ', error.message);
		process.exit(1);
	});