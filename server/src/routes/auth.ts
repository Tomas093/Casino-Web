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

// Checkear si el usuario está logueado
// @ts-ignore
router.get('/check-session', (req: Request, res: Response) => {
    if (req.session.usuario) {
        return res.status(200).json(req.session.usuario);
    } else {
        return res.status(401).json({ message: 'No autenticado' });
    }
});

export default router;