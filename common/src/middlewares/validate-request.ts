import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";

import { RequestValidationError } from "../errors/request-validation-error";

const validateRequest = (
    req: Request,
    _res: Response,
    next: NextFunction
): void => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        throw new RequestValidationError(errors.array());
    }

    next();
};

export { validateRequest };
