import { Listener, OrderCreatedEvent, Subjects } from "@rj-gittix/common";
import { Message } from "node-nats-streaming";

import { Ticket } from "../../models/ticket";
import { TicketUpdatedPublisher } from "../publishers/ticket-updated-publisher";
import { queueGroupName } from "./queue-group-name";

class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    readonly subject = Subjects.OrderCreated;
    queueGroupName = queueGroupName;

    async onMessage(
        data: OrderCreatedEvent["data"],
        msg: Message
    ): Promise<void> {
        const ticket = await Ticket.findById(data.ticket.id);

        if (!ticket) {
            throw new Error("Ticket not found");
        }

        ticket.set({ orderId: data.id });

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

export { OrderCreatedListener };
