import {
    BadRequestError,
    NotAuthorizedError,
    NotFoundError,
    requireAuth,
    validateRequest
} from "@rj-gittix/common";
import express, { Request, Response } from "express";
import { body, param } from "express-validator";

import { TicketUpdatedPublisher } from "../events/publishers/ticket-updated-publisher";
import { Ticket } from "../models/ticket";
import { natsWrapper } from "../nats-wrapper";

const router = express.Router();

router.put(
    "/api/tickets/:id",
    requireAuth,
    [
        param("id")
            .isMongoId()
            .withMessage("Id must be a valid MongoDB ObjectId"),
        body("title").not().isEmpty().withMessage("Title is required"),
        body("price")
            .isFloat({ gt: 0 })
            .withMessage("Price must be greater then 0")
    ],
    validateRequest,
    async (req: Request, res: Response) => {
        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            throw new NotFoundError();
        }

        if (ticket.userId !== (req.currentUser?.id as string)) {
            throw new NotAuthorizedError();
        }

        if (ticket.orderId) {
            throw new BadRequestError("Cannot edit a reserved ticket");
        }

        ticket.set({
            title: req.body.title,
            price: req.body.price
        });

        const isModified = ticket.isModified();

        await ticket.save();

        if (isModified) {
            await new TicketUpdatedPublisher(natsWrapper.client).publish({
                id: ticket.id,
                version: ticket.version,
                title: ticket.title,
                price: ticket.price,
                userId: ticket.userId,
                orderId: ticket.orderId
            });
        }

        res.send(ticket);
    }
);

export { router as updateTicketRouter };
