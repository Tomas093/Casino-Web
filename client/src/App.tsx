// App.tsx
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import LandingPage from './React/LandingPage';
import Register from './React/Register';
import Login from './React/Login';
import HistoryPage from './React/HistoryPage';
import ProfilePage from './React/ProfilePage';
import {AuthProvider} from './React/AuthContext';
import ProtectedRoute from './React/ProtectedRoute';
import AdminRoutes from "./React/AdminRoutes.tsx";
import AdminManagment from "./React/AdminManagment.tsx";
import SuperadminOnlyRoutes from "./React/SuperAdminRoutes.tsx"
import DeleteUser from "./React/DeleteUser.tsx";
import DeleteSpecificAccount from "./React/DeleteSpecificAccount.tsx";
import Transaccion from "./React/Transaccion.tsx"
import Home from "./React/Home.tsx";


//Modo diablo Skeree

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route path="/" element={<LandingPage/>}/>
                    <Route path="/login" element={<Login/>}/>
                    <Route path="/register" element={<Register/>}/>

                    {/* Rutas protegidas Solo (Usuarios/Clientes) */}
                    <Route element={<ProtectedRoute/>}>
                        <Route path="/history" element={<HistoryPage/>}/>
                        <Route path="/profile" element={<ProfilePage/>}/>
                        <Route path="/delete-account" element={<DeleteUser/>}/>
                        <Route path="/Transaccion" element={<Transaccion/>}/>
                        <Route path="/home" element={<Home/>}/>
                    </Route>

                    {/* rutas Solo para admins*/}
                    <Route element={<AdminRoutes/>}>
                        <Route path="/HIHIHIHIHI" element={<div>NO IMPLEMENTADO NADA</div>}/>
                    </Route>

                    {/* Rutas protegidas Solo (Superadmin) */}
                    <Route element={<SuperadminOnlyRoutes/>}>
                        <Route path="/admin" element={<AdminManagment/>}/>
                        <Route path="/deleteSpecificaccount/:id" element={<DeleteSpecificAccount/>}/>
                    </Route>

                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
