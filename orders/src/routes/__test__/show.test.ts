import mongoose from "mongoose";
import request from "supertest";

import { app } from "../../app";
import { Ticket } from "../../models/ticket";

it("has a route handler listening to GET requests at /api/orders/:orderId", async () => {
    const response = await request(app).get(`/api/orders/fakeid`);

    expect(response.status).not.toEqual(404);
});

it("returns an error code 401 if not signed in", async () => {
    await request(app).get("/api/orders/fakeid").send({}).expect(401);
});

it("returns a status other then 401 if signed in", async () => {
    const response = await request(app)
        .get("/api/orders/fakeid")
        .set("Cookie", global.signin())
        .send({});

    expect(response.status).not.toEqual(401);
});

it("returns a 404 if the order is not found", async () => {
    const orderId = new mongoose.Types.ObjectId().toHexString();

    await request(app)
        .get(`/api/orders/${orderId}`)
        .set("Cookie", global.signin())
        .send()
        .expect(404);
});

it("returns a 401 if a user tries to fetch another users order", async () => {
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
        .get(`/api/orders/${order.id}`)
        .set("Cookie", global.signin())
        .send()
        .expect(401);
});

it("fetches the order", async () => {
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

    const { body: fetchedOrder } = await request(app)
        .get(`/api/orders/${order.id}`)
        .set("Cookie", user)
        .send()
        .expect(200);

    expect(fetchedOrder.id).toEqual(order.id);
});
