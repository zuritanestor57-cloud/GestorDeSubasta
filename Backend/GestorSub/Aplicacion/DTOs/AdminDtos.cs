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
        // Id del administrador logueado que ejecuta la acción (no hay JWT: lo
        // manda el frontend explícito, igual que en el resto de la API).
        public int AdminUserId { get; set; }
    }

    public class ModerateAuctionDto
    {
        public string Reason { get; set; } = string.Empty;
        public int AdminUserId { get; set; }
    }

    public class AuditLogDto
    {
        public int Id { get; set; }
        public string Event { get; set; } = string.Empty;
        public string Details { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public int? AuctionId { get; set; }
        public string? AuctionTitle { get; set; }
        public string? Reason { get; set; }
        public int? AdminUserId { get; set; }
        public string? AdminUserName { get; set; }
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
        // Null en depósitos manuales; presente si el movimiento lo originó una subasta.
        public int? AuctionId { get; set; }
        public string? AuctionTitle { get; set; }
    }
}
