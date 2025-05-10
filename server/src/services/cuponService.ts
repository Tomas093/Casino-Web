import {PrismaClient} from '@prisma/client';

const prisma = new PrismaClient();

interface CuponData {
    beneficio: number;
    fechainicio: string;
    fechafin: string;
    cantidadusos: number;
    mincarga: number;
    maxcarga: number;
}

export const cuponService = {

    getAllCupon: async () => {
        return prisma.cupon.findMany({
            orderBy: {
                fechainicio: 'asc'
            }
        });
    },

    getCuponById: async (cuponid: number) => {
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
                beneficio,
                fechainicio: new Date(fechainicio).toISOString(),
                fechafin: new Date(fechafin).toISOString(),
                cantidadusos,
                maxcarga,
                mincarga
            }
        });
    },

    updateCupon: async (cuponid: number, cuponData: CuponData) => {
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

    deleteCupon: async (cuponid: number) => {
        return prisma.cupon.delete({
            where: {cuponid}
        });
    }
};