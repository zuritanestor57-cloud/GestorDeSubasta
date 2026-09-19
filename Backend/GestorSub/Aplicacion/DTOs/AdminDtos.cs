namespace Aplicacion.DTOs
{
    public class CreateCategoryDto
    {
        public string Name { get; set; } = string.Empty;
    }

    public class ToggleUserStatusDto
    {
        public bool IsActive { get; set; }
        public string? Reason { get; set; }
    }

    public class ModerateAuctionDto
    {
        public string Reason { get; set; } = string.Empty;
    }

    public class AuditLogDto
    {
        public int Id { get; set; }
        public string Event { get; set; } = string.Empty;
        public string Details { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
    }

    public class AdminTransactionDto
    {
        public int Id { get; set; }
        public int WalletId { get; set; }
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
