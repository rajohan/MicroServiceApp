import mongoose, { Document, Model, Schema } from "mongoose";

import { Order, OrderStatus } from "./order";

interface TicketAttrs {
    id: string;
    title: string;
    price: number;
}

export interface TicketDoc extends Document {
    title: string;
    price: number;
    version: number;
    isReserved(): Promise<boolean>;
}

interface TicketModel extends Model<TicketDoc> {
    build(attrs: TicketAttrs): TicketDoc;
    findByIdAndPreviousVersion(event: {
        id: string;
        version: number;
    }): Promise<TicketDoc | null>;
}

const ticketSchema: Schema<TicketDoc, TicketModel> = new Schema(
    {
        title: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true,
            min: 0
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

ticketSchema.statics.build = (attrs: TicketAttrs) => {
    const { id, ...rest } = attrs;

    return new Ticket({
        _id: id,
        ...rest
    });
};

ticketSchema.statics.findByIdAndPreviousVersion = (event: {
    id: string;
    version: number;
}) => {
    return Ticket.findOne({
        _id: event.id,
        version: event.version - 1
    });
};

ticketSchema.methods.isReserved = async function () {
    const existingOrder = await Order.findOne({
        ticket: this,
        status: {
            $in: [
                OrderStatus.Created,
                OrderStatus.AwaitingPayment,
                OrderStatus.Complete
            ]
        }
    });

    return !!existingOrder;
};

const Ticket = mongoose.model("Ticket", ticketSchema);

export { Ticket };
