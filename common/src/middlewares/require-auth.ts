import { NextFunction, Request, Response } from "express";

import { NotAuthorizedError } from "../errors/not-authorized-error";

const requireAuth = (
    req: Request,
    _res: Response,
    next: NextFunction
): void => {
    if (!req.currentUser) {
        throw new NotAuthorizedError();
    }

    next();
};

export { requireAuth };
