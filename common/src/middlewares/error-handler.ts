import { NextFunction, Request, Response } from "express";

import { CustomError } from "../errors/custom-error";

const errorHandler = (
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
): Response => {
    if (err instanceof CustomError) {
        return res
            .status(err.statusCode)
            .send({ errors: err.serializeErrors() });
    }

    console.error(err);

    return res
        .status(500)
        .send({ errors: [{ message: "Something went wrong" }] });
};

export { errorHandler };
