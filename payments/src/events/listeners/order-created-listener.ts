import { Listener, OrderCreatedEvent, Subjects } from "@rj-gittix/common";
import { Message } from "node-nats-streaming";

import { Order } from "../../models/order";
import { queueGroupName } from "./queue-group-name";

class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    readonly subject = Subjects.OrderCreated;
    queueGroupName = queueGroupName;

    async onMessage(
        data: OrderCreatedEvent["data"],
        msg: Message
    ): Promise<void> {
        const order = Order.build({
            id: data.id,
            price: data.ticket.price,
            status: data.status,
            userId: data.userId,
            version: data.version
        });

        await order.save();

        msg.ack();
    }
}

export { OrderCreatedListener };
