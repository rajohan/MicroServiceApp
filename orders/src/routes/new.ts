import {
    BadRequestError,
    NotFoundError,
    requireAuth,
    validateRequest
} from "@rj-gittix/common";
import express, { Request, Response } from "express";
import { body } from "express-validator";

import { OrderCreatedPublisher } from "../events/publishers/order-created-publisher";
import { Order, OrderStatus } from "../models/order";
import { Ticket } from "../models/ticket";
import { natsWrapper } from "../nats-wrapper";

const router = express.Router();

const EXPIRATION_WINDOW_SECONDS = 60; // 15min

router.post(
    "/api/orders",
    requireAuth,
    [
        body("ticketId")
            .isMongoId()
            .withMessage("TicketId must be a valid MongoDB ObjectId")
    ],
    validateRequest,
    async (req: Request, res: Response) => {
        const { ticketId } = req.body;

        const ticket = await Ticket.findById(ticketId);

        if (!ticket) {
            throw new NotFoundError();
        }

        const isReserved = await ticket.isReserved();

        if (isReserved) {
            throw new BadRequestError("Ticket is already reserved");
        }

        const expiresAt = new Date();

        expiresAt.setSeconds(
            expiresAt.getSeconds() + EXPIRATION_WINDOW_SECONDS
        );

        const order = Order.build({
            userId: req.currentUser?.id as string,
            status: OrderStatus.Created,
            expiresAt,
            ticket
        });

        await order.save();

        await new OrderCreatedPublisher(natsWrapper.client).publish({
            id: order.id,
            version: order.version,
            status: order.status,
            userId: order.userId,
            expiresAt: order.expiresAt.toISOString(),
            ticket: {
                id: ticket.id,
                price: ticket.price
            }
        });

        res.status(201).send(order);
    }
);

export { router as newOrderRouter };
