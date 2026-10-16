import { Channel, Message, Options, connect } from "amqplib";

export type ConsumerFunction = (msg: Message) => void;

export abstract class EventPublisher {
	constructor(protected readonly $channel: Channel) {
		this.$channel.on('error', (error) => { throw error; });
	}
}

type Exchange = Options.AssertExchange;
type Queue = Options.AssertQueue;
type Connect = Options.Connect;

export { connect, Exchange, Queue, Connect };