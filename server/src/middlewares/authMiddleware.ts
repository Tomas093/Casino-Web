import {Request, Response, NextFunction} from 'express';

export const isAuthenticated = (req: Request, res: Response, next: NextFunction): void => {
    if (req.session && req.session.usuario) {
        next();
    } else {
        res.status(401).json({error: 'User not authenticated'});
    }
};
