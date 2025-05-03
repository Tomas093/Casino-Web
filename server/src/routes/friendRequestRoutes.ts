import {Request, Response, Router} from 'express';
import {friendRequestService} from "../services/friendRequestService";

const router = Router();


router.get('/pending/:id_usuario', async (req: Request, res: Response) => {
    const id_usuario = parseInt(req.params.id_usuario);

    try {
        const requests = await friendRequestService.getPendingFriendRequests(id_usuario);
        res.status(200).json(requests);
    } catch (error: any) {
        console.error("Error al obtener solicitudes de amistad:", error);
        res.status(error.statusCode || 500).json({error: error.message || 'Error al obtener las solicitudes de amistad'});
    }
});

// Obtener todas las solicitudes de amistad enviadas por un usuario
router.get('/sent/:id_usuario', async (req: Request, res: Response) => {
    const id_usuario = parseInt(req.params.id_usuario);

    try {
        const requests = await friendRequestService.getSentFriendRequests(id_usuario);
        res.status(200).json(requests);
    } catch (error: any) {
        console.error("Error al obtener solicitudes de amistad enviadas:", error);
        res.status(error.statusCode || 500).json({error: error.message || 'Error al obtener las solicitudes de amistad enviadas'});
    }
});

router.get('/friends/:id_usuario', async (req: Request, res: Response) => {
    const id_usuario = parseInt(req.params.id_usuario);

    try {
        const friends = await friendRequestService.getFriends(id_usuario);
        res.status(200).json(friends);
    } catch (error: any) {
        console.error("Error al obtener amigos:", error);
        res.status(error.statusCode || 500).json({error: error.message || 'Error al obtener los amigos'});
    }
})

// Enviar una solicitud de amistad
router.post('/send', async (req: Request, res: Response) => {
    const {id_remitente, id_receptor} = req.body;

    try {
        const request = await friendRequestService.sendFriendRequest({id_remitente, id_receptor});
        res.status(201).json(request);
    } catch (error: any) {
        console.error("Error al enviar solicitud de amistad:", error);
        res.status(error.statusCode || 500).json({error: error.message || 'Error al enviar la solicitud de amistad'});
    }
});

//Delete friend
router.post('/delete', async (req: Request, res: Response) => {
    const {id_remitente, id_receptor} = req.body;

    try {
        const request = await friendRequestService.deleteFriend(id_remitente, id_receptor);
        res.status(200).json(request);
    } catch (error: any) {
        console.error("Error al eliminar amigo:", error);
        res.status(error.statusCode || 500).json({error: error.message || 'Error al eliminar el amigo'});
    }
});

// Obtener usuarios para enviar solicitudes de amistad
router.get('/getUsers/:id_usuario', async (req: Request, res: Response) => {
    const id_usuario = parseInt(req.params.id_usuario);

    try {
        const users = await friendRequestService.getUserSearch(id_usuario);
        res.status(200).json(users);
    } catch (error: any) {
        console.error("Error al obtener usuarios:", error);
        res.status(error.statusCode || 500).json({error: error.message || 'Error al obtener los usuarios'});
    }
});


// Aceptar una solicitud de amistad
router.post('/accept', async (req: Request, res: Response) => {
    const {id_remitente, id_receptor} = req.body;

    try {
        const request = await friendRequestService.acceptFriendRequest({id_remitente, id_receptor});
        res.status(200).json(request);
    } catch (error: any) {
        console.error("Error al aceptar solicitud de amistad:", error);
        res.status(error.statusCode || 500).json({error: error.message || 'Error al aceptar la solicitud de amistad'});
    }
});

// Rechazar una solicitud de amistad
router.post('/reject', async (req: Request, res: Response) => {
    const {id_remitente, id_receptor} = req.body;

    try {
        const request = await friendRequestService.rejectFriendRequest({id_remitente, id_receptor});
        res.status(200).json(request);
    } catch (error: any) {
        console.error("Error al rechazar solicitud de amistad:", error);
        res.status(error.statusCode || 500).json({error: error.message || 'Error al rechazar la solicitud de amistad'});
    }
});

// Cancelar una solicitud de amistad
router.post('/cancel', async (req: Request, res: Response) => {
    const {id_remitente, id_receptor} = req.body;

    try {
        const request = await friendRequestService.cancelFriendRequest({id_remitente, id_receptor});
        res.status(200).json(request);
    } catch (error: any) {
        console.error("Error al cancelar solicitud de amistad:", error);
        res.status(error.statusCode || 500).json({error: error.message || 'Error al cancelar la solicitud de amistad'});
    }
});


export default router;


