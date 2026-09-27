import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { authService } from '../services/authService.ts';
import type { UserRole } from '../types/index.ts';

interface Props {
  children: ReactNode;
  // Si se indica, además de tener sesión el usuario debe tener uno de estos roles.
  roles?: UserRole[];
}

// Sin sesión: manda a /login guardando la ruta pedida en location.state.from,
// para volver acá apenas inicie sesión (ver LoginPage). Con sesión pero rol
// no permitido: manda al catálogo, sin mostrar mensaje de error.
export default function ProtectedRoute({ children, roles }: Props) {
  const location = useLocation();
  const user = authService.getCurrentUser();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}
