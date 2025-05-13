import {Request, Response, Router} from 'express';
import {isAuthenticated} from '../middlewares/authMiddleware';
import {ticketService} from '../services/ticketService';

const router = Router();

router.get('/client/:id', isAuthenticated, async (req: Request, res: Response) => {
    const clientId = parseInt(req.params.id);

    try {
        const tickets = await ticketService.getTicketsByClientId(clientId);
        res.status(200).json(tickets);
    } catch (error) {
        console.error('Error fetching tickets:', error);
        res.status(500).json({message: 'Error fetching tickets'});
    }
});

router.get('/admin/:id', isAuthenticated, async (req: Request, res: Response) => {
    const adminId = parseInt(req.params.id);

    try {
        const tickets = await ticketService.getTicketsByAdminId(adminId);
        res.status(200).json(tickets);
    } catch (error) {
        console.error('Error fetching tickets:', error);
        res.status(500).json({message: 'Error fetching tickets'});
    }
});

router.put('/edit/:id', isAuthenticated, async (req: Request, res: Response) => {
    const ticketId = parseInt(req.params.id);

    try {
        // Forward all fields from req.body, not just resuelto and fechacierre
        const updatedTicket = await ticketService.editTicket(ticketId, req.body);
        res.status(200).json(updatedTicket);
    } catch (error) {
        console.error('Error updating ticket:', error);
        res.status(500).json({message: 'Error updating ticket'});
    }
});

router.get('/:id', isAuthenticated, async (req: Request, res: Response) => {
    const ticketId = parseInt(req.params.id);

    try {
        const ticket = await ticketService.getTicketById(ticketId);
        res.status(200).json(ticket);
    } catch (error) {
        console.error('Error fetching ticket:', error);
        res.status(500).json({message: 'Error fetching ticket'});
    }
});


router.post('/create', isAuthenticated, async (req: Request, res: Response) => {
    const {clienteid, problema, prioridad, categoria} = req.body;

    try {
        const newTicket = await ticketService.createTicket({
            clienteid,
            problema,
            prioridad,
            categoria
        });
        res.status(201).json(newTicket);
    } catch (error) {
        console.error('Error creating ticket:', error);
        res.status(500).json({message: 'Error creating ticket'});
    }
})

export default router;

