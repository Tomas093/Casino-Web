import {PrismaClient} from '@prisma/client';

const prisma = new PrismaClient();

export const faqService = {
    getAllFAQs: async () => {
        return prisma.faq.findMany();
    },

    createFAQ: async (data: { pregunta: string; respuesta: string, categoria: string }) => {
        return prisma.faq.create({
            data: {
                pregunta: data.pregunta,
                respuesta: data.respuesta,
                categoria: data.categoria,
            }
        });
    },

    updateFAQ: async (preguntaid: number, data: { pregunta?: string; respuesta?: string, categoria?: string }) => {
        return prisma.faq.update({
            where: {preguntaid},
            data: {
                pregunta: data.pregunta,
                respuesta: data.respuesta,
                categoria: data.categoria,
            }
        });
    },

    deleteFAQ: async (preguntaid: number) => {
        return prisma.faq.delete({
            where: {preguntaid}
        });
    },

    getFaqsBy: async (categoria: string) => {
        return prisma.faq.findMany({
            where: {
                categoria: {
                    equals: categoria,
                }
            }
        });
    },

    getFAQByQuestion: async (pregunta: string) => {
        return prisma.faq.findFirst({
            where: {
                pregunta: {
                    contains: pregunta,
                    mode: 'insensitive',
                }
            }
        });
    },

};