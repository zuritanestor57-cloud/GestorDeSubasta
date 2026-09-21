import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Clock, ShieldCheck, ChevronUp, Users, Send } from 'lucide-react';
import { Button } from '../../components/ui/Button';

// Interfaz para la simulación de pujas
interface Bid {
  id: string;
  username: string;
  amount: number;
  time: string;
  isCurrentUser?: boolean;
}

// Datos de prueba simulando la subasta
const MOCK_AUCTION = {
  id: '1',
  title: 'Apple MacBook Pro 16" (M3 Max) - 64GB RAM, 2TB SSD',
  description: 'Laptop en excelente estado, casi nueva. Usada solo un mes para un proyecto de edición de video. Batería al 100% de su capacidad. Incluye cargador original y caja.',
  seller: 'TechStore AR',
  sellerRating: 4.9,
  image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=1000',
  currentPrice: 3200,
  minIncrement: 50,
  endsInMs: 3600000, // 1 hora
};

const INITIAL_BIDS: Bid[] = [
  { id: 'b1', username: 'CryptoKing', amount: 3200, time: '10s ago' },
  { id: 'b2', username: 'MariaL', amount: 3100, time: '2m ago' },
  { id: 'b3', username: 'JuanPerez', amount: 2950, time: '5m ago' },
  { id: 'b4', username: 'TechStore AR', amount: 2500, time: '1h ago' }, // Precio base
];

