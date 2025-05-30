import {NextFunction, Request, Response, Router} from 'express';
import {messageService} from '../services/messageService';

const router = Router();

router.post('/create', (req: Request, res: Response, next: NextFunction) => {
    (async () => {
        try {
            const message = await messageService.createMessage(req.body);
            res.status(201).json(message);
        } catch (error) {
            next(error);
        }
    })();
});

router.get('/:ticketId', (req: Request, res: Response, next: NextFunction) => {
    (async () => {
        const ticketId = parseInt(req.params.ticketId, 10);
        if (isNaN(ticketId)) {
            return res.status(400).json({ error: 'Invalid ticket ID' });
        }

        try {
            const messages = await messageService.getMessagesByTicketId(ticketId);
            res.status(200).json(messages);
        } catch (error) {
            next(error);
        }
    })();
});

router.put('/edit/:messageId', (req: Request, res: Response, next: NextFunction) => {
    (async () => {
        const messageId = parseInt(req.params.messageId, 10);
        if (isNaN(messageId)) {
            return res.status(400).json({ error: 'Invalid message ID' });
        }

        try {
            const updatedMessage = await messageService.editMessage(messageId, req.body);
            res.status(200).json(updatedMessage);
        } catch (error) {
            next(error);
        }
    })();
});

export default router;