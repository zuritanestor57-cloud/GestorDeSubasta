import React from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useParams, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Catalog } from './modules/catalog/Catalog';
import { Login } from './modules/auth/Login';
import { Register } from './modules/auth/Register';
import { ArrowLeft, Hammer } from 'lucide-react';
import { Button } from './components/ui/Button';

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

// Componente Placeholder para /auction/:id (para navegación fluida)
const AuctionDetailPlaceholder: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0B0B12] text-white flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#2F8CFF]/15 border border-[#2F8CFF]/30 flex items-center justify-center text-[#2F8CFF] mb-5">
        <Hammer size={32} />
      </div>
      <h1 className="text-2xl font-bold mb-2">Detalle de Subasta #{id}</h1>
      <p className="text-slate-400 text-sm max-w-md mb-6">
        Has navegado con éxito a la ruta de subasta <code className="text-[#2F8CFF]">/auction/{id}</code>. Aquí se renderizará el módulo de detalle y pujas en vivo.
      </p>
      <div className="w-48">
        <Button variant="outline" onClick={() => navigate('/catalog')} className="flex items-center justify-center gap-2">
          <ArrowLeft size={16} />
          <span>Volver al catálogo</span>
        </Button>
      </div>
    </div>
  );
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

          {/* Detalle de Subasta */}
          <Route path="/auction/:id" element={<AuctionDetailPlaceholder />} />

          {/* Redirección por defecto a Login */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
