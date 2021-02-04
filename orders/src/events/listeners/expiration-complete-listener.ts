import {
    ExpirationCompleteEvent,
    Listener,
    OrderStatus,
    Subjects
} from "@rj-gittix/common";
import { Message } from "node-nats-streaming";

import { Order } from "../../models/order";
import { OrderCancelledPublisher } from "../publishers/order-cancelled-publisher";
import { queueGroupName } from "./queue-group-name";

class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent> {
    readonly subject = Subjects.ExpirationComplete;
    queueGroupName = queueGroupName;

    async onMessage(
        data: ExpirationCompleteEvent["data"],
        msg: Message
    ): Promise<void> {
        const order = await Order.findById(data.orderId).populate("ticket");

        if (!order) {
            throw new Error("Order not found");
        }

        if (order.status === OrderStatus.Complete) {
            return msg.ack();
        }

        order.set({ status: OrderStatus.Cancelled });
        const isModified = order.isModified();

        await order.save();

        if (isModified) {
            await new OrderCancelledPublisher(this.client).publish({
                id: order.id,
                version: order.version,
                ticket: {
                    id: order.ticket.id
                }
            });
        }

        msg.ack();
    }
}

export { ExpirationCompleteListener };
