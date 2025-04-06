import React from "react";
import "./AdminCreationStyle.css"

const AdminCreator: React.FC = () => {
    return (
        <div className="container">
            <div className="admin-creation-card">
                <h1>Crear Administrador</h1>
                <form id="admin-creation-form">
                    <div className="form-group">
                        <label htmlFor="email">Correo Electrónico</label>
                        <input type="email" id="email" name="email" required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="IsSuperAdmin">¿Es SuperAdmin?</label>
                        <input type="checkbox" id="IsSuperAdmin" name="IsSuperAdmin" />
                    </div>
                    <div className="buttons">
                        <button type="submit" className="create-btn">
                            Crear Administrador
                        </button>
                    </div>
                </form>
            </div>
            <div className="admin-list-card">
                <h2>Lista de Administradores</h2>
                <ul id="admin-list"></ul>
            </div>
        </div>
    );
};

export default AdminCreator;