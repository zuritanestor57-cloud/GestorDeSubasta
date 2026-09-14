using Domain.Entities;

namespace Aplicacion.DTOs
{
    public class WalletBalanceDto
    {
        public int WalletId { get; set; }
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public decimal TotalBalance { get; set; }
        public decimal HeldBalance { get; set; }
        public decimal AvailableBalance { get; set; }
        public int Version { get; set; }
    }

    public class DepositDto
    {
        public int UserId { get; set; }
        public decimal Amount { get; set; }
    }

    public class TransactionDto
    {
        public int Id { get; set; }
        public int WalletId { get; set; }
        public string Type { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
