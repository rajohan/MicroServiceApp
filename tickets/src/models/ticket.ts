import mongoose, { Document, Model, Schema } from "mongoose";

interface TicketAttrs {
    title: string;
    price: number;
    userId: string;
}

interface TicketDoc extends Document {
    title: string;
    price: number;
    userId: string;
    version: number;
    orderId?: string;
}

interface TicketModel extends Model<TicketDoc> {
    build(attrs: TicketAttrs): TicketDoc;
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
        },
        userId: {
            type: String,
            required: true
        },
        orderId: {
            type: String
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
    return new Ticket(attrs);
};

const Ticket = mongoose.model("Ticket", ticketSchema);

export { Ticket };
