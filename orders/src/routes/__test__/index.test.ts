import mongoose from "mongoose";
import request from "supertest";

import { app } from "../../app";
import { Ticket } from "../../models/ticket";

it("has a route handler listening to GET requests at /api/orders", async () => {
    const response = await request(app).get("/api/orders").send({});

    expect(response.status).not.toEqual(404);
});

it("returns an error code 401 if not signed in", async () => {
    await request(app).get("/api/orders").send({}).expect(401);
});

it("returns a status other then 401 if signed in", async () => {
    const response = await request(app)
        .get("/api/orders")
        .set("Cookie", global.signin())
        .send({});

    expect(response.status).not.toEqual(401);
});

const buildTicket = async () => {
    const ticket = Ticket.build({
        id: mongoose.Types.ObjectId().toHexString(),
        title: "concert",
        price: 20
    });

    await ticket.save();

    return ticket;
};

it("fetches orders for an particular user", async () => {
    const ticketOne = await buildTicket();
    const ticketTwo = await buildTicket();
    const ticketThree = await buildTicket();

    const userOne = global.signin();
    const userTwo = global.signin();

    await request(app)
        .post("/api/orders")
        .set("Cookie", userOne)
        .send({ ticketId: ticketOne.id })
        .expect(201);

    const { body: orderOne } = await request(app)
        .post("/api/orders")
        .set("Cookie", userTwo)
        .send({ ticketId: ticketTwo.id })
        .expect(201);

    const { body: orderTwo } = await request(app)
        .post("/api/orders")
        .set("Cookie", userTwo)
        .send({ ticketId: ticketThree.id })
        .expect(201);

    const response = await request(app)
        .get("/api/orders")
        .set("Cookie", userTwo)
        .expect(200);

    expect(response.body.length).toEqual(2);
    expect(response.body[0].id).toEqual(orderOne.id);
    expect(response.body[1].id).toEqual(orderTwo.id);
    expect(response.body[0].ticket.id).toEqual(ticketTwo.id);
    expect(response.body[1].ticket.id).toEqual(ticketThree.id);
});
