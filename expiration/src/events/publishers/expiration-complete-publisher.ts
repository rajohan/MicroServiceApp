import {
    ExpirationCompleteEvent,
    Publisher,
    Subjects
} from "@rj-gittix/common";

class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
    readonly subject = Subjects.ExpirationComplete;
}

export { ExpirationCompletePublisher };
