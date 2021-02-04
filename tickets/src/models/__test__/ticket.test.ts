import mongoose from "mongoose";

import { Ticket } from "../ticket";

it("Implements optimistic concurrency control", async () => {
    const ticket = Ticket.build({
        title: "concert",
        price: 5,
        userId: new mongoose.Types.ObjectId().toHexString()
    });

    await ticket.save();

    const firstInstance = await Ticket.findById(ticket.id);
    const secondInstance = await Ticket.findById(ticket.id);

    firstInstance?.set({ price: 10 });
    secondInstance?.set({ price: 15 });

    await firstInstance?.save();

    await expect(secondInstance?.save()).rejects.toBeInstanceOf(
        mongoose.Error.VersionError
    );
});

it("Increments the version number on multiple saves", async () => {
    let ticket = Ticket.build({
        title: "concert",
        price: 5,
        userId: new mongoose.Types.ObjectId().toHexString()
    });

    ticket = await ticket.save();
    expect(ticket.version).toEqual(0);

    ticket.set({ price: 10 });
    ticket = await ticket.save();
    expect(ticket.version).toEqual(1);

    ticket.set({ price: 15 });
    ticket = await ticket.save();
    expect(ticket.version).toEqual(2);
});
