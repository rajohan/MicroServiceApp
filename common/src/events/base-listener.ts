import { Message, Stan, SubscriptionOptions } from "node-nats-streaming";

import { Subjects } from "./types/subjects";

interface Event {
    subject: Subjects;
    data: Record<string, unknown>;
}

abstract class Listener<T extends Event> {
    abstract subject: T["subject"];
    abstract queueGroupName: string;
    abstract onMessage(data: T["data"], msg: Message): void;
    protected client: Stan;
    protected achWait = 5 * 1000; // 5sec

    constructor(client: Stan) {
        this.client = client;
    }

    subscriptionOption(): SubscriptionOptions {
        return this.client
            .subscriptionOptions()
            .setManualAckMode(true)
            .setAckWait(this.achWait)
            .setDeliverAllAvailable()
            .setDurableName(this.queueGroupName);
    }

    parseMessage(msg: Message): T["data"] {
        const data = msg.getData();

        return typeof data === "string"
            ? JSON.parse(data)
            : JSON.parse(data.toString("utf8"));
    }

    listen(): void {
        const subscription = this.client.subscribe(
            this.subject,
            this.queueGroupName,
            this.subscriptionOption()
        );

        subscription.on("message", (msg: Message) => {
            console.log(
                `Message received: ${this.subject} / ${this.queueGroupName}`
            );

            const parsedData = this.parseMessage(msg);

            this.onMessage(parsedData, msg);
        });
    }
}

export { Listener };
