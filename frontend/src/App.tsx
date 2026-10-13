import { BrowserRouter, Routes, Route, NavLink, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./AuthContext";
import ProtectedRoute from "./ProtectedRoute";
import { Inicio, Login, Privada, Admin, NoAutorizado } from "./Pages";

function Menu() {
  const { user, logout } = useAuth();
  const claseLink = ({ isActive }: { isActive: boolean }) => (isActive ? "active" : "");

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <NavLink to="/" className="brand">
          <span className="brand-mark" />
          Web-Tareas
        </NavLink>
        <nav className="nav-links">
          <NavLink to="/" end className={claseLink}>
            Inicio
          </NavLink>
          <NavLink to="/privada" className={claseLink}>
            Mis tareas
          </NavLink>
          {user?.rol === "admin" && (
            <NavLink to="/admin" className={claseLink}>
              Administración
            </NavLink>
          )}
        </nav>
        <div className="nav-user">
          {user ? (
            <>
              <div className="user-info">
                <span className="user-name">{user.nombre}</span>
                <span className="user-role">{user.rol === "admin" ? "Administrador" : "Usuario"}</span>
              </div>
              <button className="btn btn-outline small" onClick={logout}>
                Cerrar sesión
              </button>
            </>
          ) : (
            <NavLink to="/login" className="btn btn-primary small">
              Iniciar sesión
            </NavLink>
          )}
        </div>
      </div>
    </header>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Menu />
        <main className="container">
          <Routes>
            {/* Rutas públicas */}
            <Route path="/" element={<Inicio />} />
            <Route path="/login" element={<Login />} />
            <Route path="/no-autorizado" element={<NoAutorizado />} />

            {/* Ruta privada: solo usuarios autenticados */}
            <Route element={<ProtectedRoute />}>
              <Route path="/privada" element={<Privada />} />
            </Route>

            {/* Ruta privada por rol: solo autenticados con rol admin */}
            <Route element={<ProtectedRoute roles={["admin"]} />}>
              <Route path="/admin" element={<Admin />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <footer className="footer">Web-Tareas · Sistema de gestión de tareas</footer>
      </BrowserRouter>
    </AuthProvider>
  );
}