import {PrismaClient} from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

interface RegisterData {
    nombre: string;
    apellido: string;
    email: string;
    password: string;
    edad: number;
    dni: string;
}

interface LoginData {
    email: string;
    password: string;
}

interface AdminData extends RegisterData {
    superadmin: boolean;
}

export const authService = {
    // Registrar un nuevo usuario
    async register(userData: RegisterData) {
        const {nombre, apellido, email, password, edad, dni} = userData;

        // Verificar si ya existe un usuario con ese email o DNI
        const existingUser = await prisma.usuario.findFirst({
            where: {
                OR: [
                    {email},
                    {dni}
                ]
            }
        });

        if (existingUser) {
            throw new Error('Ya existe un usuario con ese email o DNI');
        }

        // Hashear password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Crear usuario
        const nuevoUsuario = await prisma.usuario.create({
            data: {
                nombre,
                apellido,
                email,
                password: hashedPassword,
                edad: edad.toString(),
                dni
            }
        });

        const nuevoCliente = await prisma.cliente.create({
            data: {
                usuarioid: nuevoUsuario.usuarioid,
                balance: 0,
                influencer: false
            }
        });

        await prisma.limitehorario.create({
            data: {
                clienteid: nuevoCliente.clienteid,
                limitediario: 5,
                limitesemanal: 30,
                limitemensual: 100
            }
        });

        await prisma.limitemonetario.create({
            data: {
                clienteid: nuevoCliente.clienteid,
                limitediario: 5000,
                limitesemanal: 500000,
                limitemensual: 5000000
            }
        });

        return nuevoUsuario;
    },

    // Login de usuario
    async login(loginData: LoginData) {
        const {email, password} = loginData;

        const usuario = await prisma.usuario.findUnique({where: {email}});

        if (!usuario || !usuario.password) {
            throw new Error('Email o contraseña incorrectos');
        }

        const passwordMatch = await bcrypt.compare(password, usuario.password);
        if (!passwordMatch) {
            throw new Error('Email o contraseña incorrectos');
        }

        // Eliminar la contraseña del objeto usuario
        const {password: _, ...usuarioSinPassword} = usuario;
        return usuarioSinPassword;
    },

    // Crear un administrador
    async createAdmin(adminData: AdminData) {
        const {nombre, apellido, email, password, edad, dni, superadmin} = adminData;

        // Verificar si ya existe un usuario con ese email o DNI
        const existingUser = await prisma.usuario.findFirst({
            where: {
                OR: [
                    {email},
                    {dni}
                ]
            }
        });

        if (existingUser) {
            throw new Error('Ya existe un usuario con ese email o DNI');
        }

        // Hashear password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Crear usuario
        const nuevoUsuario = await prisma.usuario.create({
            data: {
                nombre,
                apellido,
                email,
                password: hashedPassword,
                edad: edad.toString(),
                dni
            }
        });

        // Crear cliente asociado (todos los administradores también son clientes)
        await prisma.cliente.create({
            data: {
                usuarioid: nuevoUsuario.usuarioid,
                balance: 0,
                influencer: false
            }
        });

        // Crear administrador
        await prisma.administrador.create({
            data: {
                usuarioid: nuevoUsuario.usuarioid,
                superadmin
            }
        });

        return nuevoUsuario;
    }
};