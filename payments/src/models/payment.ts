import mongoose, { Document, Model, Schema } from "mongoose";

interface PaymentAttrs {
    orderId: string;
    stripeId: string;
}

interface PaymentDoc extends Document {
    orderId: string;
    stripeId: string;
}

interface PaymentModel extends Model<PaymentDoc> {
    build(attrs: PaymentAttrs): PaymentDoc;
}

const paymentSchema: Schema<PaymentDoc, PaymentModel> = new Schema(
    {
        orderId: {
            type: String,
            required: true
        },
        stripeId: {
            type: String,
            required: true
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

paymentSchema.statics.build = (attrs: PaymentAttrs) => {
    return new Payment(attrs);
};

const Payment = mongoose.model("Payment", paymentSchema);

export { Payment };
