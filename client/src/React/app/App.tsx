// App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from '../pages/home/LandingPage';
import Register from '../pages/auth/Register';
import Login from '../pages/auth/Login';
import HistoryPage from '../pages/profile/HistoryPage';
import ProfilePage from '../pages/profile/ProfilePage';
import ProtectedRoute from '../routes/ProtectedRoute';
import SuperadminOnlyRoutes from "../routes/SuperAdminRoutes.tsx";
import AdminRoutes from "../routes/AdminRoutes.tsx";
import AdminManagment from "../pages/admin/AdminManagment.tsx";
import DeleteUser from "../pages/deletes/DeleteUser.tsx";
import DeleteSpecificAccount from "../pages/deletes/DeleteSpecificAccount.tsx";
import Transaccion from "../pages/transaction/Transaccion.tsx";
import Home from "../pages/home/Home.tsx";
import MineSweeper from "../pages/games/MineSweeperEnchanced.tsx";
import { AppProvider } from './appProvider';
import Example from "../games/components/Example.tsx"
// import MineSweeper from "../games/components/MineSweeper.tsx";
import RouletteGame from "../pages/games/RouletteGame.tsx";
function App() {
    return (
        <BrowserRouter>
            <AppProvider>
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/example" element={<Example/>} />
                    <Route path="/Mines" element={<MineSweeper />} />
                    <Route path="/roulette" element={<RouletteGame />} />


                    {/* Rutas protegidas Solo (Usuarios/Clientes) */}
                    <Route element={<ProtectedRoute />}>
                        <Route path="/history" element={<HistoryPage />} />
                        <Route path="/profile" element={<ProfilePage />} />
                        <Route path="/delete-account" element={<DeleteUser />} />
                        <Route path="/Transaccion" element={<Transaccion />} />
                        <Route path="/home" element={<Home />} />
                        {/*<Route path="/Mines" element={<MineSweeper />} />*/}
                    </Route>

                    {/* rutas Solo para admins */}
                    <Route element={<AdminRoutes />}>
                        <Route path="/HIHIHIHIHI" element={<div>NO IMPLEMENTADO NADA</div>} />
                    </Route>

                    {/* Rutas protegidas Solo (Superadmin) */}
                    <Route element={<SuperadminOnlyRoutes />}>
                        <Route path="/admin" element={<AdminManagment />} />
                        <Route path="/deleteSpecificaccount/:id" element={<DeleteSpecificAccount />} />
                    </Route>
                </Routes>
            </AppProvider>
        </BrowserRouter>
    );
}

export default App;