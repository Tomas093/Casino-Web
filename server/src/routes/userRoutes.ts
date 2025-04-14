import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { isAuthenticated, isAdmin } from '../middlewares/authMiddleware';
import { userService } from '../services/userService';
const router = Router();
const prisma = new PrismaClient();


// Función auxiliar para serializar BigInt
function serializeBigInt(data: any): any {
    if (data === null || data === undefined) return data;

    if (typeof data === 'bigint') {
        return data.toString();
    }

    if (Array.isArray(data)) {
        return data.map(serializeBigInt);
    }

    if (typeof data === 'object') {
        return Object.fromEntries(
            Object.entries(data).map(([key, value]) => [key, serializeBigInt(value)])
        );
    }

    return data;
}

// Modificación del controlador de usuario por ID
router.get('/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const usuario = await userService.getUserById(Number(id));
        res.status(200).json(serializeBigInt(usuario));
    } catch (error: any) {
        console.error("Error al obtener usuario:", error);
        res.status(error.statusCode || 500).json({ message: error.message || 'Error del servidor' });
    }
});

// Eliminar un usuario
router.delete('/:id', async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        await userService.deleteUser(Number(id));
        res.status(200).json({ message: 'Usuario eliminado exitosamente' });
    } catch (error: any) {
        console.error("Error al eliminar usuario:", error);
        res.status(error.statusCode || 500).json({ message: error.message || 'Error del servidor' });
    }
});


// Actualizar un usuario
router.put('/:id', isAuthenticated, async (req: Request, res: Response) => {
    const { id } = req.params;
    const { nombre, apellido, email, edad, dni, balance, influencer } = req.body;

    try {
        const updatedUser = await userService.updateUser(Number(id), {
            nombre,
            apellido,
            email,
            edad,
            dni,
            balance,
            influencer
        });

        res.status(200).json({
            message: 'Usuario actualizado exitosamente',
            usuario: updatedUser
        });
        // No devolver res aquí
    } catch (error: any) {
        console.error("Error al actualizar usuario:", error);
        res.status(error.statusCode || 500).json({ message: error.message || 'Error del servidor' });
        // No devolver res aquí
    }
});

// Obtener todos los usuarios (no administradores)
router.get('/', async (req: Request, res: Response) => {
    try {
        const users = await userService.getAllUsers();
        res.status(200).json(serializeBigInt(users)); // Aplicar serializeBigInt a los datos
    } catch (error: any) {
        console.error("Error al obtener usuarios:", error);
        res.status(500).json({ message: 'Error del servidor' });
    }
});

export default router;