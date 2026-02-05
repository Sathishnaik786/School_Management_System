import { Request, Response, NextFunction } from 'express';

export const auditMiddleware = (req: Request, res: Response, next: NextFunction) => {
    // TODO: Log request for audit
    next();
};
