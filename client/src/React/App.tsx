// App.tsx
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import LandingPage from './LandingPage';
import Register from './Register';
import Login from './Login';
import HistoryPage from './HistoryPage';
import ProfilePage from './ProfilePage';
import {AuthProvider} from './AuthContext';
import ProtectedRoute from './ProtectedRoute';
import AdminRoutes from "./AdminRoutes.tsx";
import AdminManagment from "./AdminManagment.tsx";
import SuperadminOnlyRoutes from "./SuperAdminRoutes.tsx"
import DeleteUser from "./DeleteUser.tsx";
import DeleteSpecificAccount from "./DeleteSpecificAccount.tsx";
import Transaccion from "./Transaccion.tsx"
import Home from "./Home.tsx";


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
