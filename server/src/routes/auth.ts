import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import 'express-session';

// Extender la interfaz Session para incluir nuestra propiedad usuario
declare module 'express-session' {
    interface Session {
        usuario?: any;
    }
}

const router = Router();
const prisma = new PrismaClient();

interface RegisterRequestBody {
    nombre: string;
    apellido: string;
    email: string;
    password: string;
    edad: number;
    dni: string;
}

interface LoginRequestBody {
    email: string;
    password: string;
}


// @ts-ignore
router.post('/register', async (req: Request, res: Response) => {
    const { nombre, apellido, email, password, edad, dni } = req.body as RegisterRequestBody;
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

        //crear nuevo cliente

        await prisma.cliente.create({
            data: {
                usuarioid: nuevoUsuario.usuarioid,
                balance: 0,
                influencer: false,
            }
        });

        res.status(201).json(nuevoUsuario);
    } catch (error) {
        console.error("Error al registrar usuario:", error);
        res.status(500).json({ message: 'Error del servidor' });
    }
});

// @ts-ignore
router.post('/login', async (req: Request, res: Response) => {
    const { email, password } = req.body as LoginRequestBody;

    try {
        const usuario = await prisma.usuario.findUnique({ where: { email } });

        if (!usuario || !usuario.password || !(await bcrypt.compare(password, usuario.password))) {
            return res.status(401).json({ message: 'Email o contraseña incorrectos' });
        }

        const { password: _, ...usuarioSinPassword } = usuario;

        // Ahora podemos acceder directamente a req.session.usuario
        req.session.usuario = usuarioSinPassword;

        res.status(200).json({
            message: 'Inicio de sesión exitoso',
            usuario: usuarioSinPassword
        });
    } catch (error) {
        console.error("Error al iniciar sesión:", error);
        res.status(500).json({ message: 'Error del servidor' });
    }
});

router.post('/logout', (req: Request, res: Response) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Error al cerrar sesión:", err);
            return res.status(500).json({ message: 'Error del servidor' });
        }
        res.clearCookie('connect.sid'); // Limpiar la cookie de sesión
        res.status(200).json({ message: 'Sesión cerrada exitosamente' });
    });
});

// Checkear si el usuario está logueado
// @ts-ignore
router.get('/check-session', (req: Request, res: Response) => {
    if (req.session.usuario) {
        return res.status(200).json(req.session.usuario);
    } else {
        return res.status(401).json({ message: 'No autenticado' });
    }
});

//Verificar si el usuario es admin
const isAdmin = async (usuarioId: number): Promise<boolean> => {
    const admin = await prisma.administrador.findUnique({
        where: { usuarioid: usuarioId }
    });
    return admin !== null;
};

// Checkear si el usuario es admin
// @ts-ignore
router.get('/is-admin', async (req: Request, res: Response) => {
    const usuario = req.session.usuario;
    if (!usuario) {
        return res.status(401).json({ message: 'No autenticado' });
    }

    try {
        const adminResult = await isAdmin(usuario.usuarioid);
        if (adminResult) {
            res.status(200).json({ message: 'Usuario es admin' });
        } else {
            res.status(403).json({ message: 'No autorizado' });
        }
    } catch (error) {
        console.error('Error al verificar admin:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
});

// Checkear si el usuario es superadmin
// @ts-ignore
router.get('/is-superadmin', async (req: Request, res: Response) => {
    const usuario = req.session.usuario;
    if (!usuario) {
        return res.status(401).json({ message: 'No autenticado' });
    }
    try {
        const admin = await prisma.administrador.findUnique({
            where: { usuarioid: usuario.usuarioid }
        });
        if (admin && admin.superadmin === true) {
            res.status(200).json({ message: 'Usuario es superadmin' });
        } else {
            res.status(403).json({ message: 'No autorizado' });
        }
    } catch (error) {
        console.error('Error al verificar superadmin:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
});

// @ts-ignore
router.get('/user/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const usuario = await prisma.usuario.findUnique({
            where: { usuarioid: Number(id) },
            include: { cliente: true }
        });

        if (!usuario) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        if (!usuario.cliente) {
            return res.status(404).json({ message: 'Cliente no encontrado' });
        }

        // Convertir BigInt a number
        const dataConverted = JSON.parse(JSON.stringify(usuario, (key, value) =>
            typeof value === 'bigint' ? Number(value) : value
        ));

        res.status(200).json(dataConverted);
    } catch (error) {
        console.error("Error al obtener usuario:", error);
        res.status(500).json({ message: 'Error del servidor' });
    }
});

// Eliminar Usuario
// @ts-ignore
router.delete('/delete/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const usuario = await prisma.usuario.findUnique({
            where: {
                usuarioid: Number(id)
            }
        });

        if (!usuario) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        await prisma.usuario.delete({
            where: { usuarioid: Number(id) }
        });

        res.status(200).json({ message: 'Usuario eliminado exitosamente' });
    } catch (error) {
        console.error("Error al eliminar usuario:", error);
        res.status(500).json({ message: 'Error del servidor' });
    }
});

export default router;