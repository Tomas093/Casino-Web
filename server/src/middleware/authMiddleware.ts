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
  // Middleware para verificar si el usuario está autenticado
  verifyAuth: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return res.status(401).json({ message: 'No autorizado: Token no proporcionado' });
      }
      
      // Verificar token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secreto_por_defecto') as jwt.JwtPayload;
      
      // Verificar si el usuario existe en la base de datos
      const usuario = await prisma.usuario.findUnique({
        where: { usuarioid: decoded.id },
        include: {
          administrador: true
        }
      });
      
      if (!usuario) {
        return res.status(401).json({ message: 'No autorizado: Usuario no encontrado' });
      }
      
      // Agregar información del usuario al request para su uso posterior
      req.user = {
        id: usuario.usuarioid,
        email: usuario.email,
        isAdmin: !!usuario.administrador
      };
      
      next();
    } catch (error) {
      return res.status(401).json({ message: 'No autorizado: Token inválido' });
    }
  },
  
  // Middleware para verificar si el usuario es administrador
  verifyAdmin: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return res.status(401).json({ message: 'No autorizado: Token no proporcionado' });
      }
      
      // Verificar token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secreto_por_defecto') as jwt.JwtPayload;
      
      // Verificar si el usuario existe y es administrador
      const usuario = await prisma.usuario.findUnique({
        where: { usuarioid: decoded.id },
        include: {
          administrador: true
        }
      });
      
      if (!usuario || !usuario.administrador) {
        return res.status(403).json({ message: 'Acceso denegado: Se requieren permisos de administrador' });
      }
      
      // Agregar información del usuario al request
      req.user = {
        id: usuario.usuarioid,
        email: usuario.email,
        isAdmin: true
      };
      
      next();
    } catch (error) {
      return res.status(401).json({ message: 'No autorizado: Token inválido' });
    }
  }
};
