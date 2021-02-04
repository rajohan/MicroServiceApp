import { TicketUpdatedEvent } from "@rj-gittix/common";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";

import { Ticket } from "../../../models/ticket";
import { natsWrapper } from "../../../nats-wrapper";
import { TicketUpdatedListener } from "../ticket-updated-listener";

const setup = async () => {
    const listener = new TicketUpdatedListener(natsWrapper.client);

    const ticket = Ticket.build({
        id: mongoose.Types.ObjectId().toHexString(),
        title: "Concert",
        price: 20
    });

    await ticket.save();

    const data: TicketUpdatedEvent["data"] = {
        version: ticket.version + 1,
        id: ticket.id,
        title: "Concert edited",
        price: 25,
        userId: new mongoose.Types.ObjectId().toHexString()
    };

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    };

    return { listener, data, ticket, msg };
};

it("does not call ack if the event has a skipped version number", async () => {
    const { listener, data, msg } = await setup();

    data.version = 10;

    try {
        await listener.onMessage(data, msg);
        // eslint-disable-next-line no-empty
    } catch (err) {}

    expect(msg.ack).not.toHaveBeenCalled();
});

it("finds, updates, and saves a ticket", async () => {
    const { listener, data, ticket, msg } = await setup();

    await listener.onMessage(data, msg);

    const updatedTicket = await Ticket.findById(ticket.id);

    expect(updatedTicket?.title).toEqual(data.title);
    expect(updatedTicket?.price).toEqual(data.price);
    expect(updatedTicket?.version).toEqual(data.version);
});

it("acks the message", async () => {
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalledTimes(1);
});
