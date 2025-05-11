import {PrismaClient} from '@prisma/client';

const prisma = new PrismaClient();

interface suspendidosData {
    usuarioid?: number;
    fechafin?: Date | null;
    razon?: string;
}


export const suspendidosService = {
    
    getsuspendidosById: async (suspendidosId: number) => {
        try {
            return await prisma.suspendidos.findUnique({
                where: {
                    suspendidoid: suspendidosId
                }
            });
        } catch (error) {
            console.error('Error al obtener el suspendidos por ID:', error);
            throw error;
        }
    },

    getAllsuspendidos: async () => {
        try {
            return await prisma.suspendidos.findMany();
        } catch (error) {
            console.error('Error al obtener todos los suspendidos:', error);
            throw error;
        }
    },

    createsuspendidos: async (suspendidosData: suspendidosData) => {
        try {
            return await prisma.suspendidos.create({
                data: suspendidosData
            });
        } catch (error) {
            console.error('Error al crear el suspendidos:', error);
            throw error;
        }
    },

    updatesuspendidos: async (suspendidosId: number, suspendidosData: suspendidosData) => {
        try {
            return await prisma.suspendidos.update({
                where: {suspendidoid: suspendidosId},
                data: suspendidosData
            });
        } catch (error) {
            console.error('Error al actualizar el suspendidos:', error);
            throw error;
        }
    },

    deletesuspendidos: async (suspendidosId: number) => {
        try {
            return await prisma.suspendidos.delete({
                where: {suspendidoid: suspendidosId}
            });
        } catch (error) {
            console.error('Error al eliminar el suspendidos:', error);
            throw error;
        }
    },

    isUseridSuspendidos: async (userid: number) => {
        try {
            const suspendidos = await prisma.suspendidos.findFirst({
                where: {
                    usuarioid: userid,
                    fechafin: null
                }
            });
            return suspendidos !== null;
        } catch (error) {
            console.error('Error al verificar si el usuario está suspendido:', error);
            throw error;
        }
    },

    // server/src/services/suspendiosService.ts
    getAllsuspendidosByUserId: async (usuarioid: number) => {
        try {
            return await prisma.suspendidos.findMany({
                where: { usuarioid }
            });
        } catch (error) {
            console.error('Error al obtener suspendidos por usuario:', error);
            throw error;
        }
    },






}
