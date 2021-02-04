import { OrderStatus } from "@rj-gittix/common";
import mongoose from "mongoose";
import request from "supertest";

import { app } from "../../app";
import { Order } from "../../models/order";
import { Payment } from "../../models/payment";
import { stripe } from "../../stripe";

jest.mock("../../stripe");

it("has a route handler listening to POST requests at /api/payments", async () => {
    const response = await request(app).post("/api/payments").send({});

    expect(response.status).not.toEqual(404);
});

it("returns an error code 401 if not signed in", async () => {
    await request(app).post("/api/payments").send({}).expect(401);
});

it("returns a status other then 401 if signed in", async () => {
    const response = await request(app)
        .post("/api/payments")
        .set("Cookie", global.signin())
        .send({});

    expect(response.status).not.toEqual(401);
});

it("returns an error if an invalid OrderId or Token is provided", async () => {
    await request(app)
        .post("/api/payments")
        .set("Cookie", global.signin())
        .send({
            orderId: "fakeid",
            token: "fakeToken"
        })
        .expect(400);

    await request(app)
        .post("/api/payments")
        .set("Cookie", global.signin())
        .send({
            orderId: new mongoose.Types.ObjectId().toHexString(),
            token: ""
        })
        .expect(400);

    await request(app)
        .post("/api/payments")
        .set("Cookie", global.signin())
        .send({})
        .expect(400);
});

it("returns a 404 if the provided orderId does not exist", async () => {
    await request(app)
        .post(`/api/payments`)
        .set("Cookie", global.signin())
        .send({
            orderId: new mongoose.Types.ObjectId().toHexString(),
            token: "fakeToken"
        })
        .expect(404);
});

it("returns a 401 when trying to purchase an order that doesnt belong to the user", async () => {
    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        userId: new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        price: 20,
        status: OrderStatus.Created
    });

    await order.save();

    await request(app)
        .post(`/api/payments`)
        .set("Cookie", global.signin())
        .send({
            orderId: order.id,
            token: "fakeToken"
        })
        .expect(401);
});

it("returns a 400 when purchasing a cancelled order", async () => {
    const userId = mongoose.Types.ObjectId().toHexString();

    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        userId,
        version: 0,
        price: 20,
        status: OrderStatus.Cancelled
    });

    await order.save();

    await request(app)
        .post(`/api/payments`)
        .set("Cookie", global.signin(userId))
        .send({
            orderId: order.id,
            token: "fakeToken"
        })
        .expect(400);
});

it("returns a 201 with valid inputs", async () => {
    const userId = mongoose.Types.ObjectId().toHexString();

    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        userId,
        version: 0,
        price: 20,
        status: OrderStatus.Created
    });

    await order.save();

    await request(app)
        .post(`/api/payments`)
        .set("Cookie", global.signin(userId))
        .send({
            orderId: order.id,
            token: "tok_visa"
        })
        .expect(201);

    const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0];
    const chargeResult = await (stripe.charges.create as jest.Mock).mock
        .results[0].value;

    expect(chargeOptions.source).toEqual("tok_visa");
    expect(chargeOptions.amount).toEqual(20 * 100);
    expect(chargeOptions.currency).toEqual("usd");

    const payment = await Payment.findOne({
        orderId: order.id,
        stripeId: chargeResult.id
    });

    expect(payment).not.toBeNull();
    expect(payment?.orderId).toEqual(order.id);
    expect(payment?.stripeId).toEqual(chargeResult.id);
});
