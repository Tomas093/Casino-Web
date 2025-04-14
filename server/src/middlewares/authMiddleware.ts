import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Middleware corregido sin retorno incompatible
export const isAuthenticated = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (req.session && req.session.usuario.usuarioid) {
        next();
    } else {
        res.status(401).json({ message: 'No autorizado' });
    }
};


// Middleware para verificar si el usuario es administrador
export const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.session.usuario) {
        return res.status(401).json({ message: 'No autenticado' });
    }

    try {
        const admin = await prisma.administrador.findUnique({
            where: { usuarioid: req.session.usuario.usuarioid }
        });

        if (!admin) {
            return res.status(403).json({ message: 'Acceso no autorizado' });
        }

        next();
    } catch (error) {
        console.error("Error al verificar admin:", error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};

// Middleware para verificar si el usuario es superadmin
export const isSuperAdmin = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.session.usuario) {
        return res.status(401).json({ message: 'No autenticado' });
    }

    try {
        const admin = await prisma.administrador.findUnique({
            where: { usuarioid: req.session.usuario.usuarioid }
        });

        if (!admin || !admin.superadmin) {
            return res.status(403).json({ message: 'Acceso no autorizado' });
        }

        next();
    } catch (error) {
        console.error("Error al verificar superadmin:", error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};