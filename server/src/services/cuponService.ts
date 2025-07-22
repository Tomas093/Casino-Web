import {PrismaClient} from '@prisma/client';

const prisma = new PrismaClient();

interface CuponData {
    cuponid: string
    beneficio: number;
    fechainicio: string; // ISO date string
    fechafin: string; // ISO date string
    cantidadusos: number;
    maxcarga: number;
    mincarga: number;
    vecesusadas?: number; // Optional, default is 0
}

export const cuponService = {

    getAllCupon: async () => {
        return prisma.cupon.findMany({
            orderBy: {
                fechainicio: 'asc'
            }
        });
    },

    getCuponById: async (cuponid: string) => {
        const cupon = await prisma.cupon.findUnique({
            where: {
                cuponid: cuponid
            }
        });

        if (!cupon) {
            throw new Error('Cupón no encontrado');
        }

        return cupon;
    },

    createCupon: async (cuponData: CuponData) => {
        const {beneficio, fechainicio, fechafin, cantidadusos, maxcarga, mincarga} = cuponData;

        return prisma.cupon.create({
            data: {
                cuponid: cuponData.cuponid,
                beneficio,
                fechainicio: new Date(fechainicio).toISOString(),
                fechafin: new Date(fechafin).toISOString(),
                cantidadusos,
                maxcarga,
                mincarga
            }
        });
    },

    updateCupon: async (cuponid: string, cuponData: CuponData) => {
        const {beneficio, fechainicio, fechafin, cantidadusos, maxcarga, mincarga} = cuponData;

        return prisma.cupon.update({
            where: {cuponid},
            data: {
                beneficio,
                fechainicio: new Date(fechainicio).toISOString(),
                fechafin: new Date(fechafin).toISOString(),
                cantidadusos,
                maxcarga,
                mincarga
            }
        });
    },

    updatecuponUsage: async (cuponid: string) => {
        return prisma.cupon.update({
            where: {cuponid},
            data: {
                vecesusadas: {
                    increment: 1
                }
            }
        });
    },

    deleteCupon: async (cuponid: string) => {
        return prisma.cupon.delete({
            where: {cuponid}
        });
    }
};