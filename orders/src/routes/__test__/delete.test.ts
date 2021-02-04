import { OrderStatus } from "@rj-gittix/common";
import mongoose from "mongoose";
import request from "supertest";

import { app } from "../../app";
import { Ticket } from "../../models/ticket";
import { natsWrapper } from "../../nats-wrapper";

it("has a route handler listening to DELETE requests at /api/orders/:orderId", async () => {
    const response = await request(app).delete(`/api/orders/fakeid`);

    expect(response.status).not.toEqual(404);
});

it("returns an error code 401 if not signed in", async () => {
    await request(app).delete("/api/orders/fakeid").send({}).expect(401);
});

it("returns a status other then 401 if signed in", async () => {
    const response = await request(app)
        .delete("/api/orders/fakeid")
        .set("Cookie", global.signin())
        .send({});

    expect(response.status).not.toEqual(401);
});

it("returns a 404 if the order is not found", async () => {
    const orderId = new mongoose.Types.ObjectId().toHexString();

    await request(app)
        .delete(`/api/orders/${orderId}`)
        .set("Cookie", global.signin())
        .send()
        .expect(404);
});

it("returns a 401 if a user tries to cancel another users order", async () => {
    const ticket = Ticket.build({
        id: mongoose.Types.ObjectId().toHexString(),
        title: "concert",
        price: 20
    });

    await ticket.save();

    const { body: order } = await request(app)
        .post("/api/orders")
        .set("Cookie", global.signin())
        .send({ ticketId: ticket.id })
        .expect(201);

    await request(app)
        .delete(`/api/orders/${order.id}`)
        .set("Cookie", global.signin())
        .send()
        .expect(401);
});

it("marks an order as cancelled", async () => {
    const ticket = Ticket.build({
        id: mongoose.Types.ObjectId().toHexString(),
        title: "concert",
        price: 20
    });

    await ticket.save();

    const user = global.signin();

    const { body: order } = await request(app)
        .post("/api/orders")
        .set("Cookie", user)
        .send({ ticketId: ticket.id })
        .expect(201);

    await request(app)
        .delete(`/api/orders/${order.id}`)
        .set("Cookie", user)
        .send()
        .expect(204);

    const { body: fetchedOrder } = await request(app)
        .get(`/api/orders/${order.id}`)
        .set("Cookie", user)
        .send()
        .expect(200);

    expect(fetchedOrder.id).toEqual(order.id);
    expect(fetchedOrder.status).toEqual(OrderStatus.Cancelled);
});

it("emits and order cancelled event", async () => {
    const ticket = Ticket.build({
        id: mongoose.Types.ObjectId().toHexString(),
        title: "concert",
        price: 20
    });

    await ticket.save();

    const user = global.signin();

    const { body: order } = await request(app)
        .post("/api/orders")
        .set("Cookie", user)
        .send({ ticketId: ticket.id })
        .expect(201);

    await request(app)
        .delete(`/api/orders/${order.id}`)
        .set("Cookie", user)
        .send()
        .expect(204);

    expect(natsWrapper.client.publish).toHaveBeenCalledTimes(2);
});
