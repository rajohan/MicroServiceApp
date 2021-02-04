import { Publisher, Subjects, TicketUpdatedEvent } from "@rj-gittix/common";

class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
    readonly subject = Subjects.TicketUpdated;
}

export { TicketUpdatedPublisher };
