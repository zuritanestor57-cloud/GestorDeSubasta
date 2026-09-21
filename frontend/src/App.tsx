import React from 'react';
import { BrowserRouter, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Catalog } from './modules/catalog/Catalog';
import { Login } from './modules/auth/Login';
import { Register } from './modules/auth/Register';
import { CreateAuction } from './modules/auction/CreateAuction';
import { LiveAuction } from './modules/auction/LiveAuction';

// Instancia de TanStack Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Componente para Login conectado a react-router
const LoginRoute: React.FC = () => {
  const navigate = useNavigate();
  return (
    <Login
      onLoginSuccess={() => navigate('/catalog')}
      onNavigateToRegister={() => navigate('/register')}
    />
  );
};

// Componente para Register conectado a react-router
const RegisterRoute: React.FC = () => {
  const navigate = useNavigate();
  return <Register onNavigateToLogin={() => navigate('/login')} />;
};


function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Pantalla Inicial Obligatoria: LOGIN */}
          <Route path="/" element={<LoginRoute />} />
          <Route path="/login" element={<LoginRoute />} />

          {/* Registro */}
          <Route path="/register" element={<RegisterRoute />} />

          {/* Catálogo Principal (Home) */}
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/home" element={<Catalog />} />

          {/* Subastas */}
          <Route path="/auction/create" element={<CreateAuction />} />
          <Route path="/auction/:id" element={<LiveAuction />} />

          {/* Redirección por defecto a Login */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
