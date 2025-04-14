import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface TransactionData {
    usuarioid: number;
    fecha: string;
    metodo: string;
    monto: number;
}

export const transactionService = {
    // Crear un nuevo ingreso
    createIngreso: async (data: TransactionData) => {
        const { usuarioid, fecha, metodo, monto } = data;

        if (monto <= 0) {
            throw new Error('El monto debe ser mayor a cero');
        }

        // Verificar si el usuario existe y obtener su cliente
        const cliente = await prisma.cliente.findUnique({
            where: { usuarioid }
        });

        if (!cliente) {
            throw new Error('Cliente no encontrado');
        }

        const clienteid = cliente.clienteid;

        // Crear registro de ingreso
        const ingreso = await prisma.ingreso.create({
            data: {
                fecha,
                metodo,
                monto,
                clienteid
            }
        });

        // Actualizar el balance del cliente
        await prisma.cliente.update({
            where: { clienteid },
            data: {
                balance: {
                    increment: monto
                }
            }
        });

        return ingreso;
    },

    // Crear un nuevo retiro
    createEgreso: async (data: TransactionData) => {
        const { usuarioid, fecha, metodo, monto } = data;

        if (monto <= 0) {
            throw new Error('El monto debe ser mayor a cero');
        }

        // Verificar si el usuario existe y obtener su cliente
        const cliente = await prisma.cliente.findUnique({
            where: { usuarioid }
        });

        if (!cliente) {
            throw new Error('Cliente no encontrado');
        }

        const clienteid = cliente.clienteid;

        // Verificar si tiene suficiente saldo
        if (cliente.balance === null || cliente.balance < monto) {
            throw new Error('Saldo insuficiente para realizar el retiro');
        }

        // Crear registro de egreso
        const egreso = await prisma.egreso.create({
            data: {
                fecha,
                metodo,
                monto,
                clienteid
            }
        });

        // Actualizar el balance del cliente
        await prisma.cliente.update({
            where: { clienteid },
            data: {
                balance: {
                    decrement: monto
                }
            }
        });

        return egreso;
    },

    // Obtener transacciones de un usuario
    getUserTransactions: async (userId: number) => {
        // Buscar el cliente asociado al usuario
        const cliente = await prisma.cliente.findUnique({
            where: { usuarioid: userId }
        });

        if (!cliente) {
            throw new Error('Cliente no encontrado');
        }

        const clienteid = cliente.clienteid;

        // Obtener ingresos
        const ingresos = await prisma.ingreso.findMany({
            where: { clienteid }
        });

        // Obtener egresos
        const egresos = await prisma.egreso.findMany({
            where: { clienteid }
        });

        // Transformar y combinar las transacciones
        const transacciones = [
            ...ingresos.map(ingreso => ({
                id: ingreso.ingresoid,
                tipo: 'ingreso',
                monto: Number(ingreso.monto),
                fecha: ingreso.fecha,
                metodo: ingreso.metodo,
                estado: 'completada'
            })),
            ...egresos.map(egreso => ({
                id: egreso.egresoid,
                tipo: 'retiro',
                monto: Number(egreso.monto),
                fecha: egreso.fecha,
                metodo: egreso.metodo,
                estado: 'completada'
            }))
        ];

        // Ordenar por fecha descendente (más reciente primero)
        transacciones.sort((a, b) => {
            if (!a.fecha || !b.fecha) return 0;
            return new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
        });

        return transacciones;
    }
};