import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './LandingPage';
import Register from "./Register.tsx";
import Login from "./Login.tsx";
import HistoryPage from "./HistoryPage.tsx";
import ProfilePage from "./ProfilePage.tsx";
import { AuthProvider } from './AuthContext'; // Importa el AuthProvider

function App() {
    return (
        <BrowserRouter>
            <AuthProvider> {/* Envuelve todas las rutas con AuthProvider */}
                <Routes>
                    <Route path="/" element={<LandingPage/>} />
                    <Route path="/login" element={<Login/>} />
                    <Route path="/register" element={<Register/>}/>
                    <Route path="/history" element={<HistoryPage/>} />
                    <Route path="/profile" element={<ProfilePage/>} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;