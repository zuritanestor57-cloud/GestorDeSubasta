using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class Transaction
    {
        public int Id { get; set; }
        public TransactionType Type { get; set; }
        public decimal Amount { get; set; }
        public DateTime CreatedAt { get; set; }

        public int WalletId { get; set; }
        public Wallet Wallet { get; set; }

        // Nullable: solo las transacciones originadas por una subasta (retención,
        // liberación, pago, cobro de venta) la tienen. Un depósito manual no.
        public int? AuctionId { get; set; }
        public Auction? Auction { get; set; }

    }

    public enum TransactionType
    {
        Deposit,
        Withdrawal,
        Payment,
        Refund,
        Hold,
        Release,
        // Acreditación al vendedor tras una venta (TransferFundsAsync), distinta
        // de un Deposit manual aunque ambas sumen saldo disponible.
        SaleProceeds
    }
}
