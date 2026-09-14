using Aplicacion.DTOs;

namespace Aplicacion.Interfaces
{
    public interface IWalletService
    {
        /// <summary>
        /// Obtiene el desglose de saldos (Total, Retenido, Disponible) de la billetera de un usuario (RF-31, RF-32).
        /// </summary>
        Task<WalletBalanceDto?> GetBalanceByUserIdAsync(int userId);

        /// <summary>
        /// Acredita saldo en la billetera virtual mediante depósito simulado y registra la transacción (RF-30).
        /// </summary>
        Task<WalletBalanceDto> DepositAsync(DepositDto depositDto);

        /// <summary>
        /// Obtiene el historial cronológico de movimientos contables/transacciones de la billetera (RF-36).
        /// </summary>
        Task<IEnumerable<TransactionDto>> GetTransactionsByUserIdAsync(int userId);

        /// <summary>
        /// Congela fondos en garantía (escrow) al realizar una puja válida (RF-33).
        /// </summary>
        Task HoldFundsAsync(int userId, decimal amount);

        /// <summary>
        /// Libera fondos retenidos cuando una oferta es superada por otra (RF-34).
        /// </summary>
        Task ReleaseFundsAsync(int userId, decimal amount);

        /// <summary>
        /// Transfiere los fondos retenidos del comprador al vendedor al finalizar exitosamente la subasta (RF-35).
        /// </summary>
        Task TransferFundsAsync(int buyerUserId, int sellerUserId, decimal amount);
    }
}
