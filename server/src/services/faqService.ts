import {PrismaClient} from '@prisma/client';

const prisma = new PrismaClient();

export const faqService = {
    getAllFAQs: async () => {
        const faqs = await prisma.faq.findMany();
        return faqs;
    },

    createFAQ: async (data: { question: string; answer: string; category: string }) => {
        const faq = await prisma.faq.create({
            data: {
                pregunta: data.question,
                respuesta: data.answer,
                categoria: data.category,
            }
        });
        return faq;
    },

    updateFAQ: async (preguntaid: number, data: { question?: string; answer?: string }) => {
        const faq = await prisma.faq.update({
            where: {preguntaid},
            data: {
                pregunta: data.question,
                respuesta: data.answer,
            }
        });
        return faq;
    },

    deleteFAQ: async (preguntaid: number) => {
        const faq = await prisma.faq.delete({
            where: {preguntaid}
        });
        return faq;
    },

    getFaqsBy: async (category: string) => {
        const faqs = await prisma.faq.findMany({
            where: {
                categoria: {
                    equals: category,
                }
            }
        });
        return faqs;
    },

    getFAQByQuestion: async (question: string) => {
        const faq = await prisma.faq.findFirst({
            where: {
                pregunta: {
                    contains: question,
                    mode: 'insensitive',
                }
            }
        });
        return faq;
    },

};