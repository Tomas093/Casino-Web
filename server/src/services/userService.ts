import {PrismaClient} from '@prisma/client';

const prisma = new PrismaClient();

interface UserUpdateData {
    nombre: string;
    apellido: string;
    email: string;
    edad: Date;
    dni: string;
    balance?: number;
    influencer?: boolean;
}
// Función auxiliar para validar y convertir fechas
const validateAndConvertDate = (dateInput: Date | string | null): Date | null => {
    if (!dateInput) return null;

    try {
        const date = new Date(dateInput);

        // Verificar que la fecha sea válida
        if (isNaN(date.getTime())) {
            console.warn('Fecha inválida recibida:', dateInput);
            return null;
        }

        // Verificar que la fecha no sea futura
        if (date > new Date()) {
            console.warn('Fecha de nacimiento en el futuro:', dateInput);
            throw new Error('La fecha de nacimiento no puede ser en el futuro');
        }

        // Verificar que el usuario tenga al menos 18 años
        const minDate = new Date();
        minDate.setFullYear(minDate.getFullYear() - 18);

        if (date > minDate) {
            throw new Error('El usuario debe ser mayor de 18 años');
        }

        // Verificar que la fecha sea razonable (no más de 150 años)
        const maxAge = new Date();
        maxAge.setFullYear(maxAge.getFullYear() - 150);

        if (date < maxAge) {
            console.warn('Fecha de nacimiento muy antigua:', dateInput);
            throw new Error('La fecha de nacimiento es demasiado antigua');
        }

        return date;
    } catch (error) {
        if (error instanceof Error) {
            throw error; // Re-lanzar errores específicos
        }
        console.error('Error procesando fecha:', error);
        throw new Error('Error al procesar la fecha de nacimiento');
    }
};

export const userService = {
    // Obtener un usuario por ID
    getUserById: async (userId: number) => {
        const usuario = await prisma.usuario.findUnique({
            where: { usuarioid: userId },
            include: { cliente: true }
        });

        if (!usuario) {
            throw new Error('Usuario no encontrado');
        }

        // Asegurar que la fecha se retorne correctamente
        return {
            ...usuario,
            edad: usuario.edad ? new Date(usuario.edad).toISOString() : null
        };
    },

    // Obtener todos los usuarios (no administradores)
    getAllUsers: async () => {
        const users = await prisma.usuario.findMany({
            where: {
                administrador: null
            },
            select: {
                usuarioid: true,
                nombre: true,
                apellido: true,
                email: true,
                edad: true,
                dni: true,
                img: true,
                cliente: {
                    select: {
                        clienteid: true,
                        balance: true,
                        influencer: true
                    }
                }
            }
        });

        // Procesar las fechas antes de retornar
        return users.map(user => ({
            ...user,
            edad: user.edad ? new Date(user.edad).toISOString() : null
        }));
    },

    // Contar usuarios
    async getUserCount(): Promise<number> {
        try {
            const count = await prisma.usuario.count({
                where: {
                    administrador: null
                }
            });
            return count;
        } catch (error) {
            console.error('Error al contar usuarios:', error);
            throw { message: 'Error al contar usuarios', statusCode: 500 };
        }
    },

    // Actualizar un usuario
    updateUser: async (userId: number, userData: UserUpdateData) => {
        const { nombre, apellido, email, edad, dni, balance, influencer } = userData;

        // Verificar si el usuario existe
        const usuario = await prisma.usuario.findUnique({
            where: { usuarioid: userId }
        });

        if (!usuario) {
            throw new Error('Usuario no encontrado');
        }

        // Validar y convertir la fecha
        const fechaValidada = validateAndConvertDate(edad);

        // Verificar si el email o DNI ya están en uso por otro usuario
        if (email !== usuario.email || dni !== usuario.dni) {
            const existingUser = await prisma.usuario.findFirst({
                where: {
                    AND: [
                        { NOT: { usuarioid: userId } },
                        {
                            OR: [
                                { email },
                                { dni }
                            ]
                        }
                    ]
                }
            });

            if (existingUser) {
                throw new Error('Ya existe otro usuario con ese email o DNI');
            }
        }

        // Actualizar usuario
        const usuarioActualizado = await prisma.usuario.update({
            where: { usuarioid: userId },
            data: {
                nombre,
                apellido,
                email,
                edad: fechaValidada, // Usar la fecha validada
                dni
            }
        });

        // Actualizar cliente si se proporcionan datos
        if (balance !== undefined || influencer !== undefined) {
            await prisma.cliente.update({
                where: { usuarioid: userId },
                data: {
                    ...(balance !== undefined && { balance: Number(balance) }),
                    ...(influencer !== undefined && { influencer })
                }
            });
        }

        return {
            ...usuarioActualizado,
            edad: usuarioActualizado.edad ? usuarioActualizado.edad.toISOString() : null
        };
    },

    // Eliminar un usuario
    deleteUser: async (userId: number) => {
        // Verificar si el usuario existe
        const usuario = await prisma.usuario.findUnique({
            where: { usuarioid: userId }
        });

        if (!usuario) {
            throw new Error('Usuario no encontrado');
        }

        // Eliminar usuario (las relaciones deberían eliminarse en cascada si está bien definido en Prisma)
        await prisma.usuario.delete({
            where: { usuarioid: userId }
        });

        return true;
    }

};