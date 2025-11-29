import type { Request, Response, NextFunction } from 'express';

export const rateLimit = (limit: number) => {
    return (req: Request, res: Response, next: NextFunction) => {
        // Simple stub for rate limiting
        // In production, use redis or a proper library
        next();
    };
};
