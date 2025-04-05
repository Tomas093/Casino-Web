// routes/upload.ts
import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

// Usar la ruta específica para los uploads
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const uniqueName = `imagen-${Date.now()}${ext}`;
        cb(null, uniqueName);
    }
});

const upload = multer({ storage });

router.post('/:userId', upload.single('imagen'), async (req: Request, res: Response): Promise<void> => {
    const userId = parseInt(req.params.userId);

    if (!req.file) {
        res.status(400).json({ message: 'No se subió ninguna imagen' });
        return;
    }

    try {
        // Guardar la ruta de la imagen en la base de datos
        const imagePath = `/uploads/${req.file.filename}`;


        await prisma.usuario.update({
            where: { usuarioid: userId },
            data: { img: imagePath } // Guardar la ruta como string, sin convertir a Buffer
        });

        console.log(`Imagen subida para el usuario ${userId}: ${req.file.filename}`);
        res.status(200).json({
            message: 'Imagen subida con éxito',
            imageUrl: imagePath
        });
    } catch (error) {
        console.error('Error al actualizar la base de datos:', error);
        res.status(500).json({
            message: 'Error al guardar la imagen en la base de datos',
            error: error
        });
    }
});

export default router;