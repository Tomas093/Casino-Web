import express from 'express';
import session from 'express-session';
import authRoutes from './routes/auth';
import cors from 'cors';
import uploadRoutes from './routes/uploads';
import path from "path";

const app = express();

// Configurar CORS antes de las rutas
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true
}));

app.use(express.json());

// Rutas de subida y archivos estáticos
app.use('/upload', uploadRoutes);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configuración de sesiones
app.use(session({
    secret: 'tu_clave_secreta',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // true en producción con HTTPS
        maxAge: 24 * 60 * 60 * 1000 // 1 día
    }
}));

// Otras rutas
app.use('/auth', authRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});
