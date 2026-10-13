import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

interface Props {
  roles?: string[];
}

export default function ProtectedRoute({ roles }: Props) {
  const { token, user } = useAuth();
  const location = useLocation();

  // Ruta privada: si no hay sesión, va al login (recordando a dónde quería entrar)
  if (!token || !user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // Ruta privada por rol: si hay sesión pero el rol no alcanza, va a "no autorizado"
  if (roles && !roles.includes(user.rol)) {
    return <Navigate to="/no-autorizado" replace />;
  }

  return <Outlet />;
}