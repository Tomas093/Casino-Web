import {Request, Response, Router} from 'express';
import {PrismaClient} from '@prisma/client';
import bcrypt from 'bcrypt';

const router = Router();
const prisma = new PrismaClient();

// Extend the Session interface
declare module 'express-session' {
    interface Session {
        usuario?: any;
    }
}

interface AddAdminRequestBody {
    nombre: string;
    apellido: string;
    email: string;
    password: string;
    edad: number;
    dni: string;
    superadmin: boolean;
}

interface EditAdminRequestBody {
    email: string;
    superadmin: boolean;
    balance: number;
}

// Verificar si el usuario es administrador
router.get('/check-admin', async (req: Request, res: Response): Promise<void> => {
    const usuario = req.session.usuario;

    if (!usuario) {
        res.status(401).json({ message: 'No hay sesión de usuario' });
        return;
    }

    try {
        const admin = await prisma.administrador.findUnique({
            where: {usuarioid: usuario.usuarioid}
        });

        if (admin) {
            res.status(200).json({message: 'Usuario es admin'});
        } else {
            res.status(403).json({message: 'No autorizado'});
        }
    } catch (error) {
        console.error('Error al verificar admin:', error);
        res.status(500).json({message: 'Error del servidor'});
    }
});

// Verificar si el usuario es superadmin
router.get('/check-superadmin', async (req: Request, res: Response): Promise<void> => {
    const usuario = req.session.usuario;

    if (!usuario) {
        res.status(401).json({ message: 'No hay sesión de usuario' });
        return;
    }

    try {
        const admin = await prisma.administrador.findUnique({
            where: {usuarioid: usuario.usuarioid}
        });

        if (admin && admin.superadmin === true) {
            res.status(200).json({message: 'Usuario es superadmin'});
        } else {
            res.status(403).json({message: 'No autorizado'});
        }
    } catch (error) {
        console.error('Error al verificar superadmin:', error);
        res.status(500).json({message: 'Error del servidor'});
    }
});

// Obtener todos los administradores
router.get('/getAdmins', async (req: Request, res: Response): Promise<void> => {
    try {
        const admins = await prisma.administrador.findMany({
            include: {
                usuario: {
                    include: {
                        cliente: true
                    }
                }
            }
        });

        const dataConverted = admins.map(admin => ({
            ...admin,
            usuario: {
                ...admin.usuario,
                cliente: admin.usuario.cliente
                    ? {
                        ...admin.usuario.cliente,
                        balance: Number(admin.usuario.cliente.balance),
                    }
                    : null,
            },
        }));
        res.status(200).json(dataConverted);
    } catch (error) {
        console.error("Error al obtener administradores:", error);
        res.status(500).json({message: 'Error del servidor'});
    }
});

// Crear un nuevo administrador (solo superadmin puede hacerlo)
router.post('/create', async (req: Request, res: Response): Promise<void> => {
    const {nombre, apellido, email, password, edad, dni, superadmin} = req.body as AddAdminRequestBody;

    try {
        const existingUser = await prisma.usuario.findFirst({
            where: {
                OR: [
                    {email},
                    {dni}
                ]
            }
        });

        if (existingUser) {
            res.status(400).json({message: 'Ya existe un usuario con ese email o DNI'});
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const nuevoUsuario = await prisma.usuario.create({
            data: {
                nombre,
                apellido,
                email,
                password: hashedPassword,
                edad: edad.toString(),
                dni
            }
        });

        // Crear cliente asociado
        await prisma.cliente.create({
            data: {
                usuarioid: nuevoUsuario.usuarioid,
                balance: 0,
                influencer: false,
            }
        });

        // Crear administrador asociado
        await prisma.administrador.create({
            data: {
                usuarioid: nuevoUsuario.usuarioid,
                superadmin: superadmin,
            }
        });

        res.status(201).json(nuevoUsuario);
    } catch (error) {
        console.error("Error al registrar administrador:", error);
        res.status(500).json({message: 'Error del servidor'});
    }
});

// Editar un administrador (solo superadmin puede hacerlo)
router.put('/edit/:id', async (req: Request, res: Response): Promise<void> => {
    const {id} = req.params;
    const {email, balance, superadmin} = req.body as EditAdminRequestBody;

    try {
        const usuario = await prisma.usuario.findUnique({
            where: {usuarioid: Number(id)}
        });

        if (!usuario) {
            res.status(404).json({message: 'Usuario no encontrado'});
            return;
        }

        // Verificar si el email ya está en uso por otro usuario
        if (email !== usuario.email) {
            const existingUser = await prisma.usuario.findFirst({
                where: {
                    AND: [
                        {NOT: {usuarioid: Number(id)}},
                        {email}
                    ]
                }
            });

            if (existingUser) {
                res.status(400).json({message: 'Ya existe otro usuario con ese email'});
                return;
            }
        }

        // Actualizar usuario
        const usuarioActualizado = await prisma.usuario.update({
            where: {usuarioid: Number(id)},
            data: {email}
        });

        // Actualizar cliente
        await prisma.cliente.update({
            where: {usuarioid: Number(id)},
            data: {balance}
        });

        // Actualizar admin
        await prisma.administrador.update({
            where: {usuarioid: Number(id)},
            data: {superadmin}
        });

        const {password: _, ...usuarioSinPassword} = usuarioActualizado;

        res.status(200).json({
            message: 'Administrador actualizado exitosamente',
            usuario: usuarioSinPassword
        });
    } catch (error) {
        console.error("Error al actualizar administrador:", error);
        res.status(500).json({message: 'Error del servidor'});
    }
});

router.get('/getAdminByUserId/:id', async (req: Request, res: Response): Promise<void> => {
    const {id} = req.params;

    try {
        const admin = await prisma.administrador.findUnique({
            where: {usuarioid: Number(id)},
            include: {
                usuario: {
                    include: {
                        cliente: true
                    }
                }
            }
        });

        if (!admin) {
            res.status(404).json({message: 'Administrador no encontrado'});
            return;
        }

        const dataConverted = {
            ...admin,
            usuario: {
                ...admin.usuario,
                cliente: admin.usuario.cliente
                    ? {
                        ...admin.usuario.cliente,
                        balance: Number(admin.usuario.cliente.balance),
                    }
                    : null,
            },
        };

        res.status(200).json(dataConverted);
    } catch (error) {
        console.error("Error al obtener administrador:", error);
        res.status(500).json({message: 'Error del servidor'});
    }
});

export default router;