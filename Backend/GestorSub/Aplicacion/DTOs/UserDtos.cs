using Domain.Entities;

namespace Aplicacion.DTOs
{
    public class UserDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;
        public int WalletId { get; set; }
        public decimal TotalBalance { get; set; }
        public decimal HeldBalance { get; set; }
        public decimal AvailableBalance { get; set; }
    }

    public class CreateUserDto
    {
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public UserRole Role { get; set; } = UserRole.Buyer;
    }

    public class UpdateUserDto
    {
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? Password { get; set; }
        public UserRole? Role { get; set; }
    }

    public class LoginDto
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class LoginResultDto
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public UserDto? User { get; set; }
    }

    public class UserBidSummaryDto
    {
        public int AuctionId { get; set; }
        public string ProductTitle { get; set; } = string.Empty;
        public string ProductImageUrl { get; set; } = string.Empty;
        public decimal MyHighestBid { get; set; }
        public decimal CurrentHighestBid { get; set; }
        public bool IsLeading { get; set; }
        public string AuctionStatus { get; set; } = string.Empty;
        public string ParticipationStatus { get; set; } = string.Empty; // "Liderando", "Superado", "Ganada", "Perdida"
        public DateTime EndDate { get; set; }
    }

    public class UserAuctionSummaryDto
    {
        public int AuctionId { get; set; }
        public string ProductTitle { get; set; } = string.Empty;
        public string ProductImageUrl { get; set; } = string.Empty;
        public decimal BasePrice { get; set; }
        public decimal CurrentBid { get; set; }
        public int TotalBidsCount { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
    }

    public class UserDashboardDto
    {
        public UserDto UserInfo { get; set; } = new();
        public int ActiveAuctionsCreatedCount { get; set; }
        public int TotalAuctionsCreatedCount { get; set; }
        public int ActiveBidsCount { get; set; }
        public int WonAuctionsCount { get; set; }
        public List<UserAuctionSummaryDto> MyCreatedAuctions { get; set; } = new();
        public List<UserBidSummaryDto> MyBids { get; set; } = new();
        public List<UserAuctionSummaryDto> MyWonAuctions { get; set; } = new();
    }
}
