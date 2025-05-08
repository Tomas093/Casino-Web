import {PrismaClient} from '@prisma/client';

const prisma = new PrismaClient();

const highValueLimit = 100000;

export const adminstaticsService = {

    getIngresoByMethod: async () => {
        try {
            const ingresos = await prisma.ingreso.groupBy({
                by: ['metodo'],
                _sum: {
                    monto: true
                }
            });

            return ingresos.map(ingreso => ({
                metodo: ingreso.metodo || 'Desconocido',
                total: ingreso._sum.monto ? Number(ingreso._sum.monto) : 0
            }));
        } catch (error) {
            console.error('Error al obtener ingresos por método:', error);
            throw error;
        }
    },

    getEgresoByMethod: async () => {
        try {
            const egresos = await prisma.egreso.groupBy({
                by: ['metodo'],
                _sum: {
                    monto: true
                }
            });

            return egresos.map(egreso => ({
                metodo: egreso.metodo || 'Desconocido',
                total: egreso._sum.monto ? Number(egreso._sum.monto) : 0
            }));
        } catch (error) {
            console.error('Error al obtener egresos por método:', error);
            throw error;
        }
    },

    getTotalRevenue: async () => {
        try {
            const totalIngresos = await prisma.ingreso.aggregate({
                _sum: {
                    monto: true
                }
            });

            const totalEgresos = await prisma.egreso.aggregate({
                _sum: {
                    monto: true
                }
            });

            // Convert Decimal to Number for arithmetic operations
            const ingresoTotal = totalIngresos._sum.monto ? Number(totalIngresos._sum.monto) : 0;
            const egresoTotal = totalEgresos._sum.monto ? Number(totalEgresos._sum.monto) : 0;
            const gananciasNetas = ingresoTotal - egresoTotal;

            return {
                totalIngresos: ingresoTotal,
                totalEgresos: egresoTotal,
                gananciasNetas
            };
        } catch (error) {
            console.error('Error al calcular ingresos totales:', error);
            throw error;
        }
    },

    getTransactionStatsByMethod: async () => {
        try {
            const egresoStats = await prisma.egreso.groupBy({
                by: ['metodo'],
                _count: {
                    metodo: true
                }
            });

            const ingresoStats = await prisma.ingreso.groupBy({
                by: ['metodo'],
                _count: {
                    metodo: true
                }
            });

            // Format the response for better usability
            const egresos = egresoStats.map(item => ({
                metodo: item.metodo || 'Desconocido',
                total_egresos: item._count.metodo
            }));

            const ingresos = ingresoStats.map(item => ({
                metodo: item.metodo || 'Desconocido',
                total_ingresos: item._count.metodo
            }));

            return {egresos, ingresos};
        } catch (error) {
            console.error('Error al obtener estadísticas de transacciones por método:', error);
            throw error;
        }
    },

    getTotalUsers: async () => {
        try {
            return await prisma.usuario.count();
        } catch (error) {
            console.error('Error al obtener el total de usuarios:', error);
            throw error;
        }
    },

    getTotalAdmins: async () => {
        try {
            return await prisma.administrador.count();
        } catch (error) {
            console.error('Error al obtener el total de administradores:', error);
            throw error;
        }
    },

    getTotalSuperAdmins: async () => {
        try {
            return await prisma.administrador.count({
                where: {
                    superadmin: true
                }
            });
        } catch (error) {
            console.error('Error al obtener el total de superadministradores:', error);
            throw error;
        }
    },

    getTotalTickets: async () => {
        try {
            return await prisma.ticket.count();
        } catch (error) {
            console.error('Error al obtener el total de tickets:', error);
            throw error;
        }
    },

    getTotalGames: async () => {
        try {
            return await prisma.juego.count();
        } catch (error) {
            console.error('Error al obtener el total de juegos:', error);
            throw error;
        }
    },

    getTotalIngresos: async () => {
        try {
            return await prisma.ingreso.count();
        } catch (error) {
            console.error('Error al obtener el total de ingresos:', error);
            throw error;
        }
    },

    getTotalEgresos: async () => {
        try {
            return await prisma.egreso.count();
        } catch (error) {
            console.error('Error al obtener el total de egresos:', error);
            throw error;
        }
    },

    getTotalPromocion: async () => {
        try {
            return await prisma.cupon.count();
        } catch (error) {
            console.error('Error al obtener el total de cupones:', error);
            throw error;
        }
    },

    getTotalIngresosWithPromocion: async () => {
        try {
            return await prisma.ingreso.count({
                where: {
                    cuponid: {
                        not: null
                    }
                }
            });
        } catch (error) {
            console.error('Error al obtener el total de ingresos con promoción:', error);
            throw error;
        }
    },

    getAllRecentActivities: async () => {
        try {
            const bigWins = await prisma.jugada.findMany({
                where: {
                    retorno: {
                        gt: highValueLimit
                    }
                },
                include: {
                    cliente: {
                        include: {
                            usuario: true
                        }
                    },
                    juego: true
                },
                orderBy: {
                    fecha: 'desc'
                },
                take: 50
            });

            const highDeposits = await prisma.ingreso.findMany({
                where: {
                    monto: {
                        gt: highValueLimit
                    }
                },
                include: {
                    cliente: {
                        include: {
                            usuario: true
                        }
                    }
                },
                orderBy: {
                    fecha: 'desc'
                },
                take: 50
            });

            const highWithdrawals = await prisma.egreso.findMany({
                where: {
                    monto: {
                        gt: highValueLimit
                    }
                },
                include: {
                    cliente: {
                        include: {
                            usuario: true
                        }
                    }
                },
                orderBy: {
                    fecha: 'desc'
                },
                take: 50
            });

            // Format the activities for consistent response
            const formattedBigWins = bigWins.map(win => ({
                id: win.jugadaid,
                tipo: 'big-win',
                monto: win.retorno,
                fecha: win.fecha,
                juego: win.juego?.nombre || 'Desconocido',
                usuario: win.cliente?.usuario ? `${win.cliente.usuario.nombre} ${win.cliente.usuario.apellido}` : 'Usuario desconocido',
                usuarioid: win.cliente?.usuarioid
            }));

            const formattedHighDeposits = highDeposits.map(deposit => ({
                id: deposit.ingresoid,
                tipo: 'high-deposit',
                monto: Number(deposit.monto),
                fecha: deposit.fecha,
                metodo: deposit.metodo || 'Desconocido',
                usuario: deposit.cliente?.usuario ? `${deposit.cliente.usuario.nombre} ${deposit.cliente.usuario.apellido}` : 'Usuario desconocido',
                usuarioid: deposit.cliente?.usuarioid
            }));

            const formattedHighWithdrawals = highWithdrawals.map(withdrawal => ({
                id: withdrawal.egresoid,
                tipo: 'high-withdrawal',
                monto: Number(withdrawal.monto),
                fecha: withdrawal.fecha,
                metodo: withdrawal.metodo || 'Desconocido',
                usuario: withdrawal.cliente?.usuario ? `${withdrawal.cliente.usuario.nombre} ${withdrawal.cliente.usuario.apellido}` : 'Usuario desconocido',
                usuarioid: withdrawal.cliente?.usuarioid
            }));

            return [
                ...formattedBigWins,
                ...formattedHighDeposits,
                ...formattedHighWithdrawals
            ].sort((a, b) => {
                if (!a.fecha || !b.fecha) return 0;
                return new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
            });
        } catch (error) {
            console.error('Error al obtener actividades recientes:', error);
            throw error;
        }
    },
}