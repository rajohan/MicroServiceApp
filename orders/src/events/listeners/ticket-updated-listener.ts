import { Listener, Subjects, TicketUpdatedEvent } from "@rj-gittix/common";
import { Message } from "node-nats-streaming";

import { Ticket } from "../../models/ticket";
import { queueGroupName } from "./queue-group-name";

class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
    readonly subject = Subjects.TicketUpdated;
    queueGroupName = queueGroupName;

    async onMessage(
        data: TicketUpdatedEvent["data"],
        msg: Message
    ): Promise<void> {
        const { title, price } = data;
        const ticket = await Ticket.findByIdAndPreviousVersion(data);

        if (!ticket) {
            throw new Error("Ticket not found");
        }

        ticket.set({ title, price });
        ticket.markModified("version");

        await ticket.save();

        msg.ack();
    }
}

export { TicketUpdatedListener };
