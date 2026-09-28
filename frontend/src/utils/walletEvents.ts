// Evento global para sincronizar el saldo mostrado en el Sidebar con
// cualquier pantalla que mueva la billetera (hoy solo WalletPage), sin
// necesidad de un estado global ni recargar la página.
export const WALLET_UPDATED_EVENT = 'subastaya_wallet_updated';

export function notifyWalletUpdated(): void {
  window.dispatchEvent(new Event(WALLET_UPDATED_EVENT));
}
