import {PrismaClient} from '@prisma/client';

const prisma = new PrismaClient();

interface UserUpdateData {
    nombre: string;
    apellido: string;
    email: string;
    edad: number;
    dni: string;
    balance?: number;
    influencer?: boolean;
}

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

        return usuario;
    },

    // Obtener todos los usuarios (no administradores)
    getAllUsers: async () => {
        return prisma.usuario.findMany({
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
    },

    // En server/src/services/userService.ts
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
                edad: edad.toString(),
                dni
            }
        });

        // Actualizar cliente si se proporcionan datos
        if (balance !== undefined || influencer !== undefined) {
            await prisma.cliente.update({
                where: { usuarioid: userId },
                data: {
                    ...(balance !== undefined && { balance }),
                    ...(influencer !== undefined && { influencer })
                }
            });
        }

        return usuarioActualizado;
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
    },


    
};