import express from 'express';
import session from 'express-session';
import authRoutes from './routes/auth';
import cors from 'cors';

const app = express();

app.use(express.json());

app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true
}));

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

// Rutas
app.use('/auth', authRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});