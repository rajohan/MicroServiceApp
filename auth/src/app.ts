import "express-async-errors";

import { errorHandler, NotFoundError } from "@rj-gittix/common";
import cookieSession from "cookie-session";
import express from "express";

import { currentUserRouter } from "./routes/current-user";
import { signinRouter } from "./routes/signin";
import { signoutRouter } from "./routes/signout";
import { signupRouter } from "./routes/signup";

const app = express();
app.set("trust proxy", true);

// Middleware
app.use(express.json());
app.use(
    cookieSession({
        signed: false,
        secure: process.env.NODE_ENV !== "test",
        sameSite: "strict"
    })
);

// Routes
app.use(currentUserRouter);
app.use(signinRouter);
app.use(signoutRouter);
app.use(signupRouter);

// Request to invalid path
app.all("*", () => {
    throw new NotFoundError();
});

// Error handler middleware
app.use(errorHandler);

export { app };
