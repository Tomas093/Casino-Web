import {NextFunction, Request, Response} from 'express';
import jwt from 'jsonwebtoken';
import {PrismaClient} from '@prisma/client';

const prisma = new PrismaClient();

// Extend Express Request to include user property
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: number;
                email: string;
                isAdmin: boolean;
            };
        }
    }
}

export const authMiddleware = {
    // Middleware to verify if the user is authenticated
    verifyAuth: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const token = req.headers.authorization?.split(' ')[1];

            if (!token) {
                return res.status(401).json({message: 'Unauthorized: Token not provided'});
            }

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret') as jwt.JwtPayload;

            // Check if the user exists in the database
            const usuario = await prisma.usuario.findUnique({
                where: {usuarioid: decoded.id},
                include: {
                    administrador: true,
                },
            });

            if (!usuario) {
                return res.status(401).json({message: 'Unauthorized: User not found'});
            }

            // Add user information to the request for later use
            req.user = {
                id: usuario.usuarioid,
                email: usuario.email || '',
                isAdmin: !!usuario.administrador,
            };

            next();
        } catch (error) {
            return res.status(401).json({message: 'Unauthorized: Invalid token'});
        }
    },

    // Middleware to verify if the user is an administrator
    verifyAdmin: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const token = req.headers.authorization?.split(' ')[1];

            if (!token) {
                return res.status(401).json({message: 'Unauthorized: Token not provided'});
            }

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret') as jwt.JwtPayload;

            // Check if the user exists and is an administrator
            const usuario = await prisma.usuario.findUnique({
                where: {usuarioid: decoded.id},
                include: {
                    administrador: true,
                },
            });

            if (!usuario || !usuario.administrador) {
                return res.status(403).json({message: 'Access denied: Admin permissions required'});
            }

            // Add user information to the request
            req.user = {
                id: usuario.usuarioid,
                email: usuario.email || '',
                isAdmin: true,
            };

            next();
        } catch (error) {
            return res.status(401).json({message: 'Unauthorized: Invalid token'});
        }
    },
};