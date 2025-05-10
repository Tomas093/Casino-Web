import {Request, Response, Router} from 'express';
import {gameService} from "../services/gameService";

const router = Router();

router.get('/all', async (req: Request, res: Response) => {
    try {
        const game = await gameService.getAllGames();
        res.status(200).json(game);
    } catch (error: any) {
        console.error("Error al obtener todos los juegos:", error);
        res.status(error.statusCode || 500).json({error: error.message || 'Error al obtener los juegos'});
    }
})

router.post('/create', async (req: Request, res: Response) => {
    const {nombre, estado} = req.body;
    try {
        const game = await gameService.createGame({
            nombre,
            estado,
        });
        res.status(201).json(game);
    } catch (error: any) {
        console.error("Error al crear juego:", error);
        res.status(error.statusCode || 500).json({error: error.message || 'Error al crear el juego'});
    }
})

router.get('/:gameid', async (req: Request, res: Response) => {
    const {gameid} = req.params;

    try {
        const game = await gameService.getGameById(parseInt(gameid));
        res.status(200).json(game);
    } catch (error: any) {
        console.error("Error al obtener juego:", error);
        res.status(error.statusCode || 500).json({error: error.message || 'Error al obtener el juego'});
    }
})

router.put('/edit/:gameid', async (req: Request, res: Response) => {
    const {gameid} = req.params;
    const {nombre, estado} = req.body;

    try {
        const game = await gameService.updateGame(parseInt(gameid), {
            nombre,
            estado: estado,
        });
        res.status(200).json(game);
    } catch (error: any) {
        console.error("Error al actualizar juego:", error);
        res.status(error.statusCode || 500).json({error: error.message || 'Error al actualizar el juego'});
    }
})

router.delete('/delete/:gameid', async (req: Request, res: Response) => {
    const {gameid} = req.params;

    try {
        await gameService.deleteGame(parseInt(gameid));
        res.status(204).send();
    } catch (error: any) {
        console.error("Error al eliminar juego:", error);
        res.status(error.statusCode || 500).json({error: error.message || 'Error al eliminar el juego'});
    }
})

export default router;


