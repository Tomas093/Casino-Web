import {Request, Response, Router} from 'express';
import {authService} from '../services/authService';

declare module 'express-session' {
    interface Session {
        usuario?: any; // Adjust the type of 'usuario' as needed
    }
}

const router = Router();

function convertBigIntToString(obj: any) {
    return JSON.parse(JSON.stringify(obj, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
    ));
}

// Registro de usuario
router.post('/register', async (req: Request, res: Response) => {
    try {
        const usuario = await authService.register(req.body);
        res.status(201).json(usuario);
    } catch (error: any) {
        console.error("Error al registrar usuario:", error);
        res.status(400).json({message: error.message || 'Error del servidor'});
    }
});

// Login de usuario
router.post('/login', async (req: Request, res: Response) => {
    try {
        const usuario = await authService.login(req.body);

        // Guardar en sesión
        req.session.usuario = usuario;

        res.status(200).json({
            message: 'Inicio de sesión exitoso',
            usuario
        });
    } catch (error: any) {
        console.error("Error al iniciar sesión:", error);
        res.status(401).json({message: error.message || 'Email o contraseña incorrectos'});
    }
});

// Logout
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Error al cerrar sesión:", err);
            return res.status(500).json({message: 'Error del servidor'});
        }
        res.clearCookie('connect.sid');
        res.status(200).json({message: 'Sesión cerrada exitosamente'});
    });
});

// Verificar sesión
// @ts-ignore
router.get('/check-session', (req: Request, res: Response) => {
    if (req.session && req.session.usuario) {
        return res.status(200).json(req.session.usuario);
    } else {
        return res.status(401).json({message: 'No autenticado'});
    }
});

router.get('/email/:email', async (req: Request, res: Response) => {
    const {email} = req.params;

    try {
        const usuario = await authService.getUserByemail(email);
        res.status(200).json(convertBigIntToString(usuario));
    } catch (error: any) {
        console.error("Error al obtener usuario por email:", error);
        res.status(404).json({message: error.message || 'Usuario no encontrado'});
    }
});

export default router;