abstract class CustomError extends Error {
    abstract statusCode: number;

    protected constructor(message: string) {
        super(message);

        // Only because we are extending a built in class (only needed if compiling to es5 or lower)
        Object.setPrototypeOf(this, CustomError.prototype);
    }

    abstract serializeErrors(): { message: string; field?: string }[];
}

export { CustomError };
