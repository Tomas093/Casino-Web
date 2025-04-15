import {Router, Request, Response, NextFunction} from 'express';
import {isAuthenticated} from '../middlewares/authMiddleware';
import {gameService} from '../services/gameService';
import {PrismaClient} from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Middleware para verificar si es administrador
const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
    const usuario = req.session.usuario;

    if (!usuario) {
        res.status(401).json({message: 'No hay sesión de usuario'});
        return;
    }

    try {
        const admin = await prisma.administrador.findUnique({
            where: {usuarioid: usuario.usuarioid}
        });

        if (admin) {
            next();
        } else {
            res.status(403).json({message: 'No autorizado'});
        }
    } catch (error) {
        console.error('Error al verificar admin:', error);
        res.status(500).json({message: 'Error del servidor'});
    }
};

// Obtener todos los juegos
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const games = await gameService.getGames();
        res.status(200).json(games);
    } catch (error) {
        console.error('Error al obtener juegos:', error);
        next(error);
    }
});

// Obtener un juego por ID
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    const {id} = req.params;
    const gameId = parseInt(id, 10);

    if (isNaN(gameId)) {
        res.status(400).json({message: 'ID de juego inválido'});
        return;
    }

    try {
        const game = await gameService.getGameById(gameId);

        if (!game) {
            res.status(404).json({message: 'Juego no encontrado'});
            return;
        }

        res.status(200).json(game);
    } catch (error) {
        console.error('Error al obtener el juego:', error);
        next(error);
    }
});

// Crear un nuevo juego (solo administradores)
router.post('/', isAuthenticated, isAdmin, async (req: Request, res: Response, next: NextFunction) => {
    const {juegoid, nombre, estado} = req.body;

    if (!nombre) {
        res.status(400).json({message: 'El nombre del juego es requerido'});
        return;
    }

    try {
        const newGame = await gameService.createGame({juegoid, nombre, estado});
        res.status(201).json(newGame);
    } catch (error) {
        console.error('Error al crear el juego:', error);
        next(error);
    }
});

// Actualizar un juego (solo administradores)
router.put('/:id', isAuthenticated, isAdmin, async (req: Request, res: Response, next: NextFunction) => {
    const {id} = req.params;
    const gameId = parseInt(id, 10);
    const {nombre, estado} = req.body;

    if (isNaN(gameId)) {
        res.status(400).json({message: 'ID de juego inválido'});
        return;
    }

    try {
        const game = await gameService.getGameById(gameId);

        if (!game) {
            res.status(404).json({message: 'Juego no encontrado'});
            return;
        }

        const updatedGame = await gameService.updateGame(gameId, {nombre, estado});
        res.status(200).json(updatedGame);
    } catch (error) {
        console.error('Error al actualizar el juego:', error);
        next(error);
    }
});

// Eliminar un juego (solo administradores)
router.delete('/:id', isAuthenticated, isAdmin, async (req: Request, res: Response, next: NextFunction) => {
    const {id} = req.params;
    const gameId = parseInt(id, 10);

    if (isNaN(gameId)) {
        res.status(400).json({message: 'ID de juego inválido'});
        return;
    }

    try {
        const game = await gameService.getGameById(gameId);

        if (!game) {
            res.status(404).json({message: 'Juego no encontrado'});
            return;
        }

        await gameService.deleteGame(gameId);
        res.status(200).json({message: 'Juego eliminado exitosamente'});
    } catch (error) {
        console.error('Error al eliminar el juego:', error);
        next(error);
    }
});

export default router;