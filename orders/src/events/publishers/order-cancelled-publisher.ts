import { OrderCancelledEvent, Publisher, Subjects } from "@rj-gittix/common";

class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
    readonly subject = Subjects.OrderCancelled;
}

export { OrderCancelledPublisher };
