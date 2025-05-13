import {PrismaClient} from '@prisma/client';

const prisma = new PrismaClient();

interface TransactionData {
    usuarioid: number;
    fecha: string;
    metodo: string;
    monto: number;
    cuponid?: number;
}

// Funciones auxiliares privadas
const findClienteByUsuarioId = async (usuarioid: number) => {
    const cliente = await prisma.cliente.findUnique({
        where: {usuarioid}
    });

    if (!cliente) {
        throw new Error('Cliente no encontrado');
    }

    return cliente;
};

const transformTransactions = (
    ingresos: any[],
    egresos: any[]
) => {
    const transacciones = [
        ...ingresos.map(ingreso => ({
            id: ingreso.ingresoid,
            tipo: 'ingreso',
            monto: Number(ingreso.monto),
            fecha: ingreso.fecha,
            metodo: ingreso.metodo,
        })),
        ...egresos.map(egreso => ({
            id: egreso.egresoid,
            tipo: 'retiro',
            monto: Number(egreso.monto),
            fecha: egreso.fecha,
            metodo: egreso.metodo,
        }))
    ];

    // Ordenar por fecha descendente (más reciente primero)
    transacciones.sort((a, b) => {
        if (!a.fecha || !b.fecha) return 0;
        return new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
    });

    return transacciones;
};

export const transactionService = {
    // Crear un nuevo ingreso
    createIngreso: async (data: TransactionData) => {
        const {usuarioid, fecha, metodo, monto,cuponid} = data;

        if (monto <= 0) {
            throw new Error('El monto debe ser mayor a cero');
        }

        // Verificar si el usuario existe y obtener su cliente
        const cliente = await findClienteByUsuarioId(usuarioid);
        const clienteid = cliente.clienteid;

        // Crear registro de ingreso
        const ingreso = await prisma.ingreso.create({
            data: {
                fecha,
                metodo,
                monto,
                clienteid,
                cuponid
            }
        });

        // Actualizar el balance del cliente
        await prisma.cliente.update({
            where: {clienteid},
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
        const {usuarioid, fecha, metodo, monto} = data;

        if (monto <= 0) {
            throw new Error('El monto debe ser mayor a cero');
        }

        // Verificar si el usuario existe y obtener su cliente
        const cliente = await findClienteByUsuarioId(usuarioid);
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
            where: {clienteid},
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
        const cliente = await findClienteByUsuarioId(userId);
        const clienteid = cliente.clienteid;

        // Obtener ingresos
        const ingresos = await prisma.ingreso.findMany({
            where: {clienteid}
        });

        // Obtener egresos
        const egresos = await prisma.egreso.findMany({
            where: {clienteid}
        });

        return transformTransactions(ingresos, egresos);
    },

    getTotalRevenue: async () => {
        try {
            // Obtener la suma de ingresos
            const ingresoTotal = await prisma.ingreso.aggregate({
                _sum: {
                    monto: true
                }
            });

            // Obtener la suma de egresos
            const egresoTotal = await prisma.egreso.aggregate({
                _sum: {
                    monto: true
                }
            });

            // Manejo explícito de valores nulos o undefined
            const totalIngresos = ingresoTotal._sum.monto
                ? parseFloat(ingresoTotal._sum.monto.toString())
                : 0;
            const totalEgresos = egresoTotal._sum.monto
                ? parseFloat(egresoTotal._sum.monto.toString())
                : 0;

            // Calcular ganancias netas
            const gananciasNetas = totalIngresos - totalEgresos;

            return {
                totalIngresos,
                totalEgresos,
                gananciasNetas
            };
        } catch (error) {
            console.error("Error al calcular ingresos totales:", error);
            // Mensaje de error más detallado
            throw new Error(`Error al calcular ingresos totales: ${
                error instanceof Error
                    ? error.message
                    : JSON.stringify(error)
            }`);
        }
    },

    // Obtener estadísticas de transacciones agrupadas por método de pago
    getTransactionStatsByMethod: async () => {
        try {
            // Consulta para obtener el conteo de egresos por método
            const egresoStats = await prisma.egreso.groupBy({
                by: ['metodo'],
                _count: {
                    metodo: true
                }
            });

            // Consulta para obtener el conteo de ingresos por método
            const ingresoStats = await prisma.ingreso.groupBy({
                by: ['metodo'],
                _count: {
                    metodo: true
                }
            });

            // Transformar los resultados al formato esperado
            const egresos = egresoStats.map(item => ({
                metodo: item.metodo || 'Desconocido',
                total_egresos: item._count.metodo
            }));

            const ingresos = ingresoStats.map(item => ({
                metodo: item.metodo || 'Desconocido',
                total_ingresos: item._count.metodo
            }));

            // Combinar los resultados en un único objeto de respuesta
            return {
                egresos,
                ingresos
            };
        } catch (error) {
            console.error("Error al obtener estadísticas de transacciones:", error);
            throw new Error(`Error al obtener estadísticas por método de pago: ${
                error instanceof Error ? error.message : JSON.stringify(error)
            }`);
        }
    }


};