import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

interface UserPayload {
    id: string;
    email: string;
}

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Express {
        interface Request {
            currentUser?: UserPayload;
        }
    }
}

const currentUser = (
    req: Request,
    _res: Response,
    next: NextFunction
): void => {
    if (!req.session?.jwt) {
        return next();
    }

    try {
        req.currentUser = jwt.verify(
            req.session.jwt,
            process.env.JWT_KEY as string
        ) as UserPayload;

        next();
    } catch (err) {
        next();
    }
};

export { currentUser };
