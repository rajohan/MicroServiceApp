import { ValidationError } from "express-validator";

import { CustomError } from "./custom-error";

class RequestValidationError extends CustomError {
    statusCode = 400;

    constructor(public errors: ValidationError[]) {
        super("invalid request parameters");
        Object.setPrototypeOf(this, RequestValidationError.prototype);
    }

    serializeErrors(): { message: string; field: string }[] {
        return this.errors.map((error) => {
            return { message: error.msg, field: error.param };
        });
    }
}

export { RequestValidationError };
