import { Publisher, Subjects, TicketCreatedEvent } from "@rj-gittix/common";

class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
    readonly subject = Subjects.TicketCreated;
}

export { TicketCreatedPublisher };
