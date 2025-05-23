import {BrowserRouter, Route, Routes} from 'react-router-dom';
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
import MineSweeper from "../pages/games/minesweeper/MineSweeperEnchanced.tsx";
import {AppProvider} from './AppProvider.tsx';
import RouletteGame from "../pages/games/roulette/RouletteGame.tsx";
import StatisticsPage from "../pages/profile/StatisticsPage.tsx"
import Limit from "../pages/profile/LimitPage.tsx";
import MonLimitTicketPage from "../pages/tickets/MonLimitTicketPage.tsx";
import NotFound from "@components/Error/Error404.tsx";
import FriendsPage from "../pages/profile/FriendsPage.tsx";
import TicketsView from "../pages/tickets/TicketsView.tsx";
import Ticket from '../pages/tickets/Ticket.tsx';
import SupportPage from "../pages/support/SupportPage.tsx";
import Slots from '../pages/games/slots/Slots.tsx';
import Terminos from '../pages/legal/Terminos.tsx';
import PrivacyPolicy from "../pages/legal/PrivacyPolicy.tsx";
import AboutUs from "../pages/legal/AboutUs.tsx";
import Legal from "../pages/legal/Legal.tsx";
import LimitMonitor from "@components/LimitMonitor.tsx";

function App() {
    return (
        <BrowserRouter>
            <AppProvider>
                <LimitMonitor />

                <Routes>
                    {/* Rutas públicas */}
                    <Route path="/" element={<LandingPage/>}/>
                    <Route path="/login" element={<Login/>}/>
                    <Route path="/register" element={<Register/>}/>
                    <Route path="/terms" element={<Terminos/>}/>
                    <Route path="/privacy-policy" element={<PrivacyPolicy/>}/>
                    <Route path="/aboutus" element={<AboutUs/>}/>
                    <Route path="/legal" element={<Legal/>}/>

                    {/* Rutas protegidas Solo (Usuarios/Clientes) */}
                    <Route element={<ProtectedRoute/>}>
                        <Route path="/history" element={<HistoryPage/>}/>
                        <Route path="/statistics" element={<StatisticsPage/>}/>
                        <Route path="/profile" element={<ProfilePage/>}/>
                        <Route path="/delete-account" element={<DeleteUser/>}/>
                        <Route path="/Transaccion" element={<Transaccion/>}/>
                        <Route path="/home" element={<Home/>}/>
                        <Route path="/roulette" element={<RouletteGame/>}/>
                        <Route path="/mines" element={<MineSweeper/>}/>
                        <Route path="/limit" element={<Limit/>}/>
                        <Route path="/monLimitTicket" element={<MonLimitTicketPage/>}/>
                        <Route path="/friends" element={<FriendsPage/>}/>
                        <Route path="/pausa" element={<div>NO IMPLEMENTADO NADA</div>}/>
                        <Route path="/ticket/:ticketId" element={<Ticket/>}/>
                        <Route path="/support" element={<SupportPage/>}/>
                        <Route path="/slots" element={<Slots/>}/>
                        <Route path="/tickets" element={<TicketsView/>}/>
                    </Route>

                    {/* rutas Solo para admins */}
                    <Route element={<AdminRoutes/>}>

                    </Route>

                    {/* Rutas protegidas Solo (Superadmin) */}
                    <Route element={<SuperadminOnlyRoutes/>}>
                        <Route path="/admin" element={<AdminManagment/>}/>
                        <Route path="/deleteSpecificaccount/:id" element={<DeleteSpecificAccount/>}/>
                    </Route>

                    {/* Cualquier otra ruta (Equivocada) */}
                    <Route path="*" element={<NotFound/>}/>
                </Routes>
            </AppProvider>
        </BrowserRouter>
    );
}

export default App;