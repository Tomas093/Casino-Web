import {PrismaClient} from '@prisma/client';

const prisma = new PrismaClient();

interface FriendRequestData {
    id_remitente: number;
    id_receptor: number;
    estado?: string;
}

const findFriendRequestByUsersId = async (id_remitente: number, id_receptor: number) => {
    const request = await prisma.solicitudesamistad.findFirst({
        where: {
            OR: [
                {id_remitente, id_receptor},
                {id_remitente: id_receptor, id_receptor: id_remitente}
            ]
        }
    });

    if (!request) {
        throw new Error('Solicitud de amistad no encontrada');
    }

    return request;
}

export const friendRequestService = {

    sendFriendRequest: async (data: FriendRequestData) => {
        const {id_remitente, id_receptor} = data;

        // Validar que ambos usuarios existan
        const remitenteExists = await prisma.usuario.findUnique({where: {usuarioid: id_remitente}});
        const receptorExists = await prisma.usuario.findUnique({where: {usuarioid: id_receptor}});

        if (!remitenteExists) {
            throw new Error(`El remitente con ID ${id_remitente} no existe`);
        }

        if (!receptorExists) {
            throw new Error(`El receptor con ID ${id_receptor} no existe`);
        }

        // Verificar si la solicitud ya existe
        const existingRequest = await prisma.solicitudesamistad.findFirst({
            where: {
                OR: [
                    {id_remitente: id_remitente, id_receptor: id_receptor},
                    {id_remitente: id_receptor, id_receptor: id_remitente}
                ]
            }
        });

        if (existingRequest) {
            throw new Error('La solicitud de amistad ya existe');
        }

        return prisma.solicitudesamistad.create({
            data: {
                id_remitente: id_remitente,
                id_receptor: id_receptor,
                estado: 'pendiente',
            }
        });
    },

    // Aceptar una solicitud de amistad
    acceptFriendRequest: async (data: FriendRequestData) => {
        const {id_remitente, id_receptor} = data;
        const request = await findFriendRequestByUsersId(id_remitente, id_receptor);

        if (request.estado !== 'pendiente') {
            throw new Error('La solicitud de amistad no está pendiente');
        }

        // Actualizar la solicitud a 'aceptada'
        const updatedRequest = await prisma.solicitudesamistad.update({
            where: {id_solicitud: request.id_solicitud},
            data: {estado: 'aceptada'}
        });

        // Crear la relación de amistad
        await prisma.amistad.create({
            data: {
                usuario1_id: id_remitente,
                usuario2_id: id_receptor
            }
        });

        return updatedRequest;
    },

    // Rechazar una solicitud de amistad
    rejectFriendRequest: async (data: FriendRequestData) => {
        const {id_remitente, id_receptor} = data;

        // Verificar si la solicitud existe
        const request = await findFriendRequestByUsersId(id_remitente, id_receptor);

        if (request.estado !== 'pendiente') {
            throw new Error('La solicitud de amistad no está pendiente');
        }

        return prisma.solicitudesamistad.update({
            where: {id_solicitud: request.id_solicitud},
            data: {estado: 'rechazada'}
        });
    },

    // Cancelar una solicitud de amistad
    cancelFriendRequest: async (data: FriendRequestData) => {
        const {id_remitente, id_receptor} = data;

        // Verificar si la solicitud existe
        const request = await findFriendRequestByUsersId(id_remitente, id_receptor);

        if (request.estado !== 'pendiente') {
            throw new Error('La solicitud de amistad no está pendiente');
        }

        return prisma.solicitudesamistad.delete({
            where: {id_solicitud: request.id_solicitud}
        });
    },

    // Obtener todas las solicitudes de amistad pendientes de un usuario
    getPendingFriendRequests: async (usuarioid: number) => {
        return prisma.solicitudesamistad.findMany({
            where: {
                id_receptor: usuarioid,
                estado: 'pendiente'
            },
            include: {
                usuario_solicitudesamistad_id_remitenteTousuario: true
            }
        });
    },

    getSentFriendRequests: async (usuarioid: number) => {
        return prisma.solicitudesamistad.findMany({
            where: {
                id_remitente: usuarioid,
                estado: 'pendiente'
            },
            include: {
                usuario_solicitudesamistad_id_receptorTousuario: true
            }
        });
    },

    getFriends: async (usuarioid: number) => {
        return prisma.amistad.findMany({
            where: {
                OR: [
                    {usuario1_id: usuarioid},
                    {usuario2_id: usuarioid}
                ]
            },
            include: {
                usuario_amistad_usuario1_idTousuario: {
                    select: {
                        nombre: true,
                        apellido: true,
                        email: true,
                        img: true
                    }
                },
                usuario_amistad_usuario2_idTousuario: {
                    select: {
                        nombre: true,
                        apellido: true,
                        email: true,
                        img: true
                    }
                }
            }
        });
    },

    getUserSearch: async (usuarioid: number) => {
        return prisma.usuario.findMany({
            where: {
                NOT: [
                    {
                        OR: [
                            {
                                amistad_amistad_usuario1_idTousuario: {
                                    some: {
                                        usuario1_id: usuarioid
                                    }
                                }
                            },
                            {
                                amistad_amistad_usuario2_idTousuario: {
                                    some: {
                                        usuario2_id: usuarioid
                                    }
                                }
                            }
                        ]
                    },
                    {usuarioid},
                    {
                        solicitudesamistad_solicitudesamistad_id_receptorTousuario: {
                            some: {
                                id_remitente: usuarioid,
                                estado: 'pendiente'
                            }
                        }
                    },
                    {
                        solicitudesamistad_solicitudesamistad_id_remitenteTousuario: {
                            some: {
                                id_receptor: usuarioid,
                                estado: 'pendiente'
                            }
                        }
                    }
                ]
            }
        });
    },

    deleteFriend: async (id_remitente: number, id_receptor: number) => {
        const request = await findFriendRequestByUsersId(id_remitente, id_receptor);

        if (request.estado !== 'aceptada') {
            throw new Error('No se puede eliminar la amistad, no está aceptada');
        }

        await prisma.solicitudesamistad.deleteMany({
            where: {
                OR: [
                    {id_remitente, id_receptor},
                    {id_remitente: id_receptor, id_receptor: id_remitente}
                ]
            }
        });

        return prisma.amistad.deleteMany({
            where: {
                OR: [
                    {usuario1_id: id_remitente, usuario2_id: id_receptor},
                    {usuario1_id: id_receptor, usuario2_id: id_remitente}
                ]
            }
        });
    }
}