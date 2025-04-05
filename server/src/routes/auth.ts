import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

// Backend Express (auth.ts) → gestiona la lógica y base de datos

const router = Router();
const prisma = new PrismaClient();

// @ts-ignore
router.post('/register', async (req, res) => {
    const { nombre, apellido, email, password, edad, dni } = req.body;
    try {
        const existingUser = await prisma.usuario.findFirst({
            where: {
                OR: [
                    { email },
                    { dni }
                ]
            }
        });

        if (existingUser) {
            return res.status(400).json({ message: 'Ya existe un usuario con ese email o DNI' });
        }

        const nuevoUsuario = await prisma.usuario.create({
            data: {
                nombre,
                apellido,
                email,
                password,
                edad: edad.toString(),
                dni
            }
        });

        res.status(201).json(nuevoUsuario);
    } catch (error) {
        console.error("Error al registrar usuario:", error);
        res.status(500).json({ message: 'Error del servidor' });
    }
});

export default router;