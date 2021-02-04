import { Listener, OrderCreatedEvent, Subjects } from "@rj-gittix/common";
import { Message } from "node-nats-streaming";

import { expirationQueue } from "../../queues/expiration-queue";
import { queueGroupName } from "./queue-group-name";

class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    readonly subject = Subjects.OrderCreated;
    queueGroupName = queueGroupName;

    async onMessage(
        data: OrderCreatedEvent["data"],
        msg: Message
    ): Promise<void> {
        const delay = new Date(data.expiresAt).getTime() - new Date().getTime();
        console.log("Waiting for ms", delay);

        await expirationQueue.add(
            {
                orderId: data.id
            },
            {
                delay
            }
        );

        msg.ack();
    }
}

export default OrderCreatedListener;
