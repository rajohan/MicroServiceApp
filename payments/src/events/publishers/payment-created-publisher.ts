import { PaymentCreatedEvent, Publisher, Subjects } from "@rj-gittix/common";

class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
    readonly subject = Subjects.PaymentCreated;
}

export { PaymentCreatedPublisher };
