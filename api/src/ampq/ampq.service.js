import amqplib from 'amqplib';
import { serialize, deserialize } from "v8";

export class AmpqProvider {
    static channels = [];

    static async connect(config) {
        this.connection = await amqplib.connect(config);
    }

    static async sendEventToTheQueue(queueName, payload) {
        try {
            let channel;

            const existingChannel = this.channels.find(channel => channel.queueName === queueName);

            if (!existingChannel) {
                channel = await this.connection.createChannel();
                this.channels.push({ queueName, channel })
            } else {
                channel = existingChannel.channel;
            }

            console.info(`Sending information: ${JSON.stringify(payload)} to the queue: ${queueName} `)

            await channel.sendToQueue(queueName, serialize(payload));

            return { error: null, data: true }
        }
        catch (err) {
            console.error(err);

            return { error: err, data: null }
        }
    }

    static async subscribeToEvent(queueName, handler) {
        try {
            let channel;

            const existingChannel = this.channels.find(channel => channel.queueName === queueName);

            if (!existingChannel) {
                channel = await this.connection.createChannel();

                this.channels.push({ queueName, channel, handler })
            } else {
                channel = existingChannel.channel;
            }

            await channel.assertQueue(queueName);

            channel.consume(queueName, (msg) => {
                if (msg !== null) {
                    const payload = deserialize(msg.content);
                    console.info(`Receiving information: ${JSON.stringify(payload)} from the queue: ${queueName} `)

                    handler(payload)
                    channel.ack(msg);
                } else {
                    console.log('Consumer cancelled by server');
                }
            });
        }
        catch (err) {
            console.error(err);

            return { error: err, data: null }
        }
    }
}