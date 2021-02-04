import mongoose from "mongoose";
import request from "supertest";

import { app } from "../../app";
import { Ticket } from "../../models/ticket";
import { natsWrapper } from "../../nats-wrapper";

it("returns a 401 if the user is not authenticated", async () => {
    const ticketId = new mongoose.Types.ObjectId().toHexString();

    await request(app)
        .put(`/api/tickets/${ticketId}`)
        .send({
            title: "Test title",
            price: 20
        })
        .expect(401);
});

it("returns a 401 if the user does not own the ticket", async () => {
    const response = await request(app)
        .post("/api/tickets")
        .set("Cookie", global.signin())
        .send({
            title: "Test title",
            price: 20
        })
        .expect(201);

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set("Cookie", global.signin())
        .send({
            title: "Test title edited",
            price: 1000
        })
        .expect(401);
});

it("returns a 400 if ticketId is invalid", async () => {
    const ticketId = "fakeid";

    await request(app)
        .put(`/api/tickets/${ticketId}`)
        .set("Cookie", global.signin())
        .send({
            title: "Test title",
            price: 20
        })
        .expect(400);
});

it("returns a 404 if the provided id does not exist", async () => {
    const ticketId = new mongoose.Types.ObjectId().toHexString();

    await request(app)
        .put(`/api/tickets/${ticketId}`)
        .set("Cookie", global.signin())
        .send({
            title: "Test title",
            price: 20
        })
        .expect(404);
});

it("returns a 400 if title or price is invalid", async () => {
    const cookie = global.signin();

    const response = await request(app)
        .post("/api/tickets")
        .set("Cookie", cookie)
        .send({
            title: "Test title",
            price: 20
        })
        .expect(201);

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set("Cookie", cookie)
        .send({
            title: "",
            price: 1000
        })
        .expect(400);

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set("Cookie", cookie)
        .send({
            title: "Test title edited",
            price: -10
        })
        .expect(400);

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set("Cookie", cookie)
        .send({})
        .expect(400);
});

it("rejects updates if the ticket is reserved", async () => {
    const cookie = global.signin();

    const response = await request(app)
        .post("/api/tickets")
        .set("Cookie", cookie)
        .send({
            title: "Test title",
            price: 20
        })
        .expect(201);

    const ticket = await Ticket.findById(response.body.id);

    ticket?.set({ orderId: mongoose.Types.ObjectId().toHexString() });
    await ticket?.save();

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set("Cookie", cookie)
        .send({
            title: "Test title edited",
            price: 1000
        })
        .expect(400);
});

it("updates the ticket provided valid inputs", async () => {
    const cookie = global.signin();

    const response = await request(app)
        .post("/api/tickets")
        .set("Cookie", cookie)
        .send({
            title: "Test title",
            price: 20
        })
        .expect(201);

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set("Cookie", cookie)
        .send({
            title: "Test title edited",
            price: 1000
        })
        .expect(200);

    const ticketResponse = await request(app)
        .get(`/api/tickets/${response.body.id}`)
        .send();

    expect(ticketResponse.body.title).toEqual("Test title edited");
    expect(ticketResponse.body.price).toEqual(1000);
});

it("publishes an event", async () => {
    const cookie = global.signin();

    const response = await request(app)
        .post("/api/tickets")
        .set("Cookie", cookie)
        .send({
            title: "Test title",
            price: 20
        })
        .expect(201);

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set("Cookie", cookie)
        .send({
            title: "Test title edited",
            price: 1000
        })
        .expect(200);

    expect(natsWrapper.client.publish).toHaveBeenCalledTimes(2);
});
