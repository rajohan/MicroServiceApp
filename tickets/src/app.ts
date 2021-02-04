import "express-async-errors";

import { currentUser, errorHandler, NotFoundError } from "@rj-gittix/common";
import cookieSession from "cookie-session";
import express from "express";

import { indexTicketRouter } from "./routes";
import { createTicketRouter } from "./routes/new";
import { showTicketRouter } from "./routes/show";
import { updateTicketRouter } from "./routes/update";

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
app.use(createTicketRouter);
app.use(showTicketRouter);
app.use(indexTicketRouter);
app.use(updateTicketRouter);

// Request to invalid path
app.all("*", () => {
    throw new NotFoundError();
});

// Error handler middleware
app.use(errorHandler);

export { app };
