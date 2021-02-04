import { OrderStatus } from "@rj-gittix/common";
import mongoose, { Document, Model, Schema } from "mongoose";

import { TicketDoc } from "./ticket";

interface OrderAttrs {
    userId: string;
    status: OrderStatus;
    expiresAt: Date;
    ticket: TicketDoc;
}

interface OrderDoc extends Document {
    userId: string;
    version: number;
    status: OrderStatus;
    expiresAt: Date;
    ticket: TicketDoc;
}

interface OrderModel extends Model<OrderDoc> {
    build(attrs: OrderAttrs): OrderDoc;
}

const orderSchema: Schema<OrderDoc, OrderModel> = new Schema(
    {
        userId: {
            type: String,
            required: true
        },
        status: {
            type: String,
            required: true,
            enum: Object.values(OrderStatus),
            default: OrderStatus.Created
        },
        expiresAt: {
            type: mongoose.Schema.Types.Date
        },
        ticket: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Ticket"
        }
    },
    {
        optimisticConcurrency: true,
        versionKey: "version",
        toJSON: {
            transform(_doc, ret) {
                ret.id = ret._id;
                delete ret._id;
            }
        }
    }
);

orderSchema.statics.build = (attrs: OrderAttrs) => {
    return new Order(attrs);
};

const Order = mongoose.model("Order", orderSchema);

export { Order, OrderStatus };
