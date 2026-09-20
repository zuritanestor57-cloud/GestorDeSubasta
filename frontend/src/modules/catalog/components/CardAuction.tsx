import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Tag } from 'lucide-react';
import type { Auction } from '../types';
import { Button } from '../../../components/ui/Button';

interface CardAuctionProps {
  auction: Auction;
}

export const CardAuction: React.FC<CardAuctionProps> = ({ auction }) => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState<string>('00:00:00');
  const [imgError, setImgError] = useState(false);

  // Determinar si la subasta está activa o finalizada
  const statusLower = auction.status?.toLowerCase() || '';
  const isFinished = statusLower === 'finished' || statusLower === 'finalizada' || statusLower === 'cancelled';
  const isActive = statusLower === 'published' || statusLower === 'en curso' || statusLower === 'active';

  // Contador regresivo dinámico
  useEffect(() => {
    if (isFinished) {
      setTimeLeft('00:00:00');
      return;
    }

    const calculateTimeLeft = () => {
      const end = new Date(auction.endDate).getTime();
      const now = new Date().getTime();
      const difference = end - now;

      if (difference <= 0) {
        setTimeLeft('00:00:00');
        return;
      }

      const hours = Math.floor((difference / (1000 * 60 * 60)));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      const formattedHours = String(hours).padStart(2, '0');
      const formattedMinutes = String(minutes).padStart(2, '0');
      const formattedSeconds = String(seconds).padStart(2, '0');

      setTimeLeft(`${formattedHours}:${formattedMinutes}:${formattedSeconds}`);
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [auction.endDate, isFinished]);

  const categoryName = auction.categories?.[0]?.name || 'General';

  const formatUSD = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(val || 0);
  };

  return (
    <div className="group rounded-xl bg-[#111827] border border-[#1F2937] overflow-hidden flex flex-col justify-between transition-all duration-300 hover:border-[#2F8CFF]/50 hover:shadow-lg hover:shadow-black/40">
      <div>
        {/* Imagen en formato 16:9 con Badges superpuestos */}
        <div className="relative aspect-video w-full overflow-hidden bg-[#161f33]">
          {!imgError && auction.productImageUrl ? (
            <img
              src={auction.productImageUrl}
              alt={auction.productTitle}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#151c2e] to-[#0d121f] text-slate-500">
              <svg
                width="48"
                height="48"
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="opacity-40"
              >
                <rect x="28" y="52" width="11" height="44" rx="5.5" transform="rotate(-45 28 52)" fill="#2F8CFF" />
                <rect x="48" y="16" width="36" height="22" rx="7" transform="rotate(45 48 16)" fill="#2F8CFF" />
              </svg>
              <span className="text-xs text-slate-500 mt-2 font-medium">Sin imagen</span>
            </div>
          )}

          {/* Badge de Categoría (Superior Izquierda) */}
          <div className="absolute top-3 left-3 z-10">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-black/60 backdrop-blur-md text-slate-200 border border-white/10">
              <Tag size={12} className="text-[#2F8CFF]" />
              {categoryName}
            </span>
          </div>

          {/* Badge de Estado (Superior Derecha) */}
          <div className="absolute top-3 right-3 z-10">
            {isActive ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-[#2F8CFF]/20 text-[#2F8CFF] border border-[#2F8CFF]/40 backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-[#2F8CFF] animate-pulse" />
                En curso
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-[#374151]/80 text-[#9CA3AF] border border-[#4B5563]/50 backdrop-blur-md">
                Finalizada
              </span>
            )}
          </div>
        </div>

        {/* Cuerpo de la Tarjeta */}
        <div className="p-4 sm:p-5">
          {/* Título de la subasta */}
          <h3 className="text-lg font-semibold text-white line-clamp-1 group-hover:text-[#2F8CFF] transition-colors">
            {auction.productTitle || 'Subasta sin título'}
          </h3>

          {/* Fila de Oferta Actual y Countdown */}
          <div className="mt-4 pt-3 border-t border-[#1F2937] flex items-end justify-between">
            <div>
              <span className="text-xs text-slate-400 block font-normal">
                Oferta actual
              </span>
              <span className="text-xl font-bold text-white tracking-tight">
                {formatUSD(auction.currentBid || auction.basePrice)}
              </span>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400 block font-normal">
                Tiempo restante
              </span>
              <div className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-[#2F8CFF] mt-0.5">
                <Clock size={13} />
                <span>{timeLeft}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Botón Ver subasta */}
      <div className="p-4 sm:p-5 pt-0">
        <Button
          variant="primary"
          onClick={() => navigate(`/auction/${auction.id}`)}
          className="w-full text-sm font-medium py-2.5"
        >
          Ver subasta
        </Button>
      </div>
    </div>
  );
};
