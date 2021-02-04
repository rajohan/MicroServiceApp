import { Listener, OrderCancelledEvent, Subjects } from "@rj-gittix/common";
import { Message } from "node-nats-streaming";

import { Ticket } from "../../models/ticket";
import { TicketUpdatedPublisher } from "../publishers/ticket-updated-publisher";
import { queueGroupName } from "./queue-group-name";

class OrderCancelledListener extends Listener<OrderCancelledEvent> {
    readonly subject = Subjects.OrderCancelled;
    queueGroupName = queueGroupName;

    async onMessage(
        data: OrderCancelledEvent["data"],
        msg: Message
    ): Promise<void> {
        const ticket = await Ticket.findById(data.ticket.id);

        if (!ticket) {
            throw new Error("Ticket not found");
        }

        ticket.set({ orderId: undefined });

        const isModified = ticket.isModified();

        await ticket.save();

        if (isModified) {
            await new TicketUpdatedPublisher(this.client).publish({
                id: ticket.id,
                version: ticket.version,
                title: ticket.title,
                price: ticket.price,
                userId: ticket.userId,
                orderId: ticket.orderId
            });
        }

        msg.ack();
    }
}

export { OrderCancelledListener };
