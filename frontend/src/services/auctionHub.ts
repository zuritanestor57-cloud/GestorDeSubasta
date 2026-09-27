import { HubConnectionBuilder, HubConnectionState, LogLevel } from '@microsoft/signalr';
import { api } from './api.ts';
import type {
  AuctionEndedMessageDto,
  AuctionStartedMessageDto,
  BidPlacedMessageDto,
  TimeExtendedMessageDto,
} from '../types/index.ts';

export type HubConnectionStatus = 'connected' | 'reconnecting' | 'disconnected';

export interface AuctionHubHandlers {
  onBid?: (message: BidPlacedMessageDto) => void;
  onTimeExtended?: (message: TimeExtendedMessageDto) => void;
  onStarted?: (message: AuctionStartedMessageDto) => void;
  onEnded?: (message: AuctionEndedMessageDto) => void;
  // Cambios de estado de la conexión SignalR: sirve para el badge "En vivo" /
  // "Reconectando" y para activar un polling de respaldo mientras no hay
  // conexión (alternativa mínima que también acepta el TP).
  onConnectionStateChange?: (status: HubConnectionStatus) => void;
}

// Sala en vivo de una subasta: hub SignalR en /hubs/auction.
// Conecta, entra al grupo de la subasta y registra los handlers.
// Devuelve una función para salir de la sala y cerrar la conexión
// (llamarla en el cleanup del useEffect).
export async function joinAuctionRoom(
  auctionId: number,
  handlers: AuctionHubHandlers,
): Promise<() => Promise<void>> {
  const connection = new HubConnectionBuilder()
    .withUrl(`${api.defaults.baseURL}/hubs/auction`)
    .withAutomaticReconnect()
    .configureLogging(LogLevel.Warning)
    .build();

  connection.on('ReceiveBid', (m: BidPlacedMessageDto) => handlers.onBid?.(m));
  connection.on('ReceiveTimeExtension', (m: TimeExtendedMessageDto) => handlers.onTimeExtended?.(m));
  connection.on('ReceiveAuctionStarted', (m: AuctionStartedMessageDto) => handlers.onStarted?.(m));
  connection.on('ReceiveAuctionEnded', (m: AuctionEndedMessageDto) => handlers.onEnded?.(m));

  connection.onreconnecting(() => handlers.onConnectionStateChange?.('reconnecting'));

  // Tras una reconexión el servidor ya no tiene la conexión en el grupo.
  connection.onreconnected(() => {
    handlers.onConnectionStateChange?.('connected');
    void connection.invoke('JoinAuctionGroup', auctionId);
  });

  connection.onclose(() => handlers.onConnectionStateChange?.('disconnected'));

  await connection.start();
  await connection.invoke('JoinAuctionGroup', auctionId);
  handlers.onConnectionStateChange?.('connected');

  return async () => {
    if (connection.state === HubConnectionState.Connected) {
      await connection.invoke('LeaveAuctionGroup', auctionId);
    }
    await connection.stop();
  };
}
