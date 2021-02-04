import { OrderCreatedEvent, Publisher, Subjects } from "@rj-gittix/common";

class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
    readonly subject = Subjects.OrderCreated;
}

export { OrderCreatedPublisher };
