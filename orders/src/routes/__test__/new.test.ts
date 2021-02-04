import mongoose from "mongoose";
import request from "supertest";

import { app } from "../../app";
import { Order, OrderStatus } from "../../models/order";
import { Ticket } from "../../models/ticket";
import { natsWrapper } from "../../nats-wrapper";

it("has a route handler listening to POST requests at /api/orders", async () => {
    const response = await request(app).post("/api/orders").send({});

    expect(response.status).not.toEqual(404);
});

it("returns an error code 401 if not signed in", async () => {
    await request(app).post("/api/orders").send({}).expect(401);
});

it("returns a status other then 401 if signed in", async () => {
    const response = await request(app)
        .post("/api/orders")
        .set("Cookie", global.signin())
        .send({});

    expect(response.status).not.toEqual(401);
});

it("returns an error if an invalid TicketId is provided", async () => {
    await request(app)
        .post("/api/orders")
        .set("Cookie", global.signin())
        .send({
            ticketId: "fakeid"
        })
        .expect(400);

    await request(app)
        .post("/api/orders")
        .set("Cookie", global.signin())
        .send({})
        .expect(400);
});

it("returns a 404 if the provided ticketId does not exist", async () => {
    const ticketId = new mongoose.Types.ObjectId().toHexString();

    await request(app)
        .post(`/api/orders`)
        .set("Cookie", global.signin())
        .send({ ticketId })
        .expect(404);
});

it("returns a 400 if the ticket is already reserved", async () => {
    const ticket = Ticket.build({
        id: mongoose.Types.ObjectId().toHexString(),
        title: "concert",
        price: 20
    });

    await ticket.save();

    const order = Order.build({
        ticket,
        userId: new mongoose.Types.ObjectId().toHexString(),
        status: OrderStatus.Created,
        expiresAt: new Date()
    });

    await order.save();

    await request(app)
        .post("/api/orders")
        .set("Cookie", global.signin())
        .send({ ticketId: ticket.id })
        .expect(400);
});

it("reserves a ticket", async () => {
    const ticket = Ticket.build({
        id: mongoose.Types.ObjectId().toHexString(),
        title: "concert",
        price: 20
    });

    await ticket.save();

    await request(app)
        .post("/api/orders")
        .set("Cookie", global.signin())
        .send({ ticketId: ticket.id })
        .expect(201);
});

it("emits an order created event", async () => {
    const ticket = Ticket.build({
        id: mongoose.Types.ObjectId().toHexString(),
        title: "concert",
        price: 20
    });

    await ticket.save();

    await request(app)
        .post("/api/orders")
        .set("Cookie", global.signin())
        .send({ ticketId: ticket.id })
        .expect(201);

    expect(natsWrapper.client.publish).toHaveBeenCalledTimes(1);
});
