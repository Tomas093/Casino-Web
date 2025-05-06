import {Router, Request, Response} from "express";
import {faqService} from "../services/faqService";

const router = Router();

router.get('/category/:category', async (req: Request, res: Response) => {
    const {category} = req.params;

    try {
        const faqs = await faqService.getFaqsBy(category);
        res.status(200).json(faqs);
    } catch (error: any) {
        console.error("Error al obtener FAQs:", error);
        res.status(error.statusCode || 500).json({error: error.message || 'Error al obtener las FAQs'});
    }
});


router.put('/edit/:id', async (req: Request, res: Response) => {
    const {id} = req.params;
    const {pregunta, respuesta} = req.body;

    try {
        const updatedFAQ = await faqService.updateFAQ(Number(id), {
            question: pregunta,
            answer: respuesta,
        });
        res.status(200).json(updatedFAQ);
    } catch (error: any) {
        console.error("Error al editar FAQ:", error);
        res.status(error.statusCode || 500).json({error: error.message || 'Error al editar la FAQ'});
    }
});

router.delete('/delete/:id', async (req: Request, res: Response) => {
    const {id} = req.params;

    try {
        const deletedFAQ = await faqService.deleteFAQ(Number(id));
        res.status(200).json(deletedFAQ);
    } catch (error: any) {
        console.error("Error al eliminar FAQ:", error);
        res.status(error.statusCode || 500).json({error: error.message || 'Error al eliminar la FAQ'});
    }
});

router.get('/question/:question', async (req: Request, res: Response) => {
    const {question} = req.params;

    try {
        const faq = await faqService.getFAQByQuestion(question);
        res.status(200).json(faq);
    } catch (error: any) {
        console.error("Error al obtener FAQ por pregunta:", error);
        res.status(error.statusCode || 500).json({error: error.message || 'Error al obtener la FAQ'});
    }
});

router.get('/all', async (req: Request, res: Response) => {
    try {
        const faqs = await faqService.getAllFAQs();
        res.status(200).json(faqs);
    } catch (error: any) {
        console.error("Error al obtener FAQs:", error);
        res.status(error.statusCode || 500).json({error: error.message || 'Error al obtener las FAQs'});
    }
});


router.post('/create', async (req: Request, res: Response) => {
    const {pregunta, respuesta, categoria} = req.body;

    try {
        const faq = await faqService.createFAQ({
            question: pregunta,
            answer: respuesta,
            category: categoria,
        });
        res.status(201).json(faq);
    } catch (error: any) {
        console.error("Error al crear FAQ:", error);
        res.status(error.statusCode || 500).json({error: error.message || 'Error al crear la FAQ'});
    }
});



export default router;