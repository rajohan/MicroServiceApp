import request from "supertest";

import { app } from "../../app";

it("returns status code 201 on successful signup", async () => {
    await request(app)
        .post("/api/users/signup")
        .send({
            email: "test@test.com",
            password: "password"
        })
        .expect(201);
});

it("returns status code 400 with an invalid email", async () => {
    const response = await request(app)
        .post("/api/users/signup")
        .send({
            email: "test",
            password: "password"
        })
        .expect(400);

    expect(response.body.errors[0].message).toBe("Email must be valid");
});

it("returns status code 400 with an invalid password", async () => {
    const response = await request(app)
        .post("/api/users/signup")
        .send({
            email: "test@test.com",
            password: "pas"
        })
        .expect(400);

    expect(response.body.errors[0].message).toBe(
        "Password must be between 4 and 20 characters"
    );
});

it("returns status code 400 with missing email and password", async () => {
    await request(app)
        .post("/api/users/signup")
        .send({
            email: "test@test.com"
        })
        .expect(400);

    await request(app)
        .post("/api/users/signup")
        .send({
            password: "password"
        })
        .expect(400);

    await request(app).post("/api/users/signup").send({}).expect(400);
});

it("disallows duplicate emails", async () => {
    await request(app)
        .post("/api/users/signup")
        .send({
            email: "test@test.com",
            password: "password"
        })
        .expect(201);

    await request(app)
        .post("/api/users/signup")
        .send({
            email: "test@test.com",
            password: "password"
        })
        .expect(400);
});

it("sets a cookie after successful signup", async () => {
    const response = await request(app)
        .post("/api/users/signup")
        .send({
            email: "test@test.com",
            password: "password"
        })
        .expect(201);

    expect(response.get("Set-Cookie")).toBeDefined();
});
