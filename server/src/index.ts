import express from 'express';
import session from 'express-session';
import cors from 'cors';
import path from "path";

import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import adminRoutes from './routes/adminRoutes';
import transactionRoutes from './routes/transactionRoutes';
import uploadRoutes from './routes/uploads';
import gameRoutes from "./routes/gameRoutes";
import historyRoutes from "./routes/historyRoutes";
import playRoutes from "./routes/playRoutes"
import leaderboardRoutes from "./routes/leaderboardRoutes";
import limitRoutes from "./routes/limitRoutes";
import friendRequestRoutes from "./routes/friendRequestRoutes";
import ticketRoutes from "./routes/ticketRoutes";
import messageRoutes from "./routes/messageRoutes";
import faqRoutes from "./routes/faqRoutes";
import adminStaticsRoutes from "./routes/adminStaticsRoutes";
import cuponRoutes from "./routes/cuponRoutes";
import tiempodesesionRoutes from "./routes/tiempodesesionRoutes";
import suspendidoRoutes from "./routes/suspendidosRoutes";

const app = express();

// Configurar CORS con opciones adecuadas para cookies
const allowedOrigins = ['http://localhost:5173', 'http://localhost:5174'];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
});


// Configuración de sesiones
app.use(session({
    secret: 'tu_clave_secreta',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // Solo usar true con HTTPS
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
        sameSite: 'lax' // Ayuda con CORS
    }
}));

// Usar las rutas refactorizadas
// Rutas de subida y archivos estáticos
app.use('/upload', uploadRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/admin', adminRoutes);
app.use('/transaction', transactionRoutes);
app.use('/game', gameRoutes);
app.use('/history', historyRoutes)
app.use('/play', playRoutes);
app.use('/leaderboard', leaderboardRoutes)
app.use('/limit', limitRoutes)
app.use('/play', playRoutes);
app.use('/friendRequest', friendRequestRoutes);
app.use('/ticket', ticketRoutes)
app.use('/message', messageRoutes);
app.use('/faq', faqRoutes);
app.use('/admin-statics', adminStaticsRoutes);
app.use('/cupon', cuponRoutes)
app.use('/tiempodesesion',tiempodesesionRoutes)
app.use('/suspendidos',suspendidoRoutes)


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});