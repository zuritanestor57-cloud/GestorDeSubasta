import { Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage.tsx';
import LoginPage from './pages/LoginPage.tsx';
import AuctionDetailPage from './pages/AuctionDetailPage.tsx';
import CreateAuctionPage from './pages/CreateAuctionPage.tsx';
import WalletPage from './pages/WalletPage.tsx';
import UserDashboardPage from './pages/UserDashboardPage.tsx';
import AdminDashboardPage from './pages/AdminDashboardPage.tsx';
import ProtectedRoute from './components/ProtectedRoute.tsx';

// Las páginas todavía no diseñadas quedan como placeholder (ver src/pages/);
// se van reemplazando pantalla por pantalla.
function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/auctions/:id" element={<AuctionDetailPage />} />
      <Route
        path="/create-auction"
        element={
          <ProtectedRoute roles={['Seller', 'BuyerAndSeller']}>
            <CreateAuctionPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/wallet"
        element={
          <ProtectedRoute>
            <WalletPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <UserDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={['Administrator']}>
            <AdminDashboardPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
