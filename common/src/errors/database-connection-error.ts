import { CustomError } from "./custom-error";

class DatabaseConnectionError extends CustomError {
    statusCode = 500;
    reason = "Error connecting to database";

    constructor() {
        super("Error connecting to database");
        Object.setPrototypeOf(this, DatabaseConnectionError.prototype);
    }

    serializeErrors(): { message: string }[] {
        return [{ message: this.reason }];
    }
}

export { DatabaseConnectionError };
