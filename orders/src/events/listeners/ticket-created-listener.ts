import { Listener, Subjects, TicketCreatedEvent } from "@rj-gittix/common";
import { Message } from "node-nats-streaming";

import { Ticket } from "../../models/ticket";
import { queueGroupName } from "./queue-group-name";

class TicketCreatedListener extends Listener<TicketCreatedEvent> {
    readonly subject = Subjects.TicketCreated;
    queueGroupName = queueGroupName;

    async onMessage(
        data: TicketCreatedEvent["data"],
        msg: Message
    ): Promise<void> {
        const { id, title, price } = data;

        const ticket = Ticket.build({
            id,
            title,
            price
        });

        await ticket.save();

        msg.ack();
    }
}

export { TicketCreatedListener };
