import { OrderStatus } from "@rj-gittix/common";
import mongoose, { Document, Model, Schema } from "mongoose";

interface OrderAttrs {
    id: string;
    version: number;
    userId: string;
    price: number;
    status: OrderStatus;
}

interface OrderDoc extends Document {
    version: number;
    userId: string;
    price: number;
    status: OrderStatus;
}

interface OrderModel extends Model<OrderDoc> {
    build(attrs: OrderAttrs): OrderDoc;
    findByIdAndPreviousVersion(event: {
        id: string;
        version: number;
    }): Promise<OrderDoc | null>;
}

const orderSchema: Schema<OrderDoc, OrderModel> = new Schema(
    {
        userId: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        status: {
            type: String,
            required: true,
            enum: Object.values(OrderStatus)
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
    const { id, ...rest } = attrs;

    return new Order({
        _id: id,
        ...rest
    });
};

orderSchema.statics.findByIdAndPreviousVersion = (event: {
    id: string;
    version: number;
}) => {
    return Order.findOne({
        _id: event.id,
        version: event.version - 1
    });
};

const Order = mongoose.model("Order", orderSchema);

export { Order };