export const LiveAuction: React.FC = () => {
  // Estados para simular la sala
  const [bids, setBids] = useState<Bid[]>(INITIAL_BIDS);
  const [currentPrice, setCurrentPrice] = useState(MOCK_AUCTION.currentPrice);
  const [bidAmount, setBidAmount] = useState<number>(MOCK_AUCTION.currentPrice + MOCK_AUCTION.minIncrement);
  const [timeLeft, setTimeLeft] = useState(MOCK_AUCTION.endsInMs);
  const [isBidding, setIsBidding] = useState(false);

  // Simulación de temporizador
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Formateo del temporizador
  const formatTime = (ms: number) => {
    if (ms <= 0) return '00:00:00';
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Manejador de nueva puja
  const handlePlaceBid = (e: React.FormEvent) => {
    e.preventDefault();
    if (bidAmount < currentPrice + MOCK_AUCTION.minIncrement) {
      alert(`La puja debe ser de al menos $${currentPrice + MOCK_AUCTION.minIncrement}`);
      return;
    }

    setIsBidding(true);
    
    // Simulamos latencia de red
    setTimeout(() => {
      const newBid: Bid = {
        id: `b-${Date.now()}`,
        username: 'Tú', // Usuario actual simulado
        amount: bidAmount,
        time: 'Just now',
        isCurrentUser: true
      };
      
      setBids(prev => [newBid, ...prev]);
      setCurrentPrice(bidAmount);
      setBidAmount(bidAmount + MOCK_AUCTION.minIncrement);
      setIsBidding(false);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#0B0B12] text-white flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full bg-[#111827]/90 backdrop-blur-md border-b border-[#1F2937]">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/catalog" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft size={18} />
            <span className="text-sm font-medium">Volver</span>
          </Link>
          <div className="flex items-center gap-2 text-red-500 animate-pulse bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <span className="text-xs font-bold tracking-widest uppercase">En Vivo</span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row gap-8 h-full">
          
          {/* ========================================================================= */}
          {/* PANEL IZQUIERDO: Detalles del Producto */}
          {/* ========================================================================= */}
          <div className="flex-1 flex flex-col gap-6">
            
            {/* Imagen Principal */}
            <div className="w-full aspect-video sm:aspect-[4/3] lg:aspect-video rounded-3xl overflow-hidden bg-[#111827] border border-[#1F2937] relative group">
              <img 
                src={MOCK_AUCTION.image} 
                alt={MOCK_AUCTION.title} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B12] via-transparent to-transparent opacity-80" />
              
              {/* Overlay Temporizador */}
              <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 max-w-2xl drop-shadow-lg">
                    {MOCK_AUCTION.title}
                  </h1>
                  <div className="flex items-center gap-3 text-slate-300 text-sm">
                    <span className="flex items-center gap-1 bg-[#111827]/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#1F2937]">
                      <ShieldCheck size={16} className="text-green-400" />
                      {MOCK_AUCTION.seller}
                    </span>
                    <span className="flex items-center gap-1 bg-[#111827]/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#1F2937]">
                      <Users size={16} className="text-[#2F8CFF]" />
                      24 Espectadores
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Fila de Tiempos y Descripción */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Temporizador Gigante */}
              <div className="col-span-1 bg-gradient-to-br from-[#111827] to-[#0B0B12] border border-[#1F2937] rounded-3xl p-6 flex flex-col items-center justify-center text-center shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                  <Clock size={120} />
                </div>
                <Clock className="text-[#2F8CFF] mb-3" size={32} />
                <p className="text-slate-400 text-sm font-medium mb-1 tracking-wider uppercase">Tiempo Restante</p>
                <div className={`text-4xl sm:text-5xl font-black font-mono tracking-tight ${timeLeft < 60000 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                  {formatTime(timeLeft)}
                </div>
              </div>

              {/* Descripción */}
              <div className="col-span-1 md:col-span-2 bg-[#111827] border border-[#1F2937] rounded-3xl p-6">
                <h3 className="text-lg font-bold text-slate-200 mb-3">Acerca de este artículo</h3>
                <p className="text-slate-400 leading-relaxed text-sm">
                  {MOCK_AUCTION.description}
                </p>
              </div>

            </div>
          </div>

          {/* ========================================================================= */}
          {/* PANEL DERECHO: Pujas en Vivo */}
          {/* ========================================================================= */}
          <div className="w-full lg:w-[400px] xl:w-[450px] flex flex-col gap-4">
            
            <div className="bg-[#111827] border border-[#1F2937] rounded-3xl flex flex-col flex-1 shadow-2xl h-[600px] lg:h-auto lg:max-h-[calc(100vh-120px)] sticky top-24 overflow-hidden">
              
              {/* Cabecera del Panel */}
              <div className="p-6 border-b border-[#1F2937] bg-[#111827]">
                <p className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-1">Oferta Actual</p>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-bold text-white">${currentPrice.toLocaleString()}</span>
                  <span className="text-slate-500 mb-1">USD</span>
                </div>
                <div className="flex items-center gap-1 text-green-400 mt-2 text-sm font-medium">
                  <ChevronUp size={16} />
                  <span>Última puja por {bids[0]?.username}</span>
                </div>
              </div>

              {/* Historial de Pujas (Scrollable) */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                {bids.map((bid, index) => (
                  <div 
                    key={bid.id} 
                    className={`flex items-center justify-between p-4 rounded-2xl transition-all ${
                      index === 0 
                        ? 'bg-[#2F8CFF]/10 border border-[#2F8CFF]/30' 
                        : 'bg-[#0B0B12] border border-[#1F2937]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                        bid.isCurrentUser 
                          ? 'bg-[#2F8CFF] text-white' 
                          : 'bg-[#1F2937] text-slate-300'
                      }`}>
                        {bid.username.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className={`font-semibold text-sm ${bid.isCurrentUser ? 'text-[#2F8CFF]' : 'text-slate-200'}`}>
                          {bid.isCurrentUser ? 'Tú (Oferta Actual)' : bid.username}
                        </p>
                        <p className="text-xs text-slate-500">{bid.time}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-white">${bid.amount.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Controles de Puja */}
              <div className="p-4 sm:p-6 bg-[#111827] border-t border-[#1F2937]">
                <form onSubmit={handlePlaceBid} className="flex flex-col gap-4">
                  <div className="flex items-center gap-2 text-xs text-slate-400 px-1">
                    <span>Incremento mínimo:</span>
                    <span className="font-semibold text-white">${MOCK_AUCTION.minIncrement}</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                      <input 
                        type="number"
                        value={bidAmount}
                        onChange={(e) => setBidAmount(Number(e.target.value))}
                        min={currentPrice + MOCK_AUCTION.minIncrement}
                        step={1}
                        className="w-full bg-[#0B0B12] border border-[#1F2937] rounded-2xl pl-8 pr-4 py-4 text-white font-bold text-lg focus:outline-none focus:border-[#2F8CFF] focus:ring-1 focus:ring-[#2F8CFF] transition-all"
                      />
                    </div>
                    <Button 
                      type="submit" 
                      disabled={isBidding || timeLeft <= 0}
                      className="h-[60px] px-8 rounded-2xl flex items-center gap-2 shadow-lg shadow-[#2F8CFF]/20"
                    >
                      {isBidding ? '...' : <Send size={20} />}
                      <span className="hidden sm:inline">Pujar</span>
                    </Button>
                  </div>
                  
                  {timeLeft <= 0 && (
                    <div className="text-center text-red-500 text-sm font-bold mt-2">
                      ¡SUBASTA FINALIZADA!
                    </div>
                  )}
                </form>
              </div>

            </div>
          </div>

        </div>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1F2937;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #374151;
        }
      `}</style>
    </div>
  );
};
