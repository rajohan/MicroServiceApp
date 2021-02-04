import "express-async-errors";

import { currentUser, errorHandler, NotFoundError } from "@rj-gittix/common";
import cookieSession from "cookie-session";
import express from "express";

import { indexOrderRouter } from "./routes";
import { deleteOrderRouter } from "./routes/delete";
import { newOrderRouter } from "./routes/new";
import { showOrderRouter } from "./routes/show";

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
app.use(currentUser);

// Routes
app.use(indexOrderRouter);
app.use(deleteOrderRouter);
app.use(newOrderRouter);
app.use(showOrderRouter);

// Request to invalid path
app.all("*", () => {
    throw new NotFoundError();
});

// Error handler middleware
app.use(errorHandler);

export { app };
